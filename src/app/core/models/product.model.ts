export interface ProductListItem {
  id: number;
  product_name: string;
  slug?: string | null;
  category: string | null;
  sub_category?: string | null;
  brand: string | null;
  price: number | null;
  stock_quantity: number;
  reference?: string | null;
  image_url: string | null;
}

export interface ProductsPagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface ProductsListResponse {
  products: ProductListItem[];
  pagination: ProductsPagination;
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}
