defmodule SolarisCoreWeb.Api.Mutations.SettingsMutations do
  use Absinthe.Schema.Notation

  alias SolarisCoreWeb.Api.Resolvers.SettingsResolver

  object :settings_mutations do
    field :save_api_key, non_null(:api_key_status) do
      arg(:input, non_null(:save_api_key_input))
      resolve(&SettingsResolver.save_api_key/3)
    end

    field :delete_api_key, non_null(:api_key_status) do
      arg(:provider, non_null(:string))
      resolve(&SettingsResolver.delete_api_key/3)
    end
  end
end
