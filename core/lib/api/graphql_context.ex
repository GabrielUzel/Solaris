defmodule SolarisCoreWeb.Api.GraphqlContext do
  @behaviour Plug

  alias SolarisCoreWeb.Api.Loader

  def init(opts), do: opts

  def call(conn, _opts) do
    Absinthe.Plug.put_options(conn, context: %{loader: Loader.new()})
  end
end
