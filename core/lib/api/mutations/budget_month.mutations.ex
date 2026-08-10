defmodule SolarisCoreWeb.Api.Mutations.BudgetMonthMutations do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.BudgetMonthResolver

  object :budget_month_mutations do
    field :open_budget_month, non_null(:budget_month) do
      arg(:year, non_null(:integer))
      arg(:month, non_null(:integer))
      resolve(&BudgetMonthResolver.open_budget_month/3)
    end

    field :ensure_current_budget_month, non_null(:budget_month) do
      resolve(&BudgetMonthResolver.ensure_current_budget_month/3)
    end

    field :ensure_budget_month_by_reference, non_null(:budget_month) do
      arg(:year, non_null(:integer))
      arg(:month, non_null(:integer))
      resolve(&BudgetMonthResolver.ensure_budget_month_by_reference/3)
    end

    field :initialize_budget_month_from_planned_transactions, non_null(:budget_month) do
      arg(:budget_month_id, non_null(:id))
      resolve(&BudgetMonthResolver.initialize_budget_month_from_planned_transactions/3)
    end

    field :create_manual_transaction, non_null(:budget_month) do
      arg(:budget_month_id, non_null(:id))
      arg(:input, non_null(:create_manual_transaction_input))
      resolve(&BudgetMonthResolver.create_manual_transaction/3)
    end

    field :pay_transaction, non_null(:budget_month) do
      arg(:budget_month_id, non_null(:id))
      arg(:transaction_id, non_null(:id))
      arg(:input, :pay_transaction_input)
      resolve(&BudgetMonthResolver.pay_transaction/3)
    end

    field :skip_transaction, non_null(:budget_month) do
      arg(:budget_month_id, non_null(:id))
      arg(:transaction_id, non_null(:id))
      resolve(&BudgetMonthResolver.skip_transaction/3)
    end

    field :update_manual_transaction, non_null(:budget_month) do
      arg(:budget_month_id, non_null(:id))
      arg(:transaction_id, non_null(:id))
      arg(:input, non_null(:update_manual_transaction_input))
      resolve(&BudgetMonthResolver.update_manual_transaction/3)
    end

    field :delete_manual_transaction, non_null(:boolean) do
      arg(:budget_month_id, non_null(:id))
      arg(:transaction_id, non_null(:id))
      resolve(&BudgetMonthResolver.delete_manual_transaction/3)
    end
  end
end
