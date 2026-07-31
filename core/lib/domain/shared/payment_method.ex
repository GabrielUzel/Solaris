defmodule SolarisCore.Finance.Domain.PaymentMethod do
  @values [:pix, :bank_transfer, :boleto, :credit_card, :debit_card]

  def values, do: @values

  def valid?(value) when value in @values, do: true
  def valid?(_), do: false

  def validate(value) when value in @values, do: :ok
  def validate(_), do: {:error, :invalid_payment_method}
end
