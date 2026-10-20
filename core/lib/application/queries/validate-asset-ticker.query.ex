defmodule SolarisCore.Application.Queries.ValidateAssetTicker do
  @moduledoc """
  Pre-validacao de ticker antes do cadastro. Retorna o nome do ativo quando
  disponivel na resposta da API externa, para pre-preencher o formulario.
  """

  alias SolarisCore.Infrastructure.MarketData.TickerVerifier

  @type result :: %{valid: boolean(), name: String.t() | nil}

  @spec execute(map()) :: {:ok, result()} | {:error, atom()}
  def execute(attrs) do
    case TickerVerifier.verify(attrs) do
      :ok -> {:ok, %{valid: true, name: nil}}
      {:error, reason} -> {:error, reason}
    end
  end
end
