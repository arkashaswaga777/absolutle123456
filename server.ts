import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("warehouse.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    category TEXT,
    unit TEXT DEFAULT 'шт',
    quantity INTEGER DEFAULT 0,
    min_stock INTEGER DEFAULT 5,
    price REAL DEFAULT 0,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS supplies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    supplier_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    unit_cost REAL,
    supply_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id)
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    sale_price REAL,
    sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    customer_name TEXT,
    FOREIGN KEY (product_id) REFERENCES products(id)
  );
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Suppliers
  app.get("/api/suppliers", (req, res) => {
    const rows = db.prepare("SELECT * FROM suppliers ORDER BY name").all();
    res.json(rows);
  });

  app.post("/api/suppliers", (req, res) => {
    const { name, contact_person, email, phone, address } = req.body;
    const info = db.prepare(
      "INSERT INTO suppliers (name, contact_person, email, phone, address) VALUES (?, ?, ?, ?, ?)"
    ).run(name, contact_person, email, phone, address);
    res.json({ id: info.lastInsertRowid });
  });

  app.delete("/api/suppliers/:id", (req, res) => {
    db.prepare("DELETE FROM suppliers WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Products
  app.get("/api/products", (req, res) => {
    const rows = db.prepare("SELECT * FROM products ORDER BY name").all();
    res.json(rows);
  });

  app.post("/api/products", (req, res) => {
    const { name, sku, category, unit, min_stock, price, description } = req.body;
    try {
      const info = db.prepare(
        "INSERT INTO products (name, sku, category, unit, min_stock, price, description) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).run(name, sku, category, unit, min_stock, price, description);
      res.json({ id: info.lastInsertRowid });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch("/api/products/:id", (req, res) => {
    const { name, category, unit, min_stock, price, description } = req.body;
    db.prepare(
      "UPDATE products SET name = ?, category = ?, unit = ?, min_stock = ?, price = ?, description = ? WHERE id = ?"
    ).run(name, category, unit, min_stock, price, description, req.params.id);
    res.json({ success: true });
  });

  app.delete("/api/products/:id", (req, res) => {
    db.prepare("DELETE FROM products WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Supplies (Incoming)
  app.get("/api/supplies", (req, res) => {
    const rows = db.prepare(`
      SELECT s.*, p.name as product_name, sup.name as supplier_name 
      FROM supplies s
      JOIN products p ON s.product_id = p.id
      JOIN suppliers sup ON s.supplier_id = sup.id
      ORDER BY s.supply_date DESC
    `).all();
    res.json(rows);
  });

  app.post("/api/supplies", (req, res) => {
    const { product_id, supplier_id, quantity, unit_cost } = req.body;
    
    const transaction = db.transaction(() => {
      db.prepare(
        "INSERT INTO supplies (product_id, supplier_id, quantity, unit_cost) VALUES (?, ?, ?, ?)"
      ).run(product_id, supplier_id, quantity, unit_cost);
      
      db.prepare(
        "UPDATE products SET quantity = quantity + ? WHERE id = ?"
      ).run(quantity, product_id);
    });

    transaction();
    res.json({ success: true });
  });

  // Sales (Outgoing)
  app.get("/api/sales", (req, res) => {
    const rows = db.prepare(`
      SELECT s.*, p.name as product_name 
      FROM sales s
      JOIN products p ON s.product_id = p.id
      ORDER BY s.sale_date DESC
    `).all();
    res.json(rows);
  });

  app.post("/api/sales", (req, res) => {
    const { product_id, quantity, sale_price, customer_name } = req.body;
    
    const product = db.prepare("SELECT quantity FROM products WHERE id = ?").get(product_id) as { quantity: number };
    
    if (!product || product.quantity < quantity) {
      return res.status(400).json({ error: "Недостаточно товара на складе" });
    }

    const transaction = db.transaction(() => {
      db.prepare(
        "INSERT INTO sales (product_id, quantity, sale_price, customer_name) VALUES (?, ?, ?, ?)"
      ).run(product_id, quantity, sale_price, customer_name);
      
      db.prepare(
        "UPDATE products SET quantity = quantity - ? WHERE id = ?"
      ).run(quantity, product_id);
    });

    transaction();
    res.json({ success: true });
  });

  // Dashboard Stats
  app.get("/api/stats", (req, res) => {
    const totalProducts = db.prepare("SELECT COUNT(*) as count FROM products").get() as { count: number };
    const lowStock = db.prepare("SELECT COUNT(*) as count FROM products WHERE quantity <= min_stock").get() as { count: number };
    const totalSuppliers = db.prepare("SELECT COUNT(*) as count FROM suppliers").get() as { count: number };
    const recentSales = db.prepare("SELECT SUM(quantity * sale_price) as revenue FROM sales WHERE sale_date >= date('now', '-30 days')").get() as { revenue: number };

    res.json({
      totalProducts: totalProducts.count,
      lowStock: lowStock.count,
      totalSuppliers: totalSuppliers.count,
      monthlyRevenue: recentSales.revenue || 0
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
