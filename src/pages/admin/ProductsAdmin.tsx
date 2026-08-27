import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { usePopups } from '../../context/PopupContext';
import SEO from '../../components/SEO';
import { getProductStock } from '../../utils/price';

export default function ProductsAdmin() {
  const { showAlert, showToast, showConfirm } = usePopups();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const handleDelete = async (docId: string) => {
    const confirmed = await showConfirm("Are you sure you want to delete this product?", "Delete Product");
    if (!confirmed) return;
    try {
      await deleteDoc(doc(db, 'products', docId));
      showToast("Product deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting product:", error);
      showAlert("Failed to delete product.", "Error");
    }
  };

  const filteredProducts = products.filter(p => 
    (p.name || '').toLowerCase().includes(search.toLowerCase()) || 
    (p.type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[100vw] overflow-x-hidden md:max-w-none">
      <SEO title="Products Admin" description="Manage inventory catalog" />
      <div className="bg-warm-light p-6 rounded-2xl border border-warm-dark/5 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-warm-dark">Inventory Catalog</h2>
          <p className="text-sm text-warm-dark/60 mt-1 font-serif">Manage your catalog of pickles, podis, snacks, and bundles.</p>
        </div>
        
        <div className="flex gap-2">
          <Link 
            to="/admin/products/new"
            className="bg-warm-accent text-white px-6 py-3 rounded-xl font-bold tracking-widest uppercase text-xs flex items-center gap-2 transition-all hover:bg-warm-accent/90 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" /> Craft New Product
          </Link>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-warm-light border border-warm-dark/5 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 w-full max-w-[95vw] md:max-w-none mx-auto relative z-10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-dark/40" />
          <input 
            type="text" 
            placeholder="Search products by name or category..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-warm-dark/10 bg-white focus:outline-none focus:ring-0 focus:border-warm-accent text-sm font-serif"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-[95vw] md:max-w-none mx-auto p-1">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-12 h-12 text-warm-accent animate-spin" />
             <p className="font-serif italic text-warm-dark/40">Loading inventory catalog...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white border border-warm-dark/5 rounded-[24px] shadow-sm">
            <p className="font-serif font-bold text-2xl italic text-warm-dark/30">Your inventory is currently empty.</p>
            <Link to="/admin/products/new" className="inline-block mt-4 text-xs font-bold uppercase text-warm-accent hover:underline">
              + Craft your first product
            </Link>
          </div>
        ) : (
          <AnimatePresence>
            {filteredProducts.map(product => (
              <motion.div
                layout
                key={product.docId}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-[24px] border border-warm-dark/5 shadow-sm overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-md"
              >
                <div className="h-56 relative overflow-hidden bg-warm-light/40">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 flex gap-1.5 z-10">
                    <span className="bg-white/95 backdrop-blur-sm px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider text-warm-dark rounded-full shadow-sm">
                      {product.type}
                    </span>
                    {product.isBestseller && (
                      <span className="bg-warm-accent text-white px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full shadow-sm font-sans flex items-center gap-1">
                        ★ Bestseller
                      </span>
                    )}
                  </div>
                  <div className="absolute top-4 right-4 bg-warm-accent text-white px-2.5 py-1 text-xs font-bold rounded-full shadow-sm">
                    ₹{product.price}
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-serif font-bold text-xl text-warm-dark mb-2">{product.name}</h3>
                  <p className="text-sm text-warm-dark/60 font-serif italic line-clamp-3 flex-1 leading-relaxed">
                    {product.description}
                  </p>
                  
                  <div className="mt-5 pt-4 border-t border-warm-dark/5 flex justify-between items-center gap-2">
                    <button
                      onClick={async () => {
                        const currentStock = getProductStock(product);
                        const isOutOfStock = currentStock <= 0;
                        const newStock = isOutOfStock ? 50 : 0;
                        
                        const updates: any = { stock: newStock };
                        if (product.weightStocks && typeof product.weightStocks === 'object') {
                          const newWeightStocks: Record<string, number> = {};
                          Object.keys(product.weightStocks).forEach(w => {
                            newWeightStocks[w] = newStock;
                          });
                          updates.weightStocks = newWeightStocks;
                        }

                        try {
                          await updateDoc(doc(db, 'products', product.docId), updates);
                          showToast(`Updated stock status for ${product.name}`, 'info');
                        } catch (err) {
                          console.error("Error toggling stock status:", err);
                        }
                      }}
                      className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        getProductStock(product) <= 0
                          ? 'bg-green-50 text-green-600 border-green-200/60 hover:bg-green-100 hover:border-green-300'
                          : 'bg-red-50/50 text-red-600 border-red-200/45 hover:bg-red-50 hover:border-red-300'
                      }`}
                    >
                      {getProductStock(product) <= 0 ? '✓ Mark In Stock' : '✕ Out of Stock'}
                    </button>
                    <div className="flex gap-2">
                      <Link 
                        to={`/admin/products/edit/${product.id}`}
                        className="px-3.5 py-2 rounded-xl border border-warm-dark/10 bg-white text-warm-dark hover:bg-warm-dark hover:text-white transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.docId)}
                        className="px-3.5 py-2 rounded-xl border border-warm-dark/10 bg-warm-accent text-white hover:bg-white hover:text-warm-accent transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
