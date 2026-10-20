defmodule SolarisCore.Finance.Domain.DividendIncome do
  @enforce_keys [
    :id,
    :investment_id,
    :income_type,
    :gross_amount_cents,
    :net_amount_cents,
    :payment_date
  ]
  defstruct [
    :id,
    :investment_id,
    :income_type,
    :gross_amount_cents,
    :net_amount_cents,
    :payment_date,
    :reinvested_transaction_id
  ]

  @type t :: %__MODULE__{
          id: binary(),
          investment_id: binary(),
          income_type: :dividend | :jcp | :fii_income | :fixed_income_interest,
          gross_amount_cents: integer(),
          net_amount_cents: integer(),
          payment_date: Date.t(),
          reinvested_transaction_id: binary() | nil
        }

  @income_types [:dividend, :jcp, :fii_income, :fixed_income_interest]

  def new(attrs) do
    with :ok <- validate_income_type(attrs[:income_type]),
         :ok <- validate_gross_amount(attrs[:gross_amount_cents]),
         :ok <- validate_net_amount(attrs[:net_amount_cents]),
         :ok <- validate_net_not_greater_than_gross(attrs[:gross_amount_cents], attrs[:net_amount_cents]),
         :ok <- validate_payment_date(attrs[:payment_date]) do
      {:ok, struct!(__MODULE__, attrs)}
    end
  end

  defp validate_income_type(type) when type in @income_types, do: :ok
  defp validate_income_type(_), do: {:error, :invalid_income_type}

  defp validate_gross_amount(amount) when is_integer(amount) and amount > 0, do: :ok
  defp validate_gross_amount(_), do: {:error, :gross_amount_cents_must_be_positive}

  defp validate_net_amount(amount) when is_integer(amount) and amount >= 0, do: :ok
  defp validate_net_amount(_), do: {:error, :net_amount_cents_must_be_non_negative}

  defp validate_net_not_greater_than_gross(gross, net)
       when is_integer(gross) and is_integer(net) and net > gross,
       do: {:error, :net_amount_cannot_exceed_gross}

  defp validate_net_not_greater_than_gross(_, _), do: :ok

  defp validate_payment_date(%Date{}), do: :ok
  defp validate_payment_date(_), do: {:error, :payment_date_required}
end
