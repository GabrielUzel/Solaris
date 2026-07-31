defmodule SolarisCoreWeb.Api.Mutations.BudgetMonthMutations do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.BudgetMonthResolver

  object :budget_month_mutations do
    field :open_budget_month, non_null(:budget_month) do
      arg :year, non_null(:integer)
      arg :month, non_null(:integer)
      resolve(&BudgetMonthResolver.open_budget_month/3)
    end

    field :initialize_budget_month_from_planned_transactions, non_null(:budget_month) do
      arg :budget_month_id, non_null(:id)
      resolve(&BudgetMonthResolver.initialize_budget_month_from_planned_transactions/3)
    end

    field :add_manual_transaction_to_budget_month, non_null(:budget_month) do
      arg :budget_month_id, non_null(:id)
      arg :input, non_null(:add_manual_transaction_input)
      resolve(&BudgetMonthResolver.add_manual_transaction_to_budget_month/3)
    end

    field :confirm_budget_month_transaction, non_null(:budget_month) do
      arg :budget_month_id, non_null(:id)
      arg :transaction_id, non_null(:id)
      resolve(&BudgetMonthResolver.confirm_budget_month_transaction/3)
    end

    field :skip_budget_month_transaction, non_null(:budget_month) do
      arg :budget_month_id, non_null(:id)
      arg :transaction_id, non_null(:id)
      resolve(&BudgetMonthResolver.skip_budget_month_transaction/3)
    end

    field :remove_manual_transaction_from_budget_month, non_null(:boolean) do
      arg :budget_month_id, non_null(:id)
      arg :transaction_id, non_null(:id)
      resolve(&BudgetMonthResolver.remove_manual_transaction_from_budget_month/3)
    end
  end
end
