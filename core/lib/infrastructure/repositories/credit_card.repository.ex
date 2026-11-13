defmodule SolarisCore.Infrastructure.Repositories.CreditCardRepo do
  alias SolarisCore.Repo
  alias SolarisCore.Infrastructure.Schemas.CreditCardSchema
  alias SolarisCore.Finance.Domain.CreditCard
  import Ecto.Query

  def create(%CreditCard{} = domain_credit_card) do
    attrs = to_schema_attrs(domain_credit_card)

    %CreditCardSchema{}
    |> CreditCardSchema.changeset(attrs)
    |> Repo.insert()
    |> case do
      {:ok, schema} -> {:ok, to_domain(schema)}
      error -> error
    end
  end

  def get(id) do
    case Repo.get(CreditCardSchema, id) do
      nil -> {:error, :not_found}
      schema -> {:ok, to_domain(schema)}
    end
  end

  def list_all do
    CreditCardSchema
    |> order_by([c], asc: c.name)
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  def list_active do
    CreditCardSchema
    |> where([c], c.active == true)
    |> order_by([c], asc: c.name)
    |> Repo.all()
    |> Enum.map(&to_domain/1)
  end

  def update(%CreditCard{id: id} = domain_credit_card) do
    with {:ok, schema} <- ok_or_error(Repo.get(CreditCardSchema, id)),
         attrs <- to_schema_attrs(domain_credit_card),
         changeset <- CreditCardSchema.changeset(schema, attrs),
         {:ok, updated_schema} <- Repo.update(changeset) do
      {:ok, to_domain(updated_schema)}
    end
  end

  defp to_schema_attrs(%CreditCard{} = domain) do
    %{
      id: domain.id,
      name: domain.name,
      bank: domain.bank,
      closing_day: domain.closing_day,
      due_day: domain.due_day,
      active: domain.active
    }
  end

  defp to_domain(%CreditCardSchema{} = schema) do
    {:ok, credit_card} =
      CreditCard.new(%{
        id: schema.id,
        name: schema.name,
        bank: schema.bank,
        closing_day: schema.closing_day,
        due_day: schema.due_day,
        active: schema.active,
        created_at: schema.inserted_at,
        updated_at: schema.updated_at
      })

    credit_card
  end

  defp ok_or_error(nil), do: {:error, :not_found}
  defp ok_or_error(value), do: {:ok, value}
end
