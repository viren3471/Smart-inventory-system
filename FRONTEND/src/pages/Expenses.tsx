import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Receipt, Plus, Search, Calendar } from 'lucide-react';
import Modal from '../components/Modal';
import { PageTransition } from '../components/Skeleton';
import api from '../api';

interface ExpenseItem {
  _id: string;
  title: string;
  amount: number;
  createdAt: string;
}

export default function Expenses() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '' });

  // 1. FETCH ALL EXPENSES ON PAGE LOAD
  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses/all');
      setExpenses(res.data);
    } catch (error) {
      console.error("Failed to fetch expenses:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. ADD A NEW EXPENSE
  const handleAddExpense = async () => {
    if (!form.title || !form.amount) return alert("Please fill out all fields.");
    
    try {
      await api.post('/expenses/add', {
        title: form.title,
        amount: Number(form.amount)
      });
      
      // Close modal and clear form
      setIsModalOpen(false);
      setForm({ title: '', amount: '' });
      
      // Instantly refresh the list to show the new expense!
      fetchExpenses(); 
      
    } catch (error: any) {
      alert("Error logging expense: " + (error.response?.data?.message || error.message));
    }
  };

  // Filter list based on search bar
  const filtered = expenses.filter(exp => 
    exp.title.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate total lifetime expenses
  const totalLifetimeExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (loading) return <div className="text-center py-20 text-white">Loading Expenses...</div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Expenses</h1>
            <p className="text-sm text-zinc-500 mt-1">Track your daily shop operations and costs</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-primary flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} /> Log Expense
          </button>
        </div>

        {/* Lifetime Total Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full sm:w-96 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <Receipt size={24} className="text-red-400" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">Total Lifetime Expenses</p>
            <h2 className="text-2xl font-semibold text-white">₹{totalLifetimeExpenses.toLocaleString()}</h2>
          </div>
        </div>

        {/* List & Search Section */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-4 border-b border-white/10">
            <div className="relative max-w-md">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search expenses..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-sm">
                No expenses found.
              </div>
            ) : (
              filtered.map((expense) => (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={expense._id} 
                  className="p-4 hover:bg-white/[0.02] transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                      <Receipt size={16} className="text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{expense.title}</p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                        <Calendar size={10} /> 
                        {new Date(expense.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-base font-semibold text-red-400">
                    ₹{expense.amount}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Add Expense Modal */}
        <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log New Expense">
          <div className="space-y-4 p-4 bg-zinc-900 rounded-xl">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Description / Title</label>
              <input 
                type="text" 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                placeholder="e.g. Electricity Bill, Tea, Repairs" 
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Amount (₹)</label>
              <input 
                type="number" 
                value={form.amount} 
                onChange={e => setForm({...form, amount: e.target.value})} 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" 
                placeholder="0" 
              />
            </div>
            <button 
              onClick={handleAddExpense} 
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg mt-4 transition-colors font-medium"
            >
              Save Expense
            </button>
          </div>
        </Modal>

      </div>
    </PageTransition>
  );
}