defmodule SolarisCore.Infrastructure.MarketData.PriceConverter do
  @spec to_cents(number() | String.t() | Decimal.t() | nil) :: integer() | nil
  def to_cents(nil), do: nil
  def to_cents(value) when is_integer(value), do: value * 100
  def to_cents(value) when is_float(value), do: value |> Decimal.from_float() |> to_cents()

  def to_cents(value) when is_binary(value) do
    case Decimal.parse(value) do
      {decimal, ""} -> to_cents(decimal)
      _invalid -> nil
    end
  end

  def to_cents(%Decimal{} = value) do
    value
    |> Decimal.mult(100)
    |> Decimal.round(0, :half_up)
    |> Decimal.to_integer()
  end

  @spec to_decimal(number() | String.t() | Decimal.t() | nil) :: Decimal.t() | nil
  def to_decimal(nil), do: nil
  def to_decimal(%Decimal{} = value), do: Decimal.round(value, 6, :half_up)
  def to_decimal(value) when is_integer(value), do: Decimal.new(value)
  def to_decimal(value) when is_float(value), do: value |> Decimal.from_float() |> to_decimal()

  def to_decimal(value) when is_binary(value) do
    case Decimal.parse(value) do
      {decimal, ""} -> to_decimal(decimal)
      _invalid -> nil
    end
  end
end
