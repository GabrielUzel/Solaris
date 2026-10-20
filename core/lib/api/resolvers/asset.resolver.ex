defmodule SolarisCoreWeb.Api.Resolvers.AssetResolver do
  alias SolarisCore.Application.Commands.CreateAsset
  alias SolarisCore.Application.Commands.DeactivateAsset
  alias SolarisCore.Application.Commands.ReactivateAsset
  alias SolarisCore.Application.Queries.GetAssetById
  alias SolarisCore.Application.Queries.ListAssets
  alias SolarisCore.Application.Queries.ValidateAssetTicker
  alias SolarisCore.Infrastructure.Repositories.InvestmentRepo

  @error_messages %{
    asset_already_exists: "Já existe um ativo cadastrado com este ticker neste mercado",
    asset_deactivated: "Já existe um ativo desativado com este ticker. Reative-o na seção de ativos desativados.",
    ticker_required: "O ticker é obrigatório",
    name_required: "O nome é obrigatório",
    invalid_asset_type: "Tipo de ativo inválido",
    invalid_asset_market: "Mercado inválido",
    invalid_asset_currency: "Moeda inválida. Use \"BRL\" ou \"USD\"",
    invalid_price_source: "Fonte de preços inválida",
    us_market_requires_finnhub_price_source:
      "Ativos do mercado americano exigem a fonte de preços finnhub_us",
    invalid_b3_price_source:
      "Ativos da B3 exigem a fonte de preços brapi_b3, brapi_treasury ou manual_curve",
    indexer_required: "O indexador é obrigatório para ativos de renda fixa",
    issuer_required: "O emissor é obrigatório para ativos de renda fixa",
    maturity_date_required: "A data de vencimento é obrigatória para ativos de renda fixa",
    liquidity_required: "A liquidez é obrigatória para ativos de renda fixa",
    fixed_income_fields_not_allowed:
      "Campos de renda fixa não são permitidos para este tipo de ativo",
    ticker_not_found: "Ticker não encontrado na fonte de preços. Verifique o ticker e o mercado selecionados.",
    brapi_key_not_configured: "Chave da API Brapi não configurada. Configure-a em Configurações antes de cadastrar ativos.",
    finnhub_key_not_configured: "Chave da API Finnhub não configurada. Configure-a em Configurações antes de cadastrar ativos.",
    ticker_validation_unavailable: "Não foi possível validar o ticker no momento. Tente novamente em instantes.",
    asset_has_open_investment: "Não é possível desativar: há uma posição aberta neste ativo",
    asset_inactive: "Este ativo está desativado",
    not_found: "Ativo não encontrado"
  }

  @default_error_message "Não foi possível concluir a operação"

  # Queries

  def asset(_parent, %{id: id}, _resolution) do
    case GetAssetById.execute(id) do
      {:error, :not_found} -> {:error, @error_messages[:not_found]}
      result -> result
    end
  end

  def assets(_parent, args, _resolution) do
    ListAssets.execute(%{
      asset_type: args[:asset_type],
      market: args[:market],
      active: args[:active]
    })
  end

  def validate_asset_ticker(_parent, %{input: input}, _resolution) do
    input
    |> to_domain_attrs()
    |> ValidateAssetTicker.execute()
    |> case do
      {:ok, result} -> {:ok, result}
      {:error, reason} -> {:error, Map.get(@error_messages, reason, @default_error_message)}
    end
  end

  def has_open_investment(asset, _args, _resolution) do
    {:ok, InvestmentRepo.open_for_asset?(asset.id)}
  end

  def indexer_rate_percent(asset, _args, _resolution) do
    {:ok, decimal_to_float(asset.indexer_rate_percent)}
  end

  # Mutations

  def create_asset(_parent, %{input: input}, _resolution) do
    input
    |> to_domain_attrs()
    |> CreateAsset.execute()
    |> translate_error()
  end

  def deactivate_asset(_parent, %{id: id}, _resolution) do
    id
    |> DeactivateAsset.execute()
    |> translate_error()
  end

  def reactivate_asset(_parent, %{id: id}, _resolution) do
    id
    |> ReactivateAsset.execute()
    |> translate_error()
  end

  defp to_domain_attrs(input) do
    Map.new(input, fn {key, value} -> {key, normalize_value(key, value)} end)
  end

  defp normalize_value(:indexer_rate_percent, nil), do: nil

  defp normalize_value(:indexer_rate_percent, value) when is_float(value),
    do: Decimal.from_float(value)

  defp normalize_value(:indexer_rate_percent, value) when is_integer(value),
    do: Decimal.new(value)

  defp normalize_value(key, value)
       when key in [:currency, :price_source, :indexer, :liquidity] and is_binary(value),
       do: safe_to_atom(value)

  defp normalize_value(_key, value), do: value

  # Converte apenas valores reconhecidos; os demais seguem como string e são
  # rejeitados pelas validações do domínio, que continua dono das regras.
  defp safe_to_atom(value) do
    String.to_existing_atom(value)
  rescue
    ArgumentError -> value
  end

  defp translate_error({:error, %Ecto.Changeset{}}) do
    {:error, "Dados inválidos. Verifique as informações enviadas."}
  end

  defp translate_error({:error, reason}) when is_atom(reason) do
    {:error, Map.get(@error_messages, reason, @default_error_message)}
  end

  defp translate_error({:error, _reason}) do
    {:error, @default_error_message}
  end

  defp translate_error(result), do: result

  defp decimal_to_float(nil), do: nil
  defp decimal_to_float(%Decimal{} = value), do: Decimal.to_float(value)
end
