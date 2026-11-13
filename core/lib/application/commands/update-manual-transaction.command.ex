defmodule SolarisCore.Application.Commands.UpdateManualTransaction do
  alias SolarisCore.Finance.Domain.BudgetMonth
  alias SolarisCore.Finance.Domain.BudgetMonth.Transaction
  alias SolarisCore.Finance.Domain.CategoryCompatibilityPolicy
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo
  alias SolarisCore.Infrastructure.Repositories.CategoryRepo
  alias SolarisCore.Infrastructure.Repositories.CreditCardRepo
  alias SolarisCore.Infrastructure.Repositories.TransactionRepo

  @spec execute(String.t(), String.t(), map()) :: {:ok, term()} | {:error, term()}
  def execute(budget_month_id, transaction_id, attrs) do
    with {:ok, budget_month} <- BudgetMonthRepo.get(budget_month_id),
         {:ok, existing_transaction} <- fetch_transaction(budget_month, transaction_id),
         {:ok, category} <- fetch_category_if_present(attrs),
         :ok <- validate_category_compatibility(category, attrs, existing_transaction),
         {:ok, merged} <- build_transaction_attrs(existing_transaction, attrs),
         {:ok, updated_transaction} <- Transaction.new(merged),
         {:ok, updated_budget_month} <-
           replace_transaction(budget_month, transaction_id, updated_transaction),
         {:ok, updated} <- BudgetMonthRepo.update(updated_budget_month) do
      maybe_move_installment_group(existing_transaction, attrs)
      {:ok, updated}
    end
  end

  defp fetch_transaction(%BudgetMonth{transactions: transactions}, transaction_id) do
    case Enum.find(transactions, &(&1.id == transaction_id)) do
      nil -> {:error, :transaction_not_found}
      %Transaction{} = transaction -> {:ok, transaction}
    end
  end

  defp fetch_category_if_present(%{category_id: id}) when is_binary(id) do
    case String.trim(id) do
      "" -> {:ok, nil}
      category_id -> fetch_category(category_id)
    end
  end

  defp fetch_category_if_present(%{category_id: id}) when not is_nil(id), do: fetch_category(id)
  defp fetch_category_if_present(_attrs), do: {:ok, nil}

  defp fetch_category(id) do
    case CategoryRepo.get(id) do
      {:error, :not_found} -> {:error, :category_not_found}
      result -> result
    end
  end

  defp validate_category_compatibility(nil, _attrs, _existing_transaction), do: :ok

  defp validate_category_compatibility(category, attrs, existing_transaction) do
    type = Map.get(attrs, :type, existing_transaction.type)
    CategoryCompatibilityPolicy.validate_compatibility(category, type)
  end

  defp build_transaction_attrs(existing_transaction, attrs) do
    attrs =
      attrs
      |> drop_blank_category()
      |> drop_blank_credit_card()

    merged =
      existing_transaction
      |> Map.from_struct()
      |> Map.merge(attrs)
      |> Map.put(:origin, :manual)

    normalize_credit_card_fields(merged, existing_transaction, attrs)
  end

  # Categoria em branco no update significa "manter a atual", não apagar.
  defp drop_blank_category(%{category_id: id} = attrs) when is_binary(id) do
    if String.trim(id) == "", do: Map.delete(attrs, :category_id), else: attrs
  end

  defp drop_blank_category(attrs), do: attrs

  # Cartão em branco no update também significa "manter o atual".
  defp drop_blank_credit_card(%{credit_card_id: id} = attrs) when is_binary(id) do
    if String.trim(id) == "", do: Map.delete(attrs, :credit_card_id), else: attrs
  end

  defp drop_blank_credit_card(attrs), do: attrs

  defp normalize_credit_card_fields(merged, existing_transaction, attrs) do
    case merged[:payment_method] do
      :credit_card -> normalize_credit_card_payment(merged, existing_transaction, attrs)
      _ -> {:ok, clear_credit_card_fields(merged)}
    end
  end

  defp clear_credit_card_fields(merged) do
    Map.merge(merged, %{
      credit_card_id: nil,
      installment_group_id: nil,
      installment_number: nil,
      installments_total: nil,
      purchased_on: nil
    })
  end

  defp normalize_credit_card_payment(merged, existing_transaction, attrs) do
    requested = Map.get(attrs, :credit_card_id)

    cond do
      is_binary(requested) and requested != existing_transaction.credit_card_id ->
        apply_new_card(merged, existing_transaction, requested)

      is_binary(existing_transaction.credit_card_id) ->
        {:ok, merged}

      existing_transaction.payment_method != :credit_card ->
        {:error, :credit_card_required}

      true ->
        {:ok, merged}
    end
  end

  defp apply_new_card(merged, existing_transaction, requested) do
    with {:ok, card} <- fetch_credit_card(requested),
         :ok <- ensure_card_active(card) do
      merged = Map.put(merged, :credit_card_id, card.id)

      if is_binary(existing_transaction.installment_group_id) do
        {:ok, merged}
      else
        {:ok,
         Map.merge(merged, %{
           installment_number: 1,
           installments_total: 1,
           installment_group_id: nil,
           purchased_on: existing_transaction.purchased_on || merged[:occurred_on]
         })}
      end
    end
  end

  defp fetch_credit_card(id) do
    case CreditCardRepo.get(id) do
      {:error, :not_found} -> {:error, :credit_card_not_found}
      result -> result
    end
  end

  defp ensure_card_active(card) do
    if card.active, do: :ok, else: {:error, :credit_card_inactive}
  end

  defp maybe_move_installment_group(existing_transaction, attrs) do
    group_id = existing_transaction.installment_group_id
    requested = Map.get(drop_blank_credit_card(attrs), :credit_card_id)

    if is_binary(group_id) and is_binary(requested) and
         requested != existing_transaction.credit_card_id do
      TransactionRepo.update_installment_group_card(group_id, requested)
    end
  end

  defp replace_transaction(%BudgetMonth{} = budget_month, transaction_id, updated_transaction) do
    updated_transactions =
      Enum.map(budget_month.transactions, fn transaction ->
        if transaction.id == transaction_id, do: updated_transaction, else: transaction
      end)

    {:ok, %{budget_month | transactions: updated_transactions}}
  end
end
