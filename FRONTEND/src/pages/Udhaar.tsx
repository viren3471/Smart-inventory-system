import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, IndianRupee, Phone, CheckCircle } from 'lucide-react';
import Modal from '../components/Modal';
import { PageTransition } from '../components/Skeleton';
import api from '../api';

interface Customer {
  _id: string;
  name: string;
  phone: string;
  totalDue: number;
}

export default function Udhaar() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
  // Forms
  const [addForm, setAddForm] = useState({ name: '', phone: '', initialDue: '0' });
  const [settleAmount, setSettleAmount] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      // Fetch customers from the backend
      const res = await api.get('/customers/all');
      setCustomers(res.data);
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setLoading(false);
    }
  };

  // NEW LOGIC: Only show people who actually owe money!
  const activeCustomers = customers.filter(c => c.totalDue > 0);

  // Then apply the search filter on top of the active customers
  const filtered = activeCustomers.filter(c => 
    (c?.name || '').toLowerCase().includes((search || '').toLowerCase()) || 
    (c?.phone || '').includes(search || '')
  );

  const totalMarketUdhaar = activeCustomers.reduce((sum, c) => sum + c.totalDue, 0);

  // ADD NEW CUSTOMER
  const handleAddCustomer = async () => {
    try {
      const res = await api.post('/customers/add', {
        name: addForm.name,
        phone: addForm.phone,
        totalDue: Number(addForm.initialDue)
      });
      setCustomers([...customers, res.data]);
      setIsAddModalOpen(false);
      setAddForm({ name: '', phone: '', initialDue: '0' });
    } catch (error: any) {
      alert("Error adding customer: " + (error.response?.data?.message || error.message));
    }
  };

  // SETTLE DEBT (PAY OFF UDHAAR)
  const handleSettle = async () => {
    if (!selectedCustomer) return;
    try {
      const amountToPay = Number(settleAmount);
      if (amountToPay <= 0 || amountToPay > selectedCustomer.totalDue) {
        return alert("Invalid amount! Cannot be zero or more than what is owed.");
      }

      // We will send a PUT request to update the customer's balance
      await api.put(`/customers/${selectedCustomer._id}/pay`, {
        amountPaid: amountToPay
      });

      // Update the UI immediately
      setCustomers(customers.map(c => 
        c._id === selectedCustomer._id 
          ? { ...c, totalDue: c.totalDue - amountToPay }
          : c
      ));

      setIsSettleModalOpen(false);
      setSettleAmount('');
    } catch (error: any) {
      alert("Error settling debt: " + (error.response?.data?.message || error.message));
    }
  };

  const openSettleModal = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSettleAmount(String(customer.totalDue)); // Default to paying full amount
    setIsSettleModalOpen(true);
  };

  if (loading) return <div className="text-center py-20 text-white">Loading Ledger...</div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Udhaar Ledger</h1>
            <p className="text-sm text-zinc-500 mt-1">Track customer credit and pending payments</p>
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={16} /> New Customer Account
          </button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
              <IndianRupee size={24} className="text-red-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Total Money in Market</p>
              <h2 className="text-2xl font-semibold text-white">₹{totalMarketUdhaar.toLocaleString()}</h2>
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Users size={24} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500">Total Udhaar Accounts</p>
              <h2 className="text-2xl font-semibold text-white">{activeCustomers.length} Active</h2>
            </div>
          </div>
        </div>

        {/* Customer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map((customer, i) => (
            <motion.div
              key={customer._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-white">{customer.name}</h3>
                    <p className="text-xs text-zinc-500 flex items-center gap-1 mt-1">
                      <Phone size={10} /> {customer.phone}
                    </p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    customer.totalDue > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
                  }`}>
                    {customer.totalDue > 0 ? 'Pending' : 'Cleared'}
                  </span>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm text-zinc-500 mb-1">Total Due</p>
                  <p className="text-3xl font-semibold text-white tracking-tight">
                    ₹{customer.totalDue}
                  </p>
                </div>
              </div>

              <button 
                onClick={() => openSettleModal(customer)}
                disabled={customer.totalDue === 0}
                className={`w-full py-2.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
                  customer.totalDue > 0 
                    ? 'bg-white/10 hover:bg-white/20 text-white' 
                    : 'bg-white/5 text-zinc-600 cursor-not-allowed'
                }`}
              >
                {customer.totalDue > 0 ? (
                  <> <IndianRupee size={16} /> Settle Debt </>
                ) : (
                  <> <CheckCircle size={16} /> Fully Paid </>
                )}
              </button>
            </motion.div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center border border-dashed border-white/20 rounded-2xl">
              <Users size={32} className="mx-auto text-zinc-600 mb-3" />
              <p className="text-zinc-400 font-medium">No active Udhaar accounts found</p>
              <p className="text-zinc-600 text-sm mt-1">Click "New Customer Account" to track a new debt.</p>
            </div>
          )}
        </div>

        {/* Add Customer Modal */}
        <Modal open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="New Customer Account">
          <div className="space-y-4 p-4 bg-zinc-900 rounded-xl">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Customer Name</label>
              <input type="text" value={addForm.name} onChange={e => setAddForm({...addForm, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="e.g. Ramesh Bhai" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Phone Number</label>
              <input type="text" value={addForm.phone} onChange={e => setAddForm({...addForm, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="e.g. 9876543210" />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Initial Udhaar (₹)</label>
              <input type="number" value={addForm.initialDue} onChange={e => setAddForm({...addForm, initialDue: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="0" />
            </div>
            <button onClick={handleAddCustomer} className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg mt-4 transition-colors font-medium">Create Account</button>
          </div>
        </Modal>

        {/* Settle Debt Modal */}
        <Modal open={isSettleModalOpen} onClose={() => setIsSettleModalOpen(false)} title="Settle Udhaar">
          <div className="space-y-4 p-4 bg-zinc-900 rounded-xl">
            <p className="text-sm text-zinc-400">
              Settling account for <span className="text-white font-medium">{selectedCustomer?.name}</span>. 
              Total due is <span className="text-red-400 font-medium">₹{selectedCustomer?.totalDue}</span>.
            </p>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">Amount Paid (₹)</label>
              <input type="number" value={settleAmount} onChange={e => setSettleAmount(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Enter amount..." />
            </div>
            <button onClick={handleSettle} className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg mt-4 transition-colors font-medium">Confirm Payment</button>
          </div>
        </Modal>

      </div>
    </PageTransition>
  );
}