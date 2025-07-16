export interface Product {
  id: string;
  name: string;
  description: string;
  imageFile?: string;
  imageUrl?: string;
  price: number;
  category: string[];
  categories?: string[];
}

export interface ProductResponse {
  products: Product[];
  pageIndex: number;
  pageSize: number;
  count: number;
}

export interface CreateProductRequest {
  Name: string;
  Categories: string[];
  Description: string;
  ImageUrl: string;
  Price: number;
}

export interface ProductApiResponse {
  id: string;
  Name: string;
  Categories: string[];
  Description: string;
  ImageUrl: string;
  Price: number;
}
