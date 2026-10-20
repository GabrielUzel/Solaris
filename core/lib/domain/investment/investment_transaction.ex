defmodule SolarisCore.Finance.Domain.InvestmentTransaction do
  @enforce_keys [:id, :investment_id, :transaction_type, :amount_invested_cents, :transaction_date]
  defstruct [
    :id,
    :investment_id,
    :transaction_type,
    :input_currency,
    :amount_invested_cents,
    :exchange_rate_used,
    :amount_invested_usd_cents,
    :quantity,
    :unit_price_cents,
    :transaction_date,
    :fees_cents,
    :notes,
    :created_at,
    :updated_at
  ]

  @type t :: %__MODULE__{
          id: binary(),
          investment_id: binary(),
          transaction_type: :buy | :reinvestment | :partial_sell | :full_sell | :redemption,
          input_currency: :BRL,
          amount_invested_cents: integer(),
          exchange_rate_used: Decimal.t() | nil,
          amount_invested_usd_cents: integer() | nil,
          quantity: Decimal.t() | nil,
          unit_price_cents: integer() | nil,
          transaction_date: Date.t(),
          fees_cents: integer() | nil,
          notes: String.t() | nil,
          created_at: term() | nil,
          updated_at: term() | nil
        }

  @transaction_types [:buy, :reinvestment, :partial_sell, :full_sell, :redemption]
  @entry_types [:buy, :reinvestment]
  @exit_types [:partial_sell, :full_sell, :redemption]

  def entry_types, do: @entry_types
  def exit_types, do: @exit_types

  def new(attrs) do
    attrs = Map.put_new(attrs, :input_currency, :BRL)

    with :ok <- validate_transaction_type(attrs[:transaction_type]),
         :ok <- validate_input_currency(attrs[:input_currency]),
         :ok <- validate_amount_invested_cents(attrs[:amount_invested_cents]),
         :ok <- validate_quantity(attrs[:quantity]),
         :ok <- validate_unit_price_cents(attrs[:unit_price_cents]),
         :ok <- validate_exchange_rate_used(attrs[:exchange_rate_used]),
         :ok <- validate_amount_invested_usd_cents(attrs[:amount_invested_usd_cents]),
         :ok <- validate_transaction_date(attrs[:transaction_date]),
         :ok <- validate_fees_cents(attrs[:fees_cents]) do
      {:ok, struct!(__MODULE__, attrs)}
    end
  end

  def entry?(%__MODULE__{transaction_type: type}) when type in @entry_types, do: true
  def entry?(%__MODULE__{}), do: false

  def exit?(%__MODULE__{transaction_type: type}) when type in @exit_types, do: true
  def exit?(%__MODULE__{}), do: false

  defp validate_transaction_type(type) when type in @transaction_types, do: :ok
  defp validate_transaction_type(_), do: {:error, :invalid_transaction_type}

  defp validate_input_currency(:BRL), do: :ok
  defp validate_input_currency(_), do: {:error, :input_currency_must_be_brl}

  defp validate_amount_invested_cents(amount) when is_integer(amount) and amount > 0, do: :ok
  defp validate_amount_invested_cents(_), do: {:error, :amount_invested_cents_must_be_positive}

  defp validate_quantity(nil), do: :ok

  defp validate_quantity(%Decimal{} = quantity) do
    if Decimal.compare(quantity, 0) == :gt, do: :ok, else: {:error, :quantity_must_be_positive}
  end

  defp validate_quantity(_), do: {:error, :quantity_must_be_decimal}

  defp validate_unit_price_cents(nil), do: :ok

  defp validate_unit_price_cents(price) when is_integer(price) and price > 0, do: :ok

  defp validate_unit_price_cents(_), do: {:error, :unit_price_cents_must_be_positive}

  defp validate_exchange_rate_used(nil), do: :ok

  defp validate_exchange_rate_used(%Decimal{} = rate) do
    if Decimal.compare(rate, 0) == :gt, do: :ok, else: {:error, :exchange_rate_must_be_positive}
  end

  defp validate_exchange_rate_used(_), do: {:error, :exchange_rate_must_be_decimal}

  defp validate_amount_invested_usd_cents(nil), do: :ok

  defp validate_amount_invested_usd_cents(amount) when is_integer(amount) and amount > 0,
    do: :ok

  defp validate_amount_invested_usd_cents(_),
    do: {:error, :amount_invested_usd_cents_must_be_positive}

  defp validate_transaction_date(%Date{}), do: :ok
  defp validate_transaction_date(_), do: {:error, :transaction_date_required}

  defp validate_fees_cents(nil), do: :ok
  defp validate_fees_cents(fees) when is_integer(fees) and fees >= 0, do: :ok
  defp validate_fees_cents(_), do: {:error, :fees_cents_must_be_non_negative}
end
