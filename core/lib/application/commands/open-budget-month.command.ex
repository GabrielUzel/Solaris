defmodule SolarisCore.Application.Commands.OpenBudgetMonth do
  alias SolarisCore.Finance.Domain.BudgetMonth
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo

  @spec execute(integer(), integer()) :: {:ok, BudgetMonth.t()} | {:error, term()}
  def execute(year, month) do
    case BudgetMonthRepo.get_by_reference(year, month) do
      {:ok, existing} ->
        {:ok, existing}

      {:error, :not_found} ->
        create_budget_month(year, month)
    end
  end

  defp create_budget_month(year, month) do
    starts_on = Date.new!(year, month, 1)
    ends_on = Date.end_of_month(starts_on)

    attrs = %{
      id: Ecto.UUID.generate(),
      reference_year: year,
      reference_month: month,
      starts_on: starts_on,
      ends_on: ends_on,
      initialized_at: DateTime.utc_now()
    }

    with {:ok, budget_month} <- BudgetMonth.new(attrs) do
      BudgetMonthRepo.create(budget_month)
    end
  end
end
