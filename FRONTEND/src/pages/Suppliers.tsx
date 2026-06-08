import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Truck, Plus, Search, Phone, Building2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import { PageTransition } from '../components/Skeleton';
import api from '../api';

interface Supplier {
  _id: string;
  name: string;
  company: string;
  phone: string;
}

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  // Form State
  const [form, setForm] = useState({ name: '', company: '', phone: '' });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      // Fetching from backend
      const res = await api.get('/suppliers/all');
      setSuppliers(res.data);
    } catch (error) {
      console.error("Failed to fetch suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = suppliers.filter(s => 
    (s?.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s?.company || '').toLowerCase().includes(search.toLowerCase())
  );

  // ADD SUPPLIER
  const handleAddSupplier = async () => {
    try {
      const res = await api.post('/suppliers/add', form);
      setSuppliers([...suppliers, res.data]);
      setModalOpen(false);
      setForm({ name: '', company: '', phone: '' });
    } catch (error: any) {
      alert("Error adding supplier: " + (error.response?.data?.message || error.message));
    }
  };

  // DELETE SUPPLIER
  const handleDelete = async (id: string, name: string) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${name}?`);
    if (!confirmDelete) return;

    try {
      await api.delete(`/suppliers/${id}`);
      setSuppliers(suppliers.filter(s => s._id !== id));
    } catch (error: any) {
      alert("Error deleting: " + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div className="text-center py-20 text-white">Loading Suppliers...</div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Suppliers</h1>
            <p className="text-sm text-zinc-500 mt-1">Manage your distributors and supply chain</p>
          </div>
          <button 
            onClick={() => setModalOpen(true)}
            className="btn-primary flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} /> Add Supplier
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or company..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Grid of Supplier Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((supplier, i) => (
            <motion.div
              key={supplier._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                    <Truck size={18} className="text-zinc-400 group-hover:text-blue-400 transition-colors" />
                  </div>
                  <button onClick={() => handleDelete(supplier._id, supplier.name)} className="text-zinc-600 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <h3 className="text-lg font-medium text-white mb-1">{supplier.name}</h3>
                
                <div className="space-y-2 mt-4">
                  <p className="text-sm text-zinc-400 flex items-center gap-2">
                    <Building2 size={14} className="text-zinc-500" />
                    {supplier.company}
                  </p>
                  <p className="text-sm text-zinc-400 flex items-center gap-2">
                    <Phone size={14} className="text-zinc-500" />
                    {supplier.phone}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => alert(`Calling ${supplier.phone}...`)}
                className="w-full mt-6 py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white transition-colors border border-white/5"
              >
                <Phone size={14} /> Contact Supplier
              </button>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-white/20 rounded-2xl">
              <Truck size={32} className="mx-auto text-zinc-600 mb-3" />
              <p className="text-zinc-400 font-medium">No suppliers found</p>
              <p className="text-zinc-600 text-sm mt-1">Click "Add Supplier" to build your network.</p>
            </div>
          )}
        </div>

        {/* Add Supplier Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New Supplier">
          <div className="space-y-4 p-4 bg-zinc-900 rounded-xl">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Contact Name</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="e.g. Amit Bhai" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Company / Distributor</label>
              <input type="text" value={form.company} onChange={e => setForm({...form, company: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="e.g. Parle Distributors" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Phone Number</label>
              <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="e.g. 9988776655" />
            </div>
            <button onClick={handleAddSupplier} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg mt-4 transition-colors">Save Supplier</button>
          </div>
        </Modal>

      </div>
    </PageTransition>
  );
}