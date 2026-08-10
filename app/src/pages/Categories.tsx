import { useState } from "react";
import Button from "../components/Button";
import Spinner from "../components/Spinner";
import Plus from "../assets/icons/plus.svg?react";
import Edit from "../assets/icons/edit.svg?react";
import Trash from "../assets/icons/trash.svg?react";
import CategoryDrawer from "../components/category/CategoryDrawer";
import DeleteCategoryModal from "../components/category/DeleteCategoryModal";
import { useListCategories } from "../hooks/category";
import type { CategoryItem } from "../api/types/category";

export default function Categories() {
  const { data, loading, error } = useListCategories();
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(
    null,
  );
  const [deletingCategory, setDeletingCategory] = useState<CategoryItem | null>(
    null,
  );

  const categories = data?.listCategories ?? [];

  function handleOpenCreate() {
    setEditingCategory(null);
    setShowForm(true);
  }

  function handleEdit(category: CategoryItem) {
    setDeletingCategory(null);
    setEditingCategory(category);
    setShowForm(true);
  }

  function handleDelete(category: CategoryItem) {
    setShowForm(false);
    setEditingCategory(null);
    setDeletingCategory(category);
  }

  function handleCloseDrawer() {
    setShowForm(false);
    setEditingCategory(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary-text">
            Categorias
          </h1>
          <p className="mt-1 text-sm text-secondary-text">
            Gerencie as categorias de receitas e despesas
          </p>
        </div>

        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Nova categoria
        </Button>
      </div>

      <CategoryDrawer
        open={showForm}
        onClose={handleCloseDrawer}
        category={editingCategory}
      />

      <DeleteCategoryModal
        open={deletingCategory !== null}
        category={deletingCategory}
        onClose={() => setDeletingCategory(null)}
      />

      {loading ? (
        <Spinner />
      ) : error ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-error">
          <p>Erro ao carregar categorias.</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-16 text-sm text-secondary-text">
          <p>Nenhuma categoria cadastrada ainda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <CategoryRow
              key={cat.id}
              category={cat}
              onEdit={() => handleEdit(cat)}
              onDelete={() => handleDelete(cat)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryRow({
  category,
  onEdit,
  onDelete,
}: {
  category: CategoryItem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-primary-border bg-card-background px-4 py-3 shadow-default">
      <div className="flex items-center gap-3">
        <span
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <span className="text-sm text-primary-text">{category.name}</span>
        <span className="rounded-full bg-secondary-background px-2 py-0.5 text-xs text-secondary-text">
          {category.type === "INCOME" ? "Receita" : "Despesa"}
        </span>
      </div>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          className="p-1.5"
          aria-label="Editar categoria"
          onClick={onEdit}
        >
          <Edit className="h-4 w-4" aria-hidden="true" />
        </Button>
        <Button
          variant="ghost"
          className="p-1.5 text-error"
          aria-label="Excluir categoria"
          onClick={onDelete}
        >
          <Trash className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
