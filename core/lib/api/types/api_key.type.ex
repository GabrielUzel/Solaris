defmodule SolarisCoreWeb.Api.Types.ApiKeyTypes do
  use Absinthe.Schema.Notation

  object :api_key_status do
    field(:provider, non_null(:string))
    field(:configured, non_null(:boolean))
  end

  input_object :save_api_key_input do
    field(:provider, non_null(:string))
    field(:key, non_null(:string))
  end
end
