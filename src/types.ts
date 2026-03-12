export interface Product {
  id: number;
  name: string;
  sku: string;
  category: string;
  unit: string;
  quantity: number;
  min_stock: number;
  price: number;
  description: string;
  created_at: string;
}

export interface Supplier {
  id: number;
  name: string;
  contact_person: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface Supply {
  id: number;
  product_id: number;
  product_name: string;
  supplier_id: number;
  supplier_name: string;
  quantity: number;
  unit_cost: number;
  supply_date: string;
}

export interface Sale {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  sale_price: number;
  sale_date: string;
  customer_name: string;
}

export interface Stats {
  totalProducts: number;
  lowStock: number;
  totalSuppliers: number;
  monthlyRevenue: number;
}
