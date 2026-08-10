import { FormEvent, useEffect, useState } from "react";
import Button from "../../components/Button";
import Dropdown from "../../components/Dropdown";
import { useCreateCategory, useUpdateCategory } from "../../hooks/category";
import type { CategoryItem } from "../../api/types/category";
import type { FinancialType } from "../../api/types/common";

type Props = {
  open: boolean;
  onClose: () => void;
  category?: CategoryItem | null;
};

export default function CategoryDrawer({ open, onClose, category }: Props) {
  const [createCategory, { loading: creating }] = useCreateCategory();
  const [updateCategory, { loading: updating }] = useUpdateCategory();

  const [name, setName] = useState("");
  const [type, setType] = useState<FinancialType>("EXPENSE");
  const [color, setColor] = useState("#14b8a6");

  const isEditing = Boolean(category);
  const loading = creating || updating;

  useEffect(() => {
    if (category) {
      setName(category.name);
      setType(category.type);
      setColor(category.color);
    } else {
      setName("");
      setType("EXPENSE");
      setColor("#14b8a6");
    }
  }, [category, open]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (category) {
      await updateCategory({
        variables: {
          id: category.id,
          input: {
            name,
            type,
            color,
          },
        },
      });
    } else {
      await createCategory({
        variables: {
          input: {
            name,
            type,
            color,
          },
        },
      });
    }

    setName("");
    setType("EXPENSE");
    setColor("#14b8a6");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50">
      <button
        className="absolute inset-0 bg-black/50"
        aria-label="Fechar modal"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-md border-l border-primary-border bg-card-background shadow-2xl">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-sm font-semibold text-primary-text">
              {isEditing ? "Editar categoria" : "Nova categoria"}
            </h2>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5"
          >
            <div className="flex flex-col gap-1">
              <label className="text-xs text-secondary-text">Nome</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-primary-border bg-input-background px-3 py-2 text-sm text-primary-text focus:border-focus-border focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-secondary-text">Tipo</label>
              <Dropdown
                label="Selecione o tipo"
                value={type}
                onChange={(value) => setType(value as FinancialType)}
                options={[
                  { label: "Despesa", value: "EXPENSE" },
                  { label: "Receita", value: "INCOME" },
                ]}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-secondary-text">Cor</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="size-10 cursor-pointer rounded-lg border border-primary-border bg-input-background p-0"
              />
            </div>

            <div className="mt-auto flex gap-2 pt-4">
              <Button type="submit" disabled={loading}>
                {isEditing ? "Salvar alterações" : "Salvar"}
              </Button>
              <Button variant="secondary" type="button" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
