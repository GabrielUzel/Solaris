import { useState } from "react";

type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string;
};

const MOCK_CATEGORIES: Category[] = [];

export default function Categories() {
  const [categories] = useState<Category[]>(MOCK_CATEGORIES);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-primary-text">Categorias</h1>
          <p className="text-sm text-secondary-text mt-1">
            Gerencie as categorias de receitas e despesas
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-inverted-text bg-button-background hover:bg-button-hover transition-colors"
        >
          <img src="/icons/plus.svg" alt="" className="w-4 h-4" />
          Nova categoria
        </button>
      </div>

      {showForm && (
        <CategoryForm onCancel={() => setShowForm(false)} />
      )}

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-secondary-text text-sm gap-2">
          <img src="/icons/category.svg" alt="" className="w-10 h-10 opacity-30" />
          <p>Nenhuma categoria cadastrada ainda.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <CategoryRow key={cat.id} category={cat} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryForm({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex flex-col gap-4 bg-card-background rounded-xl p-5 border border-primary-border shadow-default">
      <h2 className="text-sm font-semibold text-primary-text">Nova categoria</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-secondary-text">Nome</label>
          <input
            type="text"
            placeholder="Ex: Alimentação"
            className="px-3 py-2 rounded-lg text-sm bg-input-background border border-primary-border text-primary-text focus:outline-none focus:border-focus-border"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-secondary-text">Tipo</label>
          <select className="px-3 py-2 rounded-lg text-sm bg-input-background border border-primary-border text-primary-text focus:outline-none focus:border-focus-border">
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-secondary-text">Cor</label>
          <input
            type="color"
            defaultValue="#14b8a6"
            className="h-10 w-full rounded-lg border border-primary-border bg-input-background cursor-pointer"
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded-lg text-sm font-medium text-inverted-text bg-button-background hover:bg-button-hover transition-colors">
          Salvar
        </button>
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-lg text-sm font-medium text-secondary-text bg-input-background hover:bg-hover-background transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function CategoryRow({ category }: { category: Category }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-card-background border border-primary-border shadow-default">
      <div className="flex items-center gap-3">
        <span
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: category.color }}
        />
        <span className="text-sm text-primary-text">{category.name}</span>
        <span className="text-xs text-secondary-text px-2 py-0.5 rounded-full bg-secondary-background">
          {category.type === "income" ? "Receita" : "Despesa"}
        </span>
      </div>
      <div className="flex gap-2">
        <button className="p-1.5 rounded-lg text-secondary-text hover:bg-hover-background transition-colors">
          <img src="/icons/edit.svg" alt="Editar" className="w-4 h-4" />
        </button>
        <button className="p-1.5 rounded-lg text-error hover:bg-hover-background transition-colors">
          <img src="/icons/trash.svg" alt="Excluir" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
