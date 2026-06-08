import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, Package } from 'lucide-react';
import Modal from '../components/Modal';
import { PageTransition } from '../components/Skeleton';
import api from '../api'; // REAL BACKEND CONNECTION

// Define the exact shape matching our MongoDB Schema
interface Product {
  _id: string; // Changed to _id for Mongo
  name: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  lowStockThreshold: number;
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  
  // Form State (matching MongoDB names)
  const [form, setForm] = useState({ 
    name: '', 
    quantity: '', 
    costPrice: '', 
    sellingPrice: '', 
    lowStockThreshold: '' 
  });

  // 1. FETCH ALL PRODUCTS
  const fetchInventory = async () => {
    try {
      const res = await api.get('/products/all');
      setProducts(res.data);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // 2. OPEN MODALS
  const openAddModal = () => {
    setEditProduct(null);
    setForm({ name: '', quantity: '', costPrice: '', sellingPrice: '', lowStockThreshold: '' });
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditProduct(product);
    setForm({
      name: product.name,
      quantity: String(product.quantity),
      costPrice: String(product.costPrice),
      sellingPrice: String(product.sellingPrice),
      lowStockThreshold: String(product.lowStockThreshold),
    });
    setModalOpen(true);
  };
// 3. SAVE OR UPDATE TO DATABASE
  const handleSave = async () => {
    try {
      const data = {
        name: form.name,
        quantity: Number(form.quantity),
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        lowStockThreshold: Number(form.lowStockThreshold),
      };

      if (editProduct) {
        // UPDATE EXISTING PRODUCT (The Alert is gone!)
        await api.put(`/products/${editProduct._id}`, data);
      } else {
        // ADD NEW TO DATABASE
        await api.post('/products/add', data);
      }
      
      setModalOpen(false);
      fetchInventory(); // Instantly refresh the table to show the new numbers!
      
    } catch (error: any) {
      alert("Failed to save: " + (error.response?.data?.message || error.message));
    }
  };
  // 4. DELETE FROM DATABASE
  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${name}?`);
    if (!confirmDelete) return;

    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (error: any) {
      alert("Failed to delete: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="text-center py-20 text-white">Loading Inventory...</div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Inventory</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage your product catalog and stock levels</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openAddModal}
            className="btn-primary flex items-center gap-2 self-start text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} strokeWidth={2} /> Add Product
          </motion.button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={15} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Table */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/5">
                  <th className="text-left px-6 py-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Product Name</th>
                  <th className="text-right px-6 py-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Stock</th>
                  <th className="text-right px-6 py-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Cost Price</th>
                  <th className="text-right px-6 py-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Selling Price</th>
                  <th className="text-right px-6 py-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Threshold</th>
                  <th className="text-center px-6 py-4 text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, i) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.03] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Package size={14} strokeWidth={1.5} className="text-blue-400" />
                        <span className="text-sm font-medium text-zinc-300">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                        product.quantity <= product.lowStockThreshold 
                          ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm text-zinc-500">₹{product.costPrice || 0}</td>
                    <td className="px-6 py-4 text-right text-sm font-medium text-zinc-300">₹{product.sellingPrice || 0}</td>
                    <td className="px-6 py-4 text-right text-sm text-zinc-600">{product.lowStockThreshold}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                        >
                          <Edit2 size={14} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 size={14} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      No products found. Add one above!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Modal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editProduct ? 'Edit Product' : 'Add New Product'}
        >
          <div className="space-y-5 p-4 bg-zinc-900 rounded-xl">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Product Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                placeholder="e.g. Basmati Rice (5kg)"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Stock Quantity</label>
                <input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Low-Stock Threshold</label>
                <input
                  type="number"
                  value={form.lowStockThreshold}
                  onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Cost Price (₹)</label>
                <input
                  type="number"
                  value={form.costPrice}
                  onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">Selling Price (₹)</label>
                <input
                  type="number"
                  value={form.sellingPrice}
                  onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            
            <div className="flex gap-3 pt-4 border-t border-white/10">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-zinc-400 hover:text-white bg-white/5 rounded-lg flex-1 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg flex-1 transition-colors">
                {editProduct ? 'Save Changes' : 'Add Product'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </PageTransition>
  );
}