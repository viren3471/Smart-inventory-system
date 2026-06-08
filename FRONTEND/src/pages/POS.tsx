import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, ShoppingCart, CheckCircle, X, Image as ImageIcon } from 'lucide-react';
import { PageTransition } from '../components/Skeleton';
import api from '../api'; 

interface Product {
  _id: string;
  name: string;
  quantity: number;
  costPrice: number;
  sellingPrice: number;
  lowStockThreshold: number;
  imageUrl?: string; // <--- We added an optional image field!
}

interface CartItem extends Product {
  qty: number;
}

export default function POS() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]); 
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const res = await api.get('/products/all');
        setProducts(res.data);
      } catch (error: any) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInventory();
  }, []);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())),
    [search, products]
  );

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item._id === product._id);
      if (existing) {
        if (existing.qty >= product.quantity) return prev;
        return prev.map((item) =>
          item._id === product._id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      if (product.quantity <= 0) {
        alert("This item is out of stock!");
        return prev;
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number, maxStock: number) =>{
    setCart((prev) =>
      prev
        .map((item) => {
          if (item._id === id) {
            const newQty = item.qty + delta;
            if (newQty > 0 && newQty <= maxStock) {
              return { ...item, qty: newQty };
            }
          }
          return item;
        })
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item._id !== id));
  };

  const total = cart.reduce((sum, item) => sum + item.sellingPrice * item.qty, 0);

  const completeSale = async () => {
    if (cart.length === 0) return;
    try {
      for (const item of cart) {
        await api.post('/sales/add', {
          productId: item._id,
          quantitySold: item.qty
        });
      }
      setShowSuccess(true);
      const res = await api.get('/products/all');
      setProducts(res.data);
      
      setTimeout(() => {
        setCart([]);
        setShowSuccess(false);
      }, 2000);
    } catch (error: any) {
      alert("Failed to process sale.");
    }
  };

  if (loading) return <div className="text-center py-20 text-white">Loading Register...</div>;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">Point of Sale</h1>
          <p className="text-sm text-zinc-500 mt-1">Quick sale entry for cashiers</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Product Selection */}
          <div className="lg:col-span-3 space-y-4">
            <div className="relative">
              <Search size={15} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 shadow-sm"
              />
            </div>

            {/* UPGRADED GRID UI HERE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((product) => (
                <motion.button
                  key={product._id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToCart(product)}
                  className={`bg-white/5 border rounded-xl p-3 text-left transition-all group flex items-center gap-4 ${
                    product.quantity <= 0 
                      ? 'border-red-500/30 opacity-50 cursor-not-allowed' 
                      : 'border-white/10 hover:bg-white/[0.08] hover:border-white/[0.2] hover:shadow-lg hover:shadow-white/5'
                  }`}
                >
                  {/* Image Thumbnail Box */}
                  <div className="w-14 h-14 rounded-lg bg-zinc-800/50 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      // Fallback if no image: Show the first letter of the product!
                      <span className="text-xl font-bold text-zinc-600 group-hover:text-blue-400 transition-colors">
                        {product.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
                      {product.name}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-base font-bold text-blue-400">₹{product.sellingPrice}</p>
                      <p className={`text-[11px] px-2 py-0.5 rounded-full ${product.quantity <= product.lowStockThreshold ? 'bg-red-500/10 text-red-400' : 'bg-white/10 text-zinc-400'}`}>
                        Stock: {product.quantity}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Cart */}
          <div className="lg:col-span-2">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl shadow-2xl p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <ShoppingCart size={20} strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">Current Cart</h2>
                    <p className="text-xs text-zinc-500">{cart.length} items selected</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence>
                  {cart.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/[0.04] border border-white/[0.08]"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.name}</p>
                        <p className="text-xs text-zinc-500">₹{item.sellingPrice} each</p>
                      </div>
                      <div className="flex items-center gap-1 bg-black/20 rounded-lg p-1 border border-white/5">
                        <button onClick={() => updateQty(item._id, -1, item.quantity)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/10 text-zinc-400 transition-colors">
                          <Minus size={12} />
                        </button>
                        <span className="text-sm font-bold text-white w-6 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item._id, 1, item.quantity)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-white/10 text-zinc-400 transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item._id)} className="ml-2 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <X size={16} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {cart.length === 0 && (
                  <div className="text-center py-12 px-4 border border-dashed border-white/10 rounded-2xl">
                    <ImageIcon size={32} strokeWidth={1} className="mx-auto text-zinc-600 mb-3" />
                    <p className="text-sm font-medium text-zinc-400">Your cart is empty</p>
                    <p className="text-xs text-zinc-600 mt-1">Tap a product on the left to add it.</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-white/10">
                <div className="flex items-end justify-between mb-6">
                  <span className="text-sm font-medium text-zinc-400">Total Amount</span>
                  <span className="text-4xl font-bold text-white tracking-tight">
                    ₹{total.toLocaleString()}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={completeSale}
                  disabled={cart.length === 0}
                  className={`w-full py-4 rounded-xl font-bold text-sm transition-all duration-200 shadow-lg ${
                    cart.length > 0
                      ? 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/25'
                      : 'bg-white/5 text-zinc-600 cursor-not-allowed border border-white/10 shadow-none'
                  }`}
                >
                  {showSuccess ? (
                    <span className="flex items-center justify-center gap-2 text-emerald-400">
                      <CheckCircle size={18} /> Sale Completed!
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <ShoppingCart size={18} /> Checkout & Pay
                    </span>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}