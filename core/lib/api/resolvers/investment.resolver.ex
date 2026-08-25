defmodule SolarisCoreWeb.Api.Resolvers.InvestmentResolver do
  import Absinthe.Resolution.Helpers, only: [on_load: 2]

  alias SolarisCore.Application.Commands.AddReinvestment
  alias SolarisCore.Application.Commands.CreateInvestment
  alias SolarisCore.Application.Commands.RegisterIncome
  alias SolarisCore.Application.Commands.RegisterSale
  alias SolarisCore.Application.Queries.GetInvestmentAnalysis
  alias SolarisCore.Application.Queries.GetInvestmentById
  alias SolarisCore.Application.Queries.ListInvestments
  alias SolarisCore.Finance.Domain.InvestmentRules

  @dataloader_source :investments

  @error_messages %{
    not_found: "Registro não encontrado",
    investment_closed: "A posição está encerrada e não aceita novas movimentações",
    insufficient_quantity: "Quantidade vendida maior que a quantidade disponível na posição",
    invalid_sale_type: "Tipo de venda inválido",
    invalid_quantity: "Quantidade inválida",
    invalid_unit_price_cents: "Preço unitário inválido",
    exchange_rate_provider_not_configured: "Provedor de câmbio não configurado"
  }

  @default_error_message "Não foi possível concluir a operação"

  # Queries

  def investment(_parent, %{id: id}, _resolution) do
    id
    |> GetInvestmentById.execute()
    |> translate_error(%{not_found: "Investimento não encontrado"})
  end

  def investments(_parent, args, _resolution) do
    with {:ok, status} <- parse_status(args[:status]) do
      ListInvestments.execute(%{status: status, asset_type: args[:asset_type]})
    end
  end

  # Mutations

  def create_investment(_parent, %{input: input}, _resolution) do
    input
    |> to_domain_attrs()
    |> CreateInvestment.execute()
    |> translate_error(%{not_found: "Ativo não encontrado"})
  end

  def add_reinvestment(_parent, %{input: input}, _resolution) do
    with {:ok, _transaction} <- AddReinvestment.execute(to_domain_attrs(input)),
         {:ok, investment} <- GetInvestmentById.execute(input.investment_id) do
      {:ok, investment}
    else
      error -> translate_error(error)
    end
  end

  def register_sale(_parent, %{input: input}, _resolution) do
    input
    |> to_domain_attrs()
    |> RegisterSale.execute()
    |> translate_error(%{not_found: "Investimento não encontrado"})
  end

  def register_income(_parent, %{input: input}, _resolution) do
    input
    |> to_domain_attrs()
    |> RegisterIncome.execute()
    |> translate_error(%{not_found: "Investimento não encontrado"})
  end

  # Campos de Investment resolvidos em lote (Dataloader, sem N+1).
  # Campos derivados apenas delegam o cálculo para InvestmentRules.

  def asset(investment, _args, %{context: %{loader: loader}}) do
    loader
    |> Dataloader.load(@dataloader_source, :assets_by_id, investment.asset_id)
    |> on_load(fn loader ->
      {:ok, Dataloader.get(loader, @dataloader_source, :assets_by_id, investment.asset_id)}
    end)
  end

  def transactions(investment, _args, %{context: %{loader: loader}}) do
    with_transactions(investment, loader, & &1)
  end

  def average_price_cents(investment, _args, %{context: %{loader: loader}}) do
    with_transactions(investment, loader, &InvestmentRules.average_price_cents/1)
  end

  def current_quantity(investment, _args, %{context: %{loader: loader}}) do
    with_transactions(investment, loader, fn transactions ->
      transactions |> InvestmentRules.current_quantity() |> Decimal.to_float()
    end)
  end

  def total_invested_cents(investment, _args, %{context: %{loader: loader}}) do
    with_transactions(investment, loader, &InvestmentRules.total_invested_cents/1)
  end

  # Campos de análise resolvidos via GetInvestmentAnalysis. Campos que
  # dependem de preço de mercado podem vir como {:error, :price_unavailable}
  # e são convertidos em nil (campo opcional no schema).

  def current_market_value_cents(investment, _args, _resolution) do
    analysis_field(investment, :current_market_value_cents)
  end

  def profit_loss_cents(investment, _args, _resolution) do
    analysis_field(investment, :profit_loss_cents)
  end

  def roi_percent(investment, _args, _resolution) do
    analysis_field(investment, :roi_percent)
  end

  def twr_percent(investment, _args, _resolution) do
    analysis_field(investment, :twr_percent)
  end

  def xirr_percent(investment, _args, _resolution) do
    analysis_field(investment, :xirr_percent)
  end

  def dividend_yield_accumulated(investment, _args, _resolution) do
    analysis_field(investment, :dividend_yield_accumulated)
  end

  defp analysis_field(investment, field) do
    case GetInvestmentAnalysis.execute(investment.id) do
      {:ok, analysis} -> {:ok, nullable_value(Map.get(analysis, field))}
      {:error, _reason} -> {:ok, nil}
    end
  end

  defp nullable_value({:error, _reason}), do: nil
  defp nullable_value(nil), do: nil
  defp nullable_value(%Decimal{} = value), do: Decimal.to_float(value)
  defp nullable_value(value) when is_float(value), do: value
  defp nullable_value(value) when is_integer(value), do: value

  # Campos de InvestmentTransaction

  def quantity(transaction, _args, _resolution) do
    {:ok, decimal_to_float(transaction.quantity)}
  end

  def exchange_rate_used(transaction, _args, _resolution) do
    {:ok, decimal_to_float(transaction.exchange_rate_used)}
  end

  defp with_transactions(investment, loader, fun) do
    loader
    |> Dataloader.load(@dataloader_source, :transactions_by_investment, investment.id)
    |> on_load(fn loader ->
      transactions =
        Dataloader.get(loader, @dataloader_source, :transactions_by_investment, investment.id)

      {:ok, fun.(transactions || [])}
    end)
  end

  defp to_domain_attrs(input) do
    Map.new(input, fn {key, value} -> {key, normalize_value(key, value)} end)
  end

  defp normalize_value(:quantity, nil), do: nil
  defp normalize_value(:quantity, value) when is_float(value), do: Decimal.from_float(value)
  defp normalize_value(:quantity, value) when is_integer(value), do: Decimal.new(value)
  defp normalize_value(_key, value), do: value

  defp parse_status(nil), do: {:ok, nil}
  defp parse_status("open"), do: {:ok, :open}
  defp parse_status("closed"), do: {:ok, :closed}
  defp parse_status(_other), do: {:error, "Status inválido. Use \"open\" ou \"closed\"."}

  defp translate_error(result, overrides \\ %{})

  defp translate_error({:error, %Ecto.Changeset{}}, _overrides) do
    {:error, "Dados inválidos. Verifique as informações enviadas."}
  end

  defp translate_error({:error, reason}, overrides) when is_atom(reason) do
    message = Map.get(overrides, reason) || Map.get(@error_messages, reason, @default_error_message)
    {:error, message}
  end

  defp translate_error(result, _overrides), do: result

  defp decimal_to_float(nil), do: nil
  defp decimal_to_float(%Decimal{} = value), do: Decimal.to_float(value)
end
