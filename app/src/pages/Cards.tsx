export default function Cards() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-primary-text">Cartões</h1>
        <p className="text-sm text-secondary-text mt-1">
          Gerencie seus cartões de crédito e débito
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-16 text-secondary-text text-sm gap-2">
        <img src="/icons/card.svg" alt="" className="w-10 h-10 opacity-30" />
        <p>Em breve.</p>
      </div>
    </div>
  );
}
