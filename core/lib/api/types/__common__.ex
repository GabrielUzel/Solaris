defmodule SolarisCoreWeb.Api.Types.CommonTypes do
  use Absinthe.Schema.Notation

  enum :account_type do
    value(:checking, description: "Checking account")
    value(:savings, description: "Savings account")
    value(:credit_card, description: "Credit card account")
    value(:investment, description: "Investment account")
  end

  enum :transaction_type do
    value(:income, description: "Income transaction")
    value(:expense, description: "Expense transaction")
  end

  enum :recurrence_frequency do
    value(:daily, description: "Daily recurrence")
    value(:weekly, description: "Weekly recurrence")
    value(:monthly, description: "Monthly recurrence")
    value(:yearly, description: "Yearly recurrence")
  end
end
