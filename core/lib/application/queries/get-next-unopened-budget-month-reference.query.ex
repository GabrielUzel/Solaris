defmodule SolarisCore.Application.Queries.GetNextUnopenedBudgetMonthReference do
  alias SolarisCore.Infrastructure.Repositories.BudgetMonthRepo

  # Limite de segurança para evitar busca indefinida de meses à frente.
  @max_months_ahead 24

  @spec execute() :: {:ok, %{year: integer(), month: integer()} | nil}
  def execute do
    today = Date.utc_today()
    find_next_unopened(today.year, today.month, 1)
  end

  defp find_next_unopened(_year, _month, offset) when offset > @max_months_ahead, do: {:ok, nil}

  defp find_next_unopened(year, month, offset) do
    {reference_year, reference_month} = shift_months(year, month, offset)

    if BudgetMonthRepo.exists_by_reference?(reference_year, reference_month) do
      find_next_unopened(year, month, offset + 1)
    else
      {:ok, %{year: reference_year, month: reference_month}}
    end
  end

  defp shift_months(year, month, offset) do
    total_months = year * 12 + (month - 1) + offset
    {div(total_months, 12), rem(total_months, 12) + 1}
  end
end
