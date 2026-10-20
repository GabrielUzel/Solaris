defmodule SolarisCore.Finance.Domain.InvestmentRules do
  alias SolarisCore.Finance.Domain.InvestmentTransaction

  @entry_types InvestmentTransaction.entry_types()
  @exit_types InvestmentTransaction.exit_types()

  @spec average_price_cents([InvestmentTransaction.t()]) :: integer()
  def average_price_cents(transactions) do
    {weighted_sum, total_quantity} =
      transactions
      |> Enum.filter(&InvestmentTransaction.entry?/1)
      |> Enum.filter(&(not is_nil(&1.quantity) and not is_nil(&1.unit_price_cents)))
      |> Enum.reduce({Decimal.new(0), Decimal.new(0)}, fn transaction, {sum, quantity} ->
        price = Decimal.new(transaction.unit_price_cents)

        {
          Decimal.add(sum, Decimal.mult(transaction.quantity, price)),
          Decimal.add(quantity, transaction.quantity)
        }
      end)

    if Decimal.compare(total_quantity, 0) == :gt do
      weighted_sum
      |> Decimal.div(total_quantity)
      |> Decimal.round(0, :half_up)
      |> Decimal.to_integer()
    else
      0
    end
  end

  @spec current_quantity([InvestmentTransaction.t()]) :: Decimal.t()
  def current_quantity(transactions) do
    Enum.reduce(transactions, Decimal.new(0), fn
      %InvestmentTransaction{quantity: nil}, acc ->
        acc

      %InvestmentTransaction{transaction_type: type, quantity: quantity}, acc
      when type in @entry_types ->
        Decimal.add(acc, quantity)

      %InvestmentTransaction{transaction_type: type, quantity: quantity}, acc
      when type in @exit_types ->
        Decimal.sub(acc, quantity)
    end)
  end

  @spec total_invested_cents([InvestmentTransaction.t()]) :: integer()
  def total_invested_cents(transactions) do
    {invested, _quantity, _average_cost} =
      transactions
      |> sort_chronologically()
      |> Enum.reduce({Decimal.new(0), Decimal.new(0), Decimal.new(0)}, &apply_transaction/2)

    invested
    |> Decimal.round(0, :half_up)
    |> Decimal.to_integer()
  end

  @spec validate_sale_quantity(available :: Decimal.t(), requested :: Decimal.t()) ::
          :ok | {:error, :insufficient_quantity}
  def validate_sale_quantity(%Decimal{} = available, %Decimal{} = requested) do
    case Decimal.compare(requested, available) do
      :gt -> {:error, :insufficient_quantity}
      _ -> :ok
    end
  end

  @spec convert_brl_to_usd_cents(amount_brl_cents :: integer(), exchange_rate :: Decimal.t()) ::
          integer()
  def convert_brl_to_usd_cents(amount_brl_cents, %Decimal{} = exchange_rate)
      when is_integer(amount_brl_cents) and amount_brl_cents > 0 do
    amount_brl_cents
    |> Decimal.new()
    |> Decimal.div(exchange_rate)
    |> Decimal.round(0, :half_up)
    |> Decimal.to_integer()
  end

  defp sort_chronologically(transactions) do
    Enum.sort(transactions, fn a, b ->
      Date.compare(a.transaction_date, b.transaction_date) != :gt
    end)
  end

  defp apply_transaction(%InvestmentTransaction{} = transaction, {invested, quantity, avg_cost}) do
    cond do
      InvestmentTransaction.entry?(transaction) ->
        new_invested = Decimal.add(invested, Decimal.new(transaction.amount_invested_cents))
        new_quantity = Decimal.add(quantity, transaction.quantity || Decimal.new(0))

        new_avg_cost =
          if Decimal.compare(new_quantity, 0) == :gt,
            do: Decimal.div(new_invested, new_quantity),
            else: Decimal.new(0)

        {new_invested, new_quantity, new_avg_cost}

      InvestmentTransaction.exit?(transaction) and not is_nil(transaction.quantity) ->
        cost_removed = Decimal.mult(transaction.quantity, avg_cost)

        {
          Decimal.sub(invested, cost_removed),
          Decimal.sub(quantity, transaction.quantity),
          avg_cost
        }

      InvestmentTransaction.exit?(transaction) ->
        {Decimal.sub(invested, Decimal.new(transaction.amount_invested_cents)), quantity,
         avg_cost}
    end
  end
end
