defmodule SolarisCore.Application.Queries.ListCategoriesByType do
  alias SolarisCore.Infrastructure.Repositories.CategoryRepo

  @spec execute(:income | :expense) :: [term()]
  def execute(type) do
    CategoryRepo.list_by_type(type)
  end
end
