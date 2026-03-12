import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  ShoppingCart, 
  Users, 
  Plus, 
  AlertTriangle, 
  TrendingUp, 
  Search,
  X,
  Trash2,
  Edit2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Supplier, Supply, Sale, Stats } from './types';

type View = 'dashboard' | 'products' | 'suppliers' | 'supplies' | 'sales';

export default function App() {
  const [view, setView] = useState<View>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'product' | 'supplier' | 'supply' | 'sale' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [pRes, supRes, sRes, saleRes, statsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/suppliers'),
        fetch('/api/supplies'),
        fetch('/api/sales'),
        fetch('/api/stats')
      ]);
      
      setProducts(await pRes.json());
      setSuppliers(await supRes.json());
      setSupplies(await sRes.json());
      setSales(await saleRes.json());
      setStats(await statsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        min_stock: Number(data.min_stock),
        price: Number(data.price)
      })
    });
    setIsModalOpen(false);
    fetchData();
  };

  const handleAddSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    await fetch('/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    setIsModalOpen(false);
    fetchData();
  };

  const handleAddSupply = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    await fetch('/api/supplies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: Number(data.product_id),
        supplier_id: Number(data.supplier_id),
        quantity: Number(data.quantity),
        unit_cost: Number(data.unit_cost)
      })
    });
    setIsModalOpen(false);
    fetchData();
  };

  const handleAddSale = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: Number(data.product_id),
        quantity: Number(data.quantity),
        sale_price: Number(data.sale_price),
        customer_name: data.customer_name
      })
    });

    if (!res.ok) {
      const error = await res.json();
      alert(error.error);
      return;
    }

    setIsModalOpen(false);
    fetchData();
  };

  const deleteItem = async (type: string, id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот элемент?')) return;
    await fetch(`/api/${type}/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar */}
      <nav className="w-full md:w-64 bg-ink text-bg p-6 flex flex-col gap-8">
        <div className="flex items-center gap-3">
          <Package className="w-8 h-8" />
          <h1 className="text-xl font-bold tracking-tighter uppercase">СкладПро</h1>
        </div>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setView('dashboard')}
            className={`flex items-center gap-3 p-3 transition-colors ${view === 'dashboard' ? 'bg-bg text-ink' : 'hover:bg-white/10'}`}
          >
            <LayoutDashboard size={20} />
            <span className="text-sm font-medium">Дашборд</span>
          </button>
          <button 
            onClick={() => setView('products')}
            className={`flex items-center gap-3 p-3 transition-colors ${view === 'products' ? 'bg-bg text-ink' : 'hover:bg-white/10'}`}
          >
            <Package size={20} />
            <span className="text-sm font-medium">Товары</span>
          </button>
          <button 
            onClick={() => setView('suppliers')}
            className={`flex items-center gap-3 p-3 transition-colors ${view === 'suppliers' ? 'bg-bg text-ink' : 'hover:bg-white/10'}`}
          >
            <Users size={20} />
            <span className="text-sm font-medium">Поставщики</span>
          </button>
          <button 
            onClick={() => setView('supplies')}
            className={`flex items-center gap-3 p-3 transition-colors ${view === 'supplies' ? 'bg-bg text-ink' : 'hover:bg-white/10'}`}
          >
            <Truck size={20} />
            <span className="text-sm font-medium">Поставки</span>
          </button>
          <button 
            onClick={() => setView('sales')}
            className={`flex items-center gap-3 p-3 transition-colors ${view === 'sales' ? 'bg-bg text-ink' : 'hover:bg-white/10'}`}
          >
            <ShoppingCart size={20} />
            <span className="text-sm font-medium">Продажи</span>
          </button>
        </div>

        <div className="mt-auto pt-6 border-t border-white/10">
          <p className="text-[10px] opacity-50 uppercase tracking-widest">v1.0.0 Stable</p>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-serif italic capitalize">
              {view === 'dashboard' && 'Обзор системы'}
              {view === 'products' && 'Каталог продукции'}
              {view === 'suppliers' && 'База поставщиков'}
              {view === 'supplies' && 'Журнал поставок'}
              {view === 'sales' && 'История продаж'}
            </h2>
            <p className="text-sm opacity-60 mt-1">
              Управление и мониторинг складских запасов в реальном времени.
            </p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {view === 'products' && (
              <button onClick={() => { setModalType('product'); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2 flex-1 md:flex-none justify-center">
                <Plus size={18} /> Добавить товар
              </button>
            )}
            {view === 'suppliers' && (
              <button onClick={() => { setModalType('supplier'); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2 flex-1 md:flex-none justify-center">
                <Plus size={18} /> Новый поставщик
              </button>
            )}
            {view === 'supplies' && (
              <button onClick={() => { setModalType('supply'); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2 flex-1 md:flex-none justify-center">
                <Plus size={18} /> Оформить поставку
              </button>
            )}
            {view === 'sales' && (
              <button onClick={() => { setModalType('sale'); setIsModalOpen(true); }} className="btn-primary flex items-center gap-2 flex-1 md:flex-none justify-center">
                <Plus size={18} /> Новая продажа
              </button>
            )}
          </div>
        </header>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ink"></div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'dashboard' && stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="card flex flex-col gap-2">
                    <span className="col-header">Всего товаров</span>
                    <div className="flex items-end justify-between">
                      <span className="text-4xl font-mono">{stats.totalProducts}</span>
                      <Package className="opacity-20" size={32} />
                    </div>
                  </div>
                  <div className="card flex flex-col gap-2 border-red-500/50 bg-red-50/50">
                    <span className="col-header text-red-600">Низкий запас</span>
                    <div className="flex items-end justify-between">
                      <span className="text-4xl font-mono text-red-600">{stats.lowStock}</span>
                      <AlertTriangle className="text-red-600 opacity-20" size={32} />
                    </div>
                  </div>
                  <div className="card flex flex-col gap-2">
                    <span className="col-header">Поставщики</span>
                    <div className="flex items-end justify-between">
                      <span className="text-4xl font-mono">{stats.totalSuppliers}</span>
                      <Users className="opacity-20" size={32} />
                    </div>
                  </div>
                  <div className="card flex flex-col gap-2">
                    <span className="col-header">Выручка (30д)</span>
                    <div className="flex items-end justify-between">
                      <span className="text-4xl font-mono">{stats.monthlyRevenue.toLocaleString()} ₽</span>
                      <TrendingUp className="opacity-20" size={32} />
                    </div>
                  </div>
                  
                  {/* Recent Activity or Quick Links could go here */}
                  <div className="md:col-span-2 card">
                    <h3 className="col-header mb-4">Критические остатки</h3>
                    <div className="space-y-2">
                      {products.filter(p => p.quantity <= p.min_stock).slice(0, 5).map(p => (
                        <div key={p.id} className="flex justify-between items-center p-2 border-b border-line/10">
                          <span className="text-sm font-medium">{p.name}</span>
                          <span className="font-mono text-xs text-red-600">{p.quantity} {p.unit}</span>
                        </div>
                      ))}
                      {products.filter(p => p.quantity <= p.min_stock).length === 0 && (
                        <p className="text-sm opacity-50 italic">Все товары в достаточном количестве.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {view === 'products' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                    <input 
                      type="text" 
                      placeholder="Поиск по названию или артикулу..."
                      className="input-field pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="border border-line bg-white overflow-x-auto">
                    <div className="data-row bg-ink/5">
                      <span className="col-header">ID</span>
                      <span className="col-header">Наименование</span>
                      <span className="col-header">Артикул</span>
                      <span className="col-header">Остаток</span>
                      <span className="col-header">Действия</span>
                    </div>
                    {filteredProducts.map(p => (
                      <div key={p.id} className="data-row">
                        <span className="data-value text-xs opacity-50">#{p.id}</span>
                        <span className="font-medium">{p.name}</span>
                        <span className="data-value text-sm">{p.sku}</span>
                        <span className={`data-value font-bold ${p.quantity <= p.min_stock ? 'text-red-600' : ''}`}>
                          {p.quantity} {p.unit}
                        </span>
                        <div className="flex gap-2">
                          <button onClick={() => deleteItem('products', p.id)} className="hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {view === 'suppliers' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {suppliers.map(s => (
                    <div key={s.id} className="card relative group">
                      <button 
                        onClick={() => deleteItem('suppliers', s.id)}
                        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                      >
                        <Trash2 size={18} />
                      </button>
                      <h3 className="text-lg font-bold mb-2">{s.name}</h3>
                      <div className="space-y-1 text-sm opacity-70">
                        <p className="flex items-center gap-2"><Users size={14} /> {s.contact_person}</p>
                        <p className="flex items-center gap-2">@ {s.email}</p>
                        <p className="flex items-center gap-2"># {s.phone}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {view === 'supplies' && (
                <div className="border border-line bg-white overflow-x-auto">
                  <div className="data-row bg-ink/5">
                    <span className="col-header">ID</span>
                    <span className="col-header">Товар</span>
                    <span className="col-header">Поставщик</span>
                    <span className="col-header">Кол-во</span>
                    <span className="col-header">Дата</span>
                  </div>
                  {supplies.map(s => (
                    <div key={s.id} className="data-row">
                      <span className="data-value text-xs opacity-50">#{s.id}</span>
                      <span className="font-medium">{s.product_name}</span>
                      <span className="text-sm">{s.supplier_name}</span>
                      <span className="data-value font-bold text-green-700">+{s.quantity}</span>
                      <span className="data-value text-xs">{new Date(s.supply_date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}

              {view === 'sales' && (
                <div className="border border-line bg-white overflow-x-auto">
                  <div className="data-row bg-ink/5">
                    <span className="col-header">ID</span>
                    <span className="col-header">Товар</span>
                    <span className="col-header">Клиент</span>
                    <span className="col-header">Кол-во</span>
                    <span className="col-header">Дата</span>
                  </div>
                  {sales.map(s => (
                    <div key={s.id} className="data-row">
                      <span className="data-value text-xs opacity-50">#{s.id}</span>
                      <span className="font-medium">{s.product_name}</span>
                      <span className="text-sm">{s.customer_name || '—'}</span>
                      <span className="data-value font-bold text-red-700">-{s.quantity}</span>
                      <span className="data-value text-xs">{new Date(s.sale_date).toLocaleDateString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      {/* Modals */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-ink/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg border border-line p-8 w-full max-w-md shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-serif italic">
                  {modalType === 'product' && 'Новый товар'}
                  {modalType === 'supplier' && 'Новый поставщик'}
                  {modalType === 'supply' && 'Приход товара'}
                  {modalType === 'sale' && 'Расход товара'}
                </h3>
                <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform">
                  <X size={24} />
                </button>
              </div>

              {modalType === 'product' && (
                <form onSubmit={handleAddProduct} className="space-y-4">
                  <div>
                    <label className="col-header block mb-1">Название</label>
                    <input name="name" required className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="col-header block mb-1">Артикул (SKU)</label>
                      <input name="sku" required className="input-field" />
                    </div>
                    <div>
                      <label className="col-header block mb-1">Категория</label>
                      <input name="category" className="input-field" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="col-header block mb-1">Ед. изм.</label>
                      <input name="unit" defaultValue="шт" className="input-field" />
                    </div>
                    <div>
                      <label className="col-header block mb-1">Мин. запас</label>
                      <input name="min_stock" type="number" defaultValue="5" className="input-field" />
                    </div>
                    <div>
                      <label className="col-header block mb-1">Цена</label>
                      <input name="price" type="number" step="0.01" className="input-field" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full mt-4">Сохранить</button>
                </form>
              )}

              {modalType === 'supplier' && (
                <form onSubmit={handleAddSupplier} className="space-y-4">
                  <div>
                    <label className="col-header block mb-1">Название компании</label>
                    <input name="name" required className="input-field" />
                  </div>
                  <div>
                    <label className="col-header block mb-1">Контактное лицо</label>
                    <input name="contact_person" className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="col-header block mb-1">Email</label>
                      <input name="email" type="email" className="input-field" />
                    </div>
                    <div>
                      <label className="col-header block mb-1">Телефон</label>
                      <input name="phone" className="input-field" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full mt-4">Добавить</button>
                </form>
              )}

              {modalType === 'supply' && (
                <form onSubmit={handleAddSupply} className="space-y-4">
                  <div>
                    <label className="col-header block mb-1">Товар</label>
                    <select name="product_id" required className="input-field">
                      <option value="">Выберите товар...</option>
                      {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="col-header block mb-1">Поставщик</label>
                    <select name="supplier_id" required className="input-field">
                      <option value="">Выберите поставщика...</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="col-header block mb-1">Количество</label>
                      <input name="quantity" type="number" required min="1" className="input-field" />
                    </div>
                    <div>
                      <label className="col-header block mb-1">Цена за ед.</label>
                      <input name="unit_cost" type="number" step="0.01" className="input-field" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full mt-4">Оформить приход</button>
                </form>
              )}

              {modalType === 'sale' && (
                <form onSubmit={handleAddSale} className="space-y-4">
                  <div>
                    <label className="col-header block mb-1">Товар</label>
                    <select name="product_id" required className="input-field">
                      <option value="">Выберите товар...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                          {p.name} (Доступно: {p.quantity} {p.unit})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="col-header block mb-1">Клиент</label>
                    <input name="customer_name" className="input-field" placeholder="ФИО или Название компании" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="col-header block mb-1">Количество</label>
                      <input name="quantity" type="number" required min="1" className="input-field" />
                    </div>
                    <div>
                      <label className="col-header block mb-1">Цена продажи</label>
                      <input name="sale_price" type="number" step="0.01" className="input-field" />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full mt-4">Оформить расход</button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
