defmodule SolarisCoreWeb.Api.Queries.PlannedTransactionQueries do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.PlannedTransactionResolver

  object :planned_transaction_queries do
    field :list_planned_transactions, non_null(list_of(non_null(:planned_transaction))) do
      resolve(&PlannedTransactionResolver.list_planned_transactions/3)
    end

    field :get_planned_transaction_by_id, :planned_transaction do
      arg :id, non_null(:id)
      resolve(&PlannedTransactionResolver.get_planned_transaction_by_id/3)
    end

    field :list_active_planned_transactions, non_null(list_of(non_null(:planned_transaction))) do
      resolve(&PlannedTransactionResolver.list_active_planned_transactions/3)
    end

    field :preview_planned_transactions_for_month, non_null(list_of(non_null(:planned_transaction))) do
      arg :year, non_null(:integer)
      arg :month, non_null(:integer)
      resolve(&PlannedTransactionResolver.preview_planned_transactions_for_month/3)
    end
  end
end
