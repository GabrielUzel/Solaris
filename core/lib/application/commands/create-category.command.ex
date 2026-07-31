defmodule SolarisCore.Application.Commands.CreateCategory do
  alias SolarisCore.Finance.Domain.Category
  alias SolarisCore.Infrastructure.Repositories.CategoryRepo
  alias Ecto.UUID

  @spec execute(map()) :: {:ok, Category.t()} | {:error, term()}
  def execute(attrs) do
    attrs =
      attrs
      |> Map.put_new(:id, UUID.generate())

    with {:ok, category} <- Category.new(attrs) do
      CategoryRepo.create(category)
    end
  end
end
