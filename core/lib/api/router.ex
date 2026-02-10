defmodule SolarisCoreWeb.Router do
  use SolarisCoreWeb, :router

  pipeline :api do
    plug(:accepts, ["json"])
  end

  scope "/api" do
    pipe_through(:api)

    forward("/graphql", Absinthe.Plug, schema: SolarisCoreWeb.Api.Schema)
  end

  if Application.compile_env(:solaris_core, :dev_routes) do
    scope "/api" do
      pipe_through(:api)

      forward("/graphiql", Absinthe.Plug.GraphiQL,
        schema: SolarisCoreWeb.Api.Schema,
        interface: :simple
      )
    end
  end
end
