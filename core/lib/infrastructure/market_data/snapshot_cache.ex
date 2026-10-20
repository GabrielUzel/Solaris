defmodule SolarisCore.Infrastructure.MarketData.SnapshotCache do
  @spec get_or_fetch(
          (-> {:ok, term()} | {:error, :not_found}),
          (-> {:ok, term()} | {:error, term()})
        ) :: {:ok, term()} | {:error, term()}
  def get_or_fetch(lookup_fun, fetch_fun) do
    case lookup_fun.() do
      {:ok, value} -> {:ok, value}
      {:error, :not_found} -> fetch_fun.()
    end
  end
end
