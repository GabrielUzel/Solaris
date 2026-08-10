type Status = "PAID" | "PENDING" | "SKIPPED" | "ACTIVE" | "INACTIVE";

type Props = {
  status: Status;
};

const config: Record<Status, { label: string; className: string }> = {
  PAID: { label: "Pago", className: "bg-success/10 text-success" },
  PENDING: { label: "Pendente", className: "bg-error/10 text-error" },
  SKIPPED: { label: "Ignorado", className: "bg-warning/10 text-warning" },
  ACTIVE: { label: "Ativo", className: "bg-success/10 text-success" },
  INACTIVE: {
    label: "Inativo",
    className: "bg-secondary-text/10 text-secondary-text",
  },
};

export default function StatusTag({ status }: Props) {
  const { label, className } = config[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}
    >
      {label}
    </span>
  );
}
