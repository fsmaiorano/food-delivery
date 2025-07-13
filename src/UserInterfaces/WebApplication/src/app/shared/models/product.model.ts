export interface Product {
  id: string;
  name: string;
  description: string;
  imageFile?: string;
  imageUrl?: string;
  price: number;
  category: string[]; // Keep this for frontend display
  categories?: string[]; // API format
}

export interface ProductResponse {
  products: Product[];
  pageIndex: number;
  pageSize: number;
  count: number;
}

// API request/response interfaces to match the actual API
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
