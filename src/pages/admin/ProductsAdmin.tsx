import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Image as ImageIcon, Loader2, Database } from 'lucide-react';
import { PRODUCTS, Product, ProductType } from '../../data/products';
import { motion, AnimatePresence } from 'motion/react';
import { db, storage } from '../../firebase';
import { collection, onSnapshot, query, doc, addDoc, updateDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function ProductsAdmin() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!isModalOpen) {
      setImageFile(null);
      setImagePreview(null);
    }
  }, [isModalOpen]);

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

  const seedData = async () => {
    if (!window.confirm("This will seed the initial product list to Firestore. Continue?")) return;
    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      PRODUCTS.forEach((product) => {
        const newDocRef = doc(collection(db, 'products'));
        batch.set(newDocRef, { ...product, stock: 50 });
      });
      await batch.commit();
      alert("Database seeded successfully!");
    } catch (error) {
      console.error("Error seeding data:", error);
      alert("Failed to seed database.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteDoc(doc(db, 'products', docId));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    let imageUrl = formData.get('image') as string;

    // Handle File Upload
    if (imageFile) {
      setIsUploading(true);
      try {
        const fileRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        const uploadResult = await uploadBytes(fileRef, imageFile);
        imageUrl = await getDownloadURL(uploadResult.ref);
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Failed to upload image.");
        setIsSubmitting(false);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const productData = {
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      type: formData.get('type') as ProductType,
      description: formData.get('description') as string,
      image: imageUrl,
      spiciness: Number(formData.get('spiciness')),
      id: editingProduct ? editingProduct.id : Date.now()
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.docId), productData);
        alert('Product updated successfully!');
      } else {
        await addDoc(collection(db, 'products'), productData);
        alert('New product added to inventory!');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error("Error saving product:", error);
      alert(`Failed to save product: ${error.message || 'Unknown error'}. Please check your Firebase rules.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[100vw] overflow-x-hidden md:max-w-none">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full max-w-[95vw] md:max-w-none mx-auto bg-white p-6 border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] transform -rotate-1 relative z-10 mt-4 md:mt-0">
         <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-warm-accent border border-warm-dark shadow-sm"></div>
        <div>
          <h1 className="text-3xl font-serif font-bold text-warm-dark italic">Inventory</h1>
          <p className="text-warm-dark/70 mt-2 font-serif">Manage your catalog of pickles and podis.</p>
        </div>
        
        <div className="flex gap-2">
          {products.length === 0 && !isLoading && (
            <button 
              onClick={seedData}
              disabled={isSubmitting}
              className="bg-white text-warm-dark px-4 py-3 font-bold tracking-widest uppercase text-[10px] flex items-center gap-2 border-2 border-warm-dark shadow-[2px_2px_0px_#3A2A22] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
            >
              <Database className="w-4 h-4" /> Seed Pantry
            </button>
          )}
          <button 
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="bg-warm-accent text-white px-6 py-3 font-bold tracking-widest uppercase text-[10px] flex items-center gap-2 border-2 border-warm-dark shadow-[2px_2px_0px_#3A2A22] hover:translate-y-1 hover:shadow-none transition-all"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#F4EBE1] border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] p-4 flex flex-col md:flex-row justify-between items-center gap-4 w-full max-w-[95vw] md:max-w-none mx-auto transform rotate-1 relative z-10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-dark/40" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-warm-dark bg-white focus:outline-none focus:ring-0 focus:border-warm-accent text-sm font-bold font-serif shadow-[2px_2px_0px_#3A2A22]"
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full max-w-[95vw] md:max-w-none mx-auto p-1">
        {isLoading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
             <Loader2 className="w-12 h-12 text-warm-accent animate-spin" />
             <p className="font-serif italic text-warm-dark/40">Opening the pantry drawers...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-white border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22]">
            <p className="font-serif font-bold text-2xl italic text-warm-dark/30">Your pantry is currently empty.</p>
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
                className="bg-[#F4EBE1] border-2 border-warm-dark shadow-[4px_4px_0px_#3A2A22] overflow-hidden flex flex-col group hover:-translate-y-1 transition-transform relative z-0"
              >
                <div className="h-48 relative border-b-2 border-dashed border-warm-dark/20 p-2 m-2 bg-white transform -rotate-1 group-hover:rotate-0 transition-transform">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover grayscale-[10%] contrast-110 sepia-[10%] group-hover:grayscale-0 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-white border-2 border-warm-dark px-2 py-1 text-[10px] uppercase font-bold tracking-wider text-warm-dark shadow-[2px_2px_0px_#3A2A22] transform -rotate-2">
                    {product.type}
                  </div>
                  <div className="absolute top-4 right-4 bg-warm-accent border-2 border-warm-dark text-white px-2 py-1 text-xs font-bold shadow-[2px_2px_0px_#3A2A22] transform rotate-3">
                    ₹{product.price}
                  </div>
                </div>
                
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-serif font-bold text-xl text-warm-dark mb-2">{product.name}</h3>
                  <p className="text-sm text-warm-dark/70 font-serif italic line-clamp-2 flex-1">
                    {product.description}
                  </p>
                  
                  <div className="mt-4 pt-4 border-t-2 border-dashed border-warm-dark/20 flex justify-end gap-2">
                    <button 
                      onClick={() => {
                        setEditingProduct(product);
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1.5 border-2 border-warm-dark bg-white text-warm-dark hover:bg-warm-dark hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0px_#3A2A22] hover:translate-y-px"
                    >
                      <Edit2 className="w-3 h-3" /> Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(product.docId)}
                      className="px-3 py-1.5 border-2 border-warm-dark bg-warm-accent text-white hover:bg-white hover:text-warm-accent transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest shadow-[2px_2px_0px_#3A2A22] hover:translate-y-px"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-warm-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white md:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] relative z-10 w-full md:max-w-2xl h-full md:h-auto md:max-h-[85vh] overflow-hidden flex flex-col border border-warm-dark/5"
            >
              <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-y-auto custom-scrollbar">
                <div className="p-8 pb-4 border-b border-warm-dark/5 sticky top-0 bg-white/80 backdrop-blur-md z-20 flex justify-between items-center">
                  <div>
                    <h2 className="text-3xl font-serif font-bold text-warm-dark italic">
                      {editingProduct ? 'Refine Product' : 'Seal a New Jar'}
                    </h2>
                    <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-warm-accent mt-1">Inventory Management</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-warm-bg rounded-full transition-colors text-warm-dark/40 hover:text-warm-dark"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-8 space-y-8 flex-1 bg-gradient-to-b from-white to-warm-bg/10">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-warm-dark/60">Product Name</label>
                        <input name="name" required defaultValue={editingProduct?.name} className="w-full px-5 py-3 rounded-xl border-2 border-warm-dark/10 bg-white focus:outline-none focus:border-warm-accent transition-all font-serif" placeholder="e.g. Garlic Pickle" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-warm-dark/60">Price (₹)</label>
                        <input name="price" required type="number" defaultValue={editingProduct?.price} className="w-full px-5 py-3 rounded-xl border-2 border-warm-dark/10 bg-white focus:outline-none focus:border-warm-accent transition-all font-serif" placeholder="299" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-warm-dark/60">Category</label>
                        <select name="type" defaultValue={editingProduct?.type || 'pickle'} className="w-full px-5 py-3 rounded-xl border-2 border-warm-dark/10 bg-white focus:outline-none focus:border-warm-accent transition-all font-serif">
                          <option value="pickle">Pickle</option>
                          <option value="podi">Podi</option>
                          <option value="bundle">Bundle</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-warm-dark/60">Stock Level</label>
                        <input name="stock" required type="number" defaultValue={editingProduct?.stock || 50} className="w-full px-5 py-3 rounded-xl border-2 border-warm-dark/10 bg-white focus:outline-none focus:border-warm-accent transition-all font-serif" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-warm-dark/60">Spiciness (1-3)</label>
                        <input name="spiciness" required type="number" min="1" max="3" defaultValue={editingProduct?.spiciness || 1} className="w-full px-5 py-3 rounded-xl border-2 border-warm-dark/10 bg-white focus:outline-none focus:border-warm-accent transition-all font-serif" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-bold uppercase tracking-widest text-warm-dark/60">Product Image</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div 
                          onClick={() => document.getElementById('image-upload')?.click()}
                          className="border-2 border-dashed border-warm-dark/20 bg-warm-bg/10 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:border-warm-accent hover:bg-warm-accent/5 transition-all min-h-[160px]"
                        >
                          {imagePreview || editingProduct?.image ? (
                            <div className="relative w-full h-full">
                              <img src={imagePreview || editingProduct?.image} alt="Preview" className="w-full h-[120px] object-cover rounded-lg border-2 border-warm-dark" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                <span className="text-white text-[10px] font-bold uppercase">Change Photo</span>
                              </div>
                            </div>
                          ) : (
                            <>
                              <ImageIcon className="w-8 h-8 text-warm-dark/20 mb-2" />
                              <span className="text-[10px] font-bold uppercase text-warm-dark/40">Upload Photo</span>
                            </>
                          )}
                          <input 
                            id="image-upload"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setImageFile(file);
                                setImagePreview(URL.createObjectURL(file));
                              }
                            }}
                          />
                        </div>

                        <div className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-warm-dark/40">Or Paste Image URL</label>
                            <input 
                              name="image" 
                              defaultValue={editingProduct?.image} 
                              className="w-full px-4 py-2 border-2 border-warm-dark bg-warm-bg/30 focus:outline-none focus:border-warm-accent text-xs" 
                              placeholder="https://..." 
                            />
                          </div>
                          <p className="text-[10px] text-warm-dark/40 font-serif italic italic leading-relaxed">
                            Uploading a file is recommended for reliability. Supported formats: JPG, PNG, WEBP.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold uppercase tracking-widest text-warm-dark/60">Description</label>
                      <textarea name="description" required rows={3} defaultValue={editingProduct?.description} className="w-full px-5 py-3 rounded-xl border-2 border-warm-dark/10 bg-white focus:outline-none focus:border-warm-accent transition-all font-serif" placeholder="Short description..."></textarea>
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t border-warm-dark/5 bg-white/90 backdrop-blur-md flex justify-end items-center gap-6 sticky bottom-0 z-20">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs font-bold uppercase tracking-widest text-warm-dark/40 hover:text-warm-accent transition-colors"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="bg-warm-dark text-white px-10 py-4 rounded-xl font-bold tracking-widest uppercase text-xs shadow-xl hover:bg-warm-accent hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
                  >
                    {isUploading ? 'Uploading Image...' : isSubmitting ? 'Saving...' : 'Save Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
