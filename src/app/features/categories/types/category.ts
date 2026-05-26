export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export type SaveCategoryRequest = Pick<Category, 'name'>;
