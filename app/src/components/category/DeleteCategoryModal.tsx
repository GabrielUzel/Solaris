import Button from "../Button";
import { useDeleteCategory } from "../../hooks/category";
import type { CategoryItem } from "../../api/types/category";

type Props = {
  open: boolean;
  category: CategoryItem | null;
  onClose: () => void;
};

export default function DeleteCategoryModal({
  open,
  category,
  onClose,
}: Props) {
  const [deleteCategory, { loading }] = useDeleteCategory();

  if (!open || !category) return null;

  const currentCategory = category;

  async function handleDelete() {
    await deleteCategory({
      variables: {
        id: currentCategory.id,
      },
    });

    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        className="absolute inset-0 bg-black/50"
        aria-label="Fechar confirmação"
        onClick={onClose}
      />

      <div className="relative z-10 w-full max-w-md rounded-2xl border border-primary-border bg-card-background shadow-2xl">
        <div className="flex flex-col gap-4 p-6">
          <div>
            <h2 className="text-lg font-semibold text-primary-text">
              Excluir categoria
            </h2>
            <p className="mt-2 text-sm text-secondary-text">
              Tem certeza que deseja excluir a categoria{" "}
              <span className="font-medium text-primary-text">
                {currentCategory.name}
              </span>
              ? Essa ação não pode ser desfeita.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              type="button"
              onClick={handleDelete}
              disabled={loading}
            >
              Excluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
