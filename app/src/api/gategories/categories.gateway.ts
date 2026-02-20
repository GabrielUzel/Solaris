import { GraphQLClient } from "graphql-request";
import {
  GetCategoriesDocument,
  CreateCategoryDocument,
  UpdateCategoryDocument,
  DeleteCategoryDocument,
  GetCategoryByNameDocument,
} from "../../gql/graphql";
import type {
  GetCategoriesQuery,
  GetCategoryByNameQuery,
  CreateCategoryMutationVariables,
  UpdateCategoryMutationVariables,
} from "../../gql/graphql";

export class CategoriesGateway {
  private client: GraphQLClient;

  constructor() {
    this.client = new GraphQLClient(
      import.meta.env.VITE_GRAPHQL_URL ?? "http://localhost:4000/api/graphql",
    );
  }

  async getCategories(): Promise<GetCategoriesQuery["categories"]> {
    const data = await this.client.request(GetCategoriesDocument);
    return data.categories;
  }

  async getCategoryByName(
    name: string,
  ): Promise<GetCategoryByNameQuery["categoryByName"]> {
    const data = await this.client.request(GetCategoryByNameDocument, {
      name,
    });
    return data.categoryByName;
  }

  async createCategory(input: CreateCategoryMutationVariables["input"]) {
    const data = await this.client.request(CreateCategoryDocument, { input });
    return data.createCategory;
  }

  async updateCategory(
    id: string,
    input: UpdateCategoryMutationVariables["input"],
  ) {
    const data = await this.client.request(UpdateCategoryDocument, {
      id,
      input,
    });

    return data.updateCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const data = await this.client.request(DeleteCategoryDocument, { id });
    return data.deleteCategory ?? false;
  }
}

export const categoriesGateway = new CategoriesGateway();
