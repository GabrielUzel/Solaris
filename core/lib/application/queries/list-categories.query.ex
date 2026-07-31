defmodule SolarisCore.Application.Queries.ListCategories do
  alias SolarisCore.Infrastructure.Repositories.CategoryRepo

  @spec execute() :: [term()]
  def execute do
    CategoryRepo.list_all()
  end
end
