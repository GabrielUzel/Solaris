defmodule SolarisCoreWeb.Api.Queries.SettingsQueries do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.SettingsResolver

  object :settings_queries do
    field :api_key_statuses, non_null(list_of(non_null(:api_key_status))) do
      resolve(&SettingsResolver.api_key_statuses/3)
    end
  end
end
