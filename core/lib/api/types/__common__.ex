defmodule SolarisCoreWeb.Api.Types.CommonTypes do
  use Absinthe.Schema.Notation

  enum :financial_type do
    value(:income)
    value(:expense)
  end

  enum :payment_method do
    value(:pix)
    value(:bank_transfer)
    value(:boleto)
    value(:credit_card)
    value(:debit_card)
  end

  enum :transaction_origin do
    value(:manual)
    value(:planned)
  end

  enum :transaction_status do
    value(:expected)
    value(:paid)
    value(:skipped)
  end
end
