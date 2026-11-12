defmodule SolarisCoreWeb.Api.ErrorMessages do
  @moduledoc """
  Traduz átomos de erro do domínio e da camada de aplicação para mensagens
  exibíveis ao usuário final.

  Sem essa tradução, o Absinthe serializa o átomo cru (por exemplo
  `{:error, :not_found}` vira a mensagem `"not_found"`), o que chega ao
  frontend como um texto sem significado.
  """

  @default_message "Não foi possível concluir a operação"

  @messages %{
    # Genéricos
    not_found: "Registro não encontrado",
    invalid_status: "Status inválido",
    invalid_key: "Chave da API inválida",
    unauthorized: "Chave da API inválida ou não autorizada. Verifique nas Configurações.",
    rate_limited: "Limite de requisições da API excedido. Tente novamente em instantes.",
    sync_failed: "Falha ao sincronizar os dados",

    # Mês orçamentário
    budget_month_not_found: "Mês orçamentário não encontrado",
    invalid_status_transition: "Transição de status inválida para este mês",
    month_has_pending_expenses:
      "O mês possui despesas pendentes. Quite ou ignore os lançamentos antes de fechar.",
    invalid_reference_year: "Ano de referência inválido",
    invalid_reference_month: "Mês de referência inválido",
    starts_on_required: "A data de início é obrigatória",
    ends_on_required: "A data de término é obrigatória",
    starts_on_must_be_first_day_of_reference_month:
      "A data de início deve ser o primeiro dia do mês de referência",
    ends_on_must_be_last_day_of_reference_month:
      "A data de término deve ser o último dia do mês de referência",
    starts_on_must_be_before_or_equal_to_ends_on:
      "A data de início deve ser anterior ou igual à data de término",
    opened_at_required: "A data de abertura é obrigatória",
    closed_at_required: "A data de fechamento é obrigatória",
    closed_at_before_opened_at: "A data de fechamento não pode ser anterior à de abertura",
    closed_at_requires_closed_status: "A data de fechamento exige status fechado",

    # Lançamentos
    transaction_not_found: "Lançamento não encontrado",
    invalid_transaction_type: "Tipo de lançamento inválido",
    invalid_payment_method: "Método de pagamento inválido",
    invalid_origin: "Origem do lançamento inválida",
    occurred_on_required: "A data do lançamento é obrigatória",
    expected_amount_must_be_positive_integer: "O valor previsto deve ser maior que zero",
    actual_amount_must_be_positive_integer: "O valor realizado deve ser maior que zero",
    amount_must_be_positive_integer: "O valor deve ser maior que zero",
    expected_transaction_cannot_have_actual_amount:
      "Um lançamento previsto não pode ter valor realizado",
    paid_transaction_requires_actual_amount: "Informe o valor realizado para marcar como pago",
    skipped_transaction_cannot_have_actual_amount:
      "Um lançamento ignorado não pode ter valor realizado",
    cannot_remove_planned_transaction:
      "Lançamentos planejados não podem ser removidos do mês",
    planned_transaction_already_materialized:
      "Este lançamento planejado já foi lançado neste mês",

    # Lançamentos planejados
    invalid_planned_transaction_type: "Tipo de lançamento planejado inválido",
    invalid_day_of_month: "Dia do mês inválido",

    # Categorias
    invalid_category_type: "Tipo de categoria inválido",
    category_not_found: "Categoria não encontrada. Selecione uma categoria válida.",
    category_required: "Selecione uma categoria para o lançamento.",
    category_type_mismatch: "A categoria não corresponde ao tipo do lançamento",
    name_required: "O nome é obrigatório",
    color_required: "A cor é obrigatória",

    # Ativos
    asset_already_exists: "Este ativo já está cadastrado",
    asset_deactivated: "Este ativo está desativado",
    asset_has_open_investment: "O ativo possui posições abertas",
    asset_inactive: "Este ativo está desativado. Reative-o antes de criar uma posição.",
    invalid_asset_type: "Tipo de ativo inválido",
    invalid_asset_market: "Mercado inválido",
    invalid_asset_currency: "Moeda inválida. Use \"BRL\" ou \"USD\"",
    invalid_price_source: "Fonte de preços inválida",
    ticker_required: "O ticker é obrigatório",
    brapi_key_not_configured: "Chave da brapi não configurada. Configure nas Configurações.",
    finnhub_key_not_configured: "Chave da Finnhub não configurada. Configure nas Configurações.",
    us_market_requires_finnhub_price_source:
      "Ativos do mercado americano exigem a fonte de preços Finnhub",
    price_unavailable: "Preço indisponível no momento",

    # Investimentos
    investment_closed: "A posição está encerrada e não aceita novas movimentações",
    insufficient_quantity: "Quantidade vendida maior que a quantidade disponível na posição",
    invalid_sale_type: "Tipo de venda inválido",
    invalid_quantity: "Quantidade inválida",
    invalid_unit_price_cents: "Preço unitário inválido",
    invalid_investment_status: "Status de investimento inválido",
    invalid_income_type: "Tipo de rendimento inválido",
    no_investment: "Nenhum investimento encontrado",
    quantity_must_be_positive: "A quantidade deve ser maior que zero",
    quantity_must_be_decimal: "A quantidade deve ser um número decimal",
    unit_price_cents_must_be_positive: "O preço unitário deve ser maior que zero",
    fees_cents_must_be_non_negative: "As taxas não podem ser negativas",
    amount_invested_cents_must_be_positive: "O valor investido deve ser maior que zero",
    amount_invested_usd_cents_must_be_positive:
      "O valor investido em dólar deve ser maior que zero",
    transaction_date_required: "A data da transação é obrigatória",
    payment_date_required: "A data de pagamento é obrigatória",
    exchange_rate_must_be_decimal: "O câmbio deve ser um número decimal",
    exchange_rate_must_be_positive: "O câmbio deve ser maior que zero",
    exchange_rate_provider_not_configured: "Provedor de câmbio não configurado",
    input_currency_must_be_brl: "A moeda de entrada deve ser BRL",
    fixed_income_fields_not_allowed: "Campos de renda fixa não são permitidos para este ativo",
    issuer_required: "O emissor é obrigatório",
    liquidity_required: "A liquidez é obrigatória",
    maturity_date_required: "A data de vencimento é obrigatória",
    indexer_required: "O indexador é obrigatório",
    gross_amount_cents_must_be_positive: "O valor bruto deve ser maior que zero",
    net_amount_cents_must_be_non_negative: "O valor líquido não pode ser negativo",
    net_amount_cannot_exceed_gross: "O valor líquido não pode ser maior que o bruto",
    xirr_not_converged:
      "Não foi possível calcular a rentabilidade (XIRR) para este período",

    # Configurações
    invalid_provider: "Provedor inválido. Use \"brapi\" ou \"finnhub\"."
  }

  @doc """
  Converte um resultado `{:ok, value} | {:error, reason}` em um resultado com
  mensagem legível. `overrides` permite mensagens específicas do contexto.
  """
  @spec translate(term(), map()) :: term()
  def translate(result, overrides \\ %{})

  def translate({:error, %Ecto.Changeset{}}, _overrides) do
    {:error, "Dados inválidos. Verifique as informações enviadas."}
  end

  def translate({:error, reason}, overrides) when is_atom(reason) do
    message =
      Map.get(overrides, reason) || Map.get(@messages, reason, @default_message)

    {:error, message}
  end

  def translate({:error, reason}, _overrides) when is_binary(reason), do: {:error, reason}

  def translate({:error, _reason}, _overrides), do: {:error, @default_message}

  def translate(result, _overrides), do: result

  @doc "Mensagem padrão usada quando o motivo do erro não é mapeado."
  @spec default_message() :: String.t()
  def default_message, do: @default_message
end
