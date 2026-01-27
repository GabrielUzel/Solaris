defmodule SolarisCore.Finance.Application.Commands.CreateCategory do
  alias SolarisCore.Finance.Domain.Category
  alias SolarisCore.Infrastructure.Repositories.CategoryRepo

  @type params :: %{
          required(:id) => String.t(),
          required(:name) => String.t(),
          required(:type) => :income | :expense,
          optional(:color) => String.t()
        }

  @type result :: {:ok, Category.t()} | {:error, term()}

  @spec execute(params()) :: result()
  def execute(params) do
    with {:ok, category} <- Category.new(params),
         {:ok, persisted} <- CategoryRepo.create(category) do
      {:ok, persisted}
    end
  end
end
