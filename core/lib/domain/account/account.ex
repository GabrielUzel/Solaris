defmodule SolarisCore.Finance.Domain.Account do
  defstruct [:id, :name, :type, :inserted_at, :updated_at]

  @account_types [:checking, :savings, :cash, :credit_card, :investment]

  def new(attrs) do
    with :ok <- validate_type(attrs[:type]) do
      {:ok, struct!(__MODULE__, attrs)}
    end
  end

  defp validate_type(type) when type in @account_types, do: :ok
  defp validate_type(_), do: {:error, :invalid_account_type}
end
