import Card from "../../ui/card";

type TransactionCardProps = {
  transaction: {
    id: string;
    amount: number;
    type: string;
    date: string;
    description: string;
    category: string;
    account: string;
  };
};

export function TransactionCard({ transaction }: TransactionCardProps) {
  return (
    <Card>
      <div className="flex flex-col gap-2">
        <h2 className="text-lg">{transaction.description}</h2>
        <p className="text-sm">{transaction.category}</p>
        <p className="text-sm">{transaction.account}</p>
        <p className="text-sm">{transaction.type}</p>
        <p className="text-sm">{transaction.amount}</p>
      </div>
    </Card>
  );
}
