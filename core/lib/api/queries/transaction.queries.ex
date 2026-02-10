defmodule SolarisCoreWeb.Api.Queries.TransactionQueries do
  use Absinthe.Schema.Notation
  alias SolarisCoreWeb.Api.Resolvers.TransactionResolver

  object :transaction_queries do
    field :transactions, non_null(list_of(non_null(:transaction))) do
      resolve(&TransactionResolver.get_all/3)
    end

    field :transactions_by_account, non_null(list_of(non_null(:transaction_detail))) do
      arg(:account_id, non_null(:id))
      resolve(&TransactionResolver.get_by_account/3)
    end

    field :transactions_by_category, :category_with_transactions do
      arg(:category_id, non_null(:id))
      resolve(&TransactionResolver.get_by_category/3)
    end

    field :transactions_by_description, non_null(list_of(non_null(:transaction_detail))) do
      arg(:description, non_null(:string))
      resolve(&TransactionResolver.get_by_description/3)
    end

    field :transactions_by_type, non_null(:type_result) do
      arg(:type, non_null(:transaction_type))
      resolve(&TransactionResolver.get_by_type/3)
    end

    field :transactions_by_date_range, non_null(:date_range_result) do
      arg(:account_id, non_null(:id))
      arg(:start_date, non_null(:string))
      arg(:end_date, non_null(:string))
      resolve(&TransactionResolver.get_by_date_range/3)
    end

    field :transactions_by_recurrence, non_null(:recurrence_result) do
      arg(:frequency, non_null(:recurrence_frequency))
      resolve(&TransactionResolver.get_by_recurrence/3)
    end

    field :transactions_for_month, non_null(list_of(non_null(:month_transaction))) do
      arg(:account_id, non_null(:id))
      arg(:year, non_null(:integer))
      arg(:month, non_null(:integer))
      resolve(&TransactionResolver.get_for_month/3)
    end

    field :month_summary, non_null(:month_summary) do
      arg(:account_id, non_null(:id))
      arg(:year, non_null(:integer))
      arg(:month, non_null(:integer))
      resolve(&TransactionResolver.get_month_summary/3)
    end
  end
end
