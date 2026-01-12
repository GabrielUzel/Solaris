defmodule SolarisCoreWeb.Router do
  use SolarisCoreWeb, :router

  pipeline :api do
    plug(:accepts, ["json"])
  end

  scope "/api" do
    pipe_through(:api)

    forward("/graphql", Absinthe.Plug, schema: SolarisCoreWeb.Schema)

    if Application.compile_env(:solaris_core, :dev_routes) do
      forward("/graphiql", Absinthe.Plug.GraphiQL,
        schema: SolarisCoreWeb.Schema,
        interface: :simple
      )
    end
  end
end
