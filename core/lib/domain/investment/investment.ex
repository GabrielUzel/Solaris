defmodule SolarisCore.Finance.Domain.Investment do
  @enforce_keys [:id, :asset_id, :status, :opened_at]
  defstruct [
    :id,
    :asset_id,
    :status,
    :opened_at,
    :closed_at,
    :created_at,
    :updated_at
  ]

  @type t :: %__MODULE__{
          id: binary(),
          asset_id: binary(),
          status: :open | :closed,
          opened_at: Date.t(),
          closed_at: Date.t() | nil,
          created_at: term() | nil,
          updated_at: term() | nil
        }

  @statuses [:open, :closed]

  def new(attrs) do
    with :ok <- validate_status(attrs[:status]),
         :ok <- validate_opened_at(attrs[:opened_at]),
         :ok <- validate_closed_at(attrs[:status], attrs[:opened_at], attrs[:closed_at]) do
      {:ok, struct!(__MODULE__, attrs)}
    end
  end

  def open?(%__MODULE__{status: :open}), do: true
  def open?(%__MODULE__{}), do: false

  defp validate_status(status) when status in @statuses, do: :ok
  defp validate_status(_), do: {:error, :invalid_investment_status}

  defp validate_opened_at(%Date{}), do: :ok
  defp validate_opened_at(_), do: {:error, :opened_at_required}

  defp validate_closed_at(:open, _opened_at, nil), do: :ok
  defp validate_closed_at(:open, _opened_at, %Date{}), do: {:error, :closed_at_requires_closed_status}
  defp validate_closed_at(:closed, _opened_at, nil), do: {:error, :closed_at_required}

  defp validate_closed_at(:closed, %Date{} = opened_at, %Date{} = closed_at) do
    if Date.compare(closed_at, opened_at) == :lt,
      do: {:error, :closed_at_before_opened_at},
      else: :ok
  end

  defp validate_closed_at(_, _, _), do: :ok
end
