import Card from "../ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import Transactions from "./transactions";
import Accounts from "./accounts";
import Categories from "./categories";
import Landmark from "../../assets/icons/landmark.svg?react";
import Tag from "../../assets/icons/tag.svg?react";
import ArrowRightLeft from "../../assets/icons/arrow-right-left.svg?react";

export default function MainTable() {
  return (
    <Card className="p-6">
      <Tabs defaultValue="transactions" className="flex flex-col gap-2">
        <TabsList className="w-full justify-start bg-chart-grid p-2 rounded-xl">
          <TabsTrigger value="transactions" className="gap-2">
            <ArrowRightLeft className="w-3.75 h-3.75" aria-hidden />
            Transações
          </TabsTrigger>
          <TabsTrigger value="accounts" className="gap-2">
            <Landmark className="w-3.75 h-3.75" aria-hidden />
            Contas
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <Tag className="w-3.75 h-3.75" aria-hidden />
            Categorias
          </TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <Transactions />
        </TabsContent>
        <TabsContent value="accounts">
          <Accounts />
        </TabsContent>
        <TabsContent value="categories">
          <Categories />
        </TabsContent>
      </Tabs>
    </Card>
  );
}
