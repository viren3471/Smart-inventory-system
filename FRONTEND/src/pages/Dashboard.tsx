import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Wallet, ArrowUpRight, AlertTriangle, Phone, Bell } from 'lucide-react';
import KPICard from '../components/KPICard';
import { PageTransition } from '../components/Skeleton';
import api from '../api';

interface SummaryData {
  totalSalesQty: number;
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
}

interface LowStockItem {
  _id: string;
  name: string;
  quantity: number;
  lowStockThreshold: number;
  supplierId?: {
    name: string;
    phone: string;
  };
}

export default function Dashboard() {
  const [summary, setSummary] = useState<SummaryData>({
    totalSalesQty: 0,
    totalRevenue: 0,
    totalExpenses: 0,
    netProfit: 0,
  });
  
  const [lowStockAlerts, setLowStockAlerts] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

      // BLOCK 1: Fetch Math (Isolated so it can't break the rest of the page)
      try {
        const summaryRes = await api.get('/dashboard/summary');
        if (summaryRes.data) {
          setSummary(summaryRes.data);
        }
      } catch (error) {
        console.error("Dashboard Math failed to load:", error);
      }

      // BLOCK 2: Fetch Low Stock Alerts (Isolated so it always runs)
      try {
        const productsRes = await api.get('/products/all');
        const criticalStock = productsRes.data.filter(
          (p: LowStockItem) => p.quantity <= p.lowStockThreshold
        );
        setLowStockAlerts(criticalStock);
      } catch (error) {
        console.error("Low Stock Alerts failed to load:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="text-white text-center py-20">Loading Dashboard...</div>;
  }

  return (
    <PageTransition>
      <div className="space-y-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Dashboard</h1>
            <p className="text-sm text-zinc-500 mt-1">Your store at a glance (Today's Data).</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
              <Bell size={16} strokeWidth={1.5} className="text-zinc-400" />
              {lowStockAlerts.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  {lowStockAlerts.length}
                </span>
              )}
            </button>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <div className="w-7 h-7 rounded-md bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                A
              </div>
              <div className="hidden sm:block">
                <p className="text-[13px] font-medium text-white">Admin</p>
                <p className="text-[10px] text-zinc-500">Store Manager</p>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <KPICard
            title="Total Sales (Qty)"
            value={summary.totalSalesQty.toString()}
            change="Today"
            changeType="up"
            icon={<DollarSign size={18} strokeWidth={1.5} />}
            glow="blue"
            delay={0}
          />
          <KPICard
            title="Total Revenue"
            value={`₹${summary.totalRevenue.toLocaleString()}`}
            change="Today"
            changeType="up"
            icon={<TrendingUp size={18} strokeWidth={1.5} />}
            glow="green"
            delay={0.1}
          />
          <KPICard
            title="Total Expenses"
            value={`₹${summary.totalExpenses.toLocaleString()}`}
            change="Today"
            changeType="down"
            icon={<Wallet size={18} strokeWidth={1.5} />}
            glow="red"
            delay={0.2}
          />
          <KPICard
            title="Net Profit"
            value={`₹${summary.netProfit.toLocaleString()}`}
            change="Today"
            changeType={summary.netProfit >= 0 ? "up" : "down"}
            icon={<ArrowUpRight size={18} strokeWidth={1.5} />}
            glow={summary.netProfit >= 0 ? "green" : "red"}
            delay={0.3}
          />
        </div>

        {/* Low Stock Alerts */}
        <div className="grid grid-cols-1 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <AlertTriangle size={18} strokeWidth={1.5} className="text-amber-400" />
                <div>
                  <h2 className="text-base font-semibold text-white tracking-tight">Low-Stock Alerts</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">{lowStockAlerts.length} items need restocking</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {lowStockAlerts.length === 0 ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-sm text-emerald-400 font-medium">All inventory levels are healthy!</p>
                </div>
              ) : (
                lowStockAlerts.map((item, i) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.08 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                      <div>
                        <p className="text-sm font-medium text-white">{item.name}</p>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Threshold: {item.lowStockThreshold}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-400">{item.quantity} left</p>
                      </div>
                      <button className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white text-xs font-medium transition-colors">
                        Restock
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </div>
        
      </div>
    </PageTransition>
  );
}