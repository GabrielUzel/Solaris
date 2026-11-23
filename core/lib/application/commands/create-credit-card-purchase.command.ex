defmodule SolarisCore.Application.Commands.CreateCreditCardPurchase do
  alias SolarisCore.Finance.Domain.BudgetMonth.Transaction
  alias SolarisCore.Finance.Domain.CategoryCompatibilityPolicy
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo
  alias SolarisCore.Infrastructure.Repositories.CategoryRepo
  alias SolarisCore.Infrastructure.Repositories.CreditCardRepo
  alias SolarisCore.Infrastructure.Repositories.TransactionRepo

  @spec execute(map()) :: {:ok, [Transaction.t()]} | {:error, term()}
  def execute(attrs) do
    with {:ok, card} <- fetch_active_card(attrs[:credit_card_id]),
         {:ok, category} <- fetch_category(attrs[:category_id]),
         :ok <- CategoryCompatibilityPolicy.validate_compatibility(category, :expense),
         :ok <- validate_purchased_on(attrs[:purchased_on]),
         :ok <- validate_total_amount(attrs[:total_amount]),
         {:ok, installments_total} <- resolve_installments_total(attrs[:installments_total]),
         {:ok, amounts} <- resolve_installment_amounts(attrs, installments_total),
         {:ok, transactions} <- build_transactions(attrs, card, installments_total, amounts),
         {:ok, _inserted} <-
           TransactionRepo.insert_many(Enum.map(transactions, &to_schema_attrs/1)) do
      {:ok, transactions}
    end
  end

  defp fetch_active_card(id) when is_binary(id) do
    case String.trim(id) do
      "" -> {:error, :credit_card_required}
      card_id -> fetch_card(card_id)
    end
  end

  defp fetch_active_card(_id), do: {:error, :credit_card_required}

  defp fetch_card(id) do
    with {:ok, card} <- map_card_not_found(CreditCardRepo.get(id)) do
      if card.active, do: {:ok, card}, else: {:error, :credit_card_inactive}
    end
  end

  defp map_card_not_found({:error, :not_found}), do: {:error, :credit_card_not_found}
  defp map_card_not_found(result), do: result

  defp fetch_category(id) when is_binary(id) do
    case String.trim(id) do
      "" -> {:error, :category_required}
      category_id -> get_category(category_id)
    end
  end

  defp fetch_category(_id), do: {:error, :category_required}

  defp get_category(id) do
    case CategoryRepo.get(id) do
      {:error, :not_found} -> {:error, :category_not_found}
      result -> result
    end
  end

  defp validate_purchased_on(%Date{}), do: :ok
  defp validate_purchased_on(_), do: {:error, :occurred_on_required}

  defp validate_total_amount(amount) when is_integer(amount) and amount > 0, do: :ok
  defp validate_total_amount(_), do: {:error, :expected_amount_must_be_positive_integer}

  defp resolve_installments_total(nil), do: {:ok, 1}

  defp resolve_installments_total(total) when is_integer(total) and total >= 1, do: {:ok, total}

  defp resolve_installments_total(_), do: {:error, :invalid_installments_total}

  defp resolve_installment_amounts(attrs, installments_total) do
    case Map.get(attrs, :installment_amounts) do
      amounts when is_list(amounts) ->
        with :ok <- validate_amounts(amounts, installments_total),
             :ok <-
               validate_amounts_sum(
                 amounts,
                 attrs[:total_amount],
                 attrs[:confirm_amount_mismatch]
               ) do
          {:ok, amounts}
        end

      _ ->
        {:ok, split_amount(attrs[:total_amount], installments_total)}
    end
  end

  defp validate_amounts(amounts, installments_total) do
    valid? =
      length(amounts) == installments_total and
        Enum.all?(amounts, &(is_integer(&1) and &1 > 0))

    if valid?, do: :ok, else: {:error, :invalid_installment_amounts}
  end

  defp validate_amounts_sum(_amounts, _total_amount, true), do: :ok

  defp validate_amounts_sum(amounts, total_amount, _confirm) do
    if Enum.sum(amounts) == total_amount, do: :ok, else: {:error, :installments_amount_mismatch}
  end

  # As primeiras `remainder` parcelas absorvem o resto da divisão para somar o total exato.
  defp split_amount(total_amount, installments_total) do
    base = div(total_amount, installments_total)
    remainder = rem(total_amount, installments_total)

    1..installments_total
    |> Enum.map(fn index -> if index <= remainder, do: base + 1, else: base end)
  end

  defp build_transactions(attrs, card, installments_total, amounts) do
    group_id = if installments_total > 1, do: Ecto.UUID.generate(), else: nil

    amounts
    |> Enum.with_index(1)
    |> Enum.reduce_while({:ok, []}, fn {amount, index}, {:ok, acc} ->
      case build_transaction(attrs, card, installments_total, group_id, amount, index) do
        {:ok, transaction} -> {:cont, {:ok, [transaction | acc]}}
        error -> {:halt, error}
      end
    end)
    |> case do
      {:ok, transactions} -> {:ok, Enum.reverse(transactions)}
      error -> error
    end
  end

  defp build_transaction(attrs, card, installments_total, group_id, amount, index) do
    transaction_attrs = %{
      id: Ecto.UUID.generate(),
      description: installment_description(attrs[:description], index, installments_total),
      expected_amount: amount,
      actual_amount: nil,
      type: :expense,
      category_id: attrs[:category_id],
      payment_method: :credit_card,
      occurred_on: installment_occurred_on(attrs[:purchased_on], index),
      origin: :manual,
      status: :expected,
      notes: attrs[:notes],
      credit_card_id: card.id,
      installment_group_id: group_id,
      installment_number: index,
      installments_total: installments_total,
      purchased_on: attrs[:purchased_on]
    }

    Transaction.new(transaction_attrs)
  end

  defp installment_description(description, 1, 1), do: description

  defp installment_description(description, index, total),
    do: "#{description} — #{index}/#{total}"

  defp installment_occurred_on(%Date{} = purchased_on, 1), do: purchased_on

  defp installment_occurred_on(%Date{} = purchased_on, index) do
    target_month = shift_months(purchased_on, index - 1)
    day = min(purchased_on.day, Date.days_in_month(target_month))
    Date.new!(target_month.year, target_month.month, day)
  end

  defp shift_months(%Date{year: year, month: month}, offset) do
    total_months = year * 12 + (month - 1) + offset
    Date.new!(div(total_months, 12), rem(total_months, 12) + 1, 1)
  end

  defp to_schema_attrs(%Transaction{} = transaction) do
    transaction
    |> Map.from_struct()
    |> Map.put(:budget_month_id, budget_month_id_for(transaction.occurred_on))
  end

  defp budget_month_id_for(%Date{year: year, month: month}) do
    case BudgetMonthRepo.get_by_reference(year, month) do
      {:ok, budget_month} -> budget_month.id
      {:error, :not_found} -> nil
    end
  end
end
