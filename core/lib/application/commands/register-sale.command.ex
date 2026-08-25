defmodule SolarisCore.Application.Commands.RegisterSale do
  alias Ecto.UUID
  alias SolarisCore.Finance.Domain.Investment
  alias SolarisCore.Finance.Domain.InvestmentTransaction
  alias SolarisCore.Finance.Domain.InvestmentRules
  alias SolarisCore.Infrastructure.Repositories.InvestmentRepo
  alias SolarisCore.Infrastructure.Repositories.InvestmentTransactionRepo

  @sale_types [:partial_sell, :full_sell]

  @spec execute(map()) :: {:ok, Investment.t()} | {:error, term()}
  def execute(attrs) do
    with {:ok, investment} <- InvestmentRepo.get(attrs[:investment_id]),
         :ok <- ensure_open(investment),
         {:ok, sale_type} <- validate_sale_type(attrs[:sale_type]),
         {:ok, quantity} <- normalize_quantity(attrs[:quantity]),
         {:ok, unit_price_cents} <- validate_unit_price_cents(attrs[:unit_price_cents]),
         transactions <- InvestmentTransactionRepo.list_by_investment(investment.id),
         available <- InvestmentRules.current_quantity(transactions),
         :ok <- InvestmentRules.validate_sale_quantity(available, quantity),
         {:ok, transaction} <-
           build_sale_transaction(investment, attrs, sale_type, quantity, unit_price_cents),
         {:ok, updated} <-
           InvestmentRepo.register_sale(
             transaction,
             close_attrs(quantity, attrs, available, sale_type)
           ) do
      {:ok, updated}
    end
  end

  defp ensure_open(%Investment{status: :open}), do: :ok
  defp ensure_open(%Investment{}), do: {:error, :investment_closed}

  defp validate_sale_type(sale_type) when sale_type in @sale_types, do: {:ok, sale_type}
  defp validate_sale_type(_), do: {:error, :invalid_sale_type}

  defp normalize_quantity(%Decimal{} = quantity), do: {:ok, quantity}
  defp normalize_quantity(quantity) when is_integer(quantity), do: {:ok, Decimal.new(quantity)}

  defp normalize_quantity(quantity) when is_binary(quantity) do
    case Decimal.parse(quantity) do
      {decimal, ""} -> {:ok, decimal}
      _ -> {:error, :invalid_quantity}
    end
  end

  defp normalize_quantity(_), do: {:error, :invalid_quantity}

  defp validate_unit_price_cents(price) when is_integer(price) and price > 0, do: {:ok, price}
  defp validate_unit_price_cents(_), do: {:error, :invalid_unit_price_cents}

  defp build_sale_transaction(
         %Investment{} = investment,
         attrs,
         sale_type,
         quantity,
         unit_price_cents
       ) do
    InvestmentTransaction.new(%{
      id: UUID.generate(),
      investment_id: investment.id,
      transaction_type: sale_type,
      input_currency: :BRL,
      amount_invested_cents: sale_proceeds_cents(quantity, unit_price_cents),
      quantity: quantity,
      unit_price_cents: unit_price_cents,
      transaction_date: attrs[:transaction_date],
      fees_cents: attrs[:fees_cents] || 0,
      notes: attrs[:notes]
    })
  end

  defp sale_proceeds_cents(%Decimal{} = quantity, unit_price_cents)
       when is_integer(unit_price_cents) do
    quantity
    |> Decimal.mult(Decimal.new(unit_price_cents))
    |> Decimal.round(0, :half_up)
    |> Decimal.to_integer()
  end

  defp close_attrs(quantity, attrs, available, sale_type) do
    zeroes_position? = Decimal.compare(quantity, available) == :eq

    if sale_type == :full_sell or zeroes_position? do
      %{status: :closed, closed_at: attrs[:transaction_date]}
    else
      nil
    end
  end
end
