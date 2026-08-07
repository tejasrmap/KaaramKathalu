import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Image as ImageIcon, Loader2, X, Check } from 'lucide-react';
import { Product, ProductType } from '../../data/products';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../../firebase';
import { collection, onSnapshot, query, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { supabase } from '../../supabase';
import { usePopups } from '../../context/PopupContext';

export default function ProductsAdmin() {
  const { showAlert, showToast, showConfirm } = usePopups();
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [categoryType, setCategoryType] = useState<string>('pickle');
  const [spiciness, setSpiciness] = useState<number>(1);
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [isBestseller, setIsBestseller] = useState<boolean>(false);
  const [hasJarOption, setHasJarOption] = useState<boolean>(true);
  const [availableWeights, setAvailableWeights] = useState<number[]>([250, 500, 1000]);

  const [imageList, setImageList] = useState<string[]>([]);
  const [newUrlInput, setNewUrlInput] = useState<string>('');

  useEffect(() => {
    if (!isModalOpen) {
      setImageFile(null);
      setImagePreview(null);
      setNewUrlInput('');
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen) {
      if (editingProduct) {
        setCategoryType(editingProduct.type || 'pickle');
        setSpiciness(editingProduct.spiciness || 1);
        setIsBestseller(!!editingProduct.isBestseller);
        setHasJarOption(editingProduct.hasJarOption !== false);
        setAvailableWeights(editingProduct.availableWeights || [250, 500, 1000]);
        
        const imgs = editingProduct.images && editingProduct.images.length > 0 
          ? editingProduct.images 
          : editingProduct.image ? [editingProduct.image] : [];
        setImageList(imgs);

        if (editingProduct.image && !editingProduct.image.includes('supabase.co') && !editingProduct.image.includes('firebasestorage')) {
          setImageTab('url');
        } else {
          setImageTab('upload');
        }
      } else {
        setCategoryType('pickle');
        setSpiciness(1);
        setIsBestseller(false);
        setHasJarOption(true);
        setAvailableWeights([250, 500, 1000]);
        setImageList([]);
        setImageTab('upload');
      }
    }
  }, [isModalOpen, editingProduct]);

  const handleMultiFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsUploading(true);
    const uploadedUrls: string[] = [];
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { error } = await supabase.storage
          .from('media')
          .upload(filePath, file, { cacheControl: '3600', upsert: false });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        uploadedUrls.push(publicUrl);
      }
      setImageList(prev => [...prev, ...uploadedUrls]);
      showToast(`Uploaded ${uploadedUrls.length} image(s)!`, 'success');
    } catch (error: any) {
      console.error("Error uploading images to Supabase:", error);
      showAlert("Failed to upload images: " + (error?.message || JSON.stringify(error)), "Upload Error");
    } finally {
      setIsUploading(false);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    let imageUrl = formData.get('image') as string;

    // Handle File Upload to Supabase Storage
    if (imageFile) {
      setIsUploading(true);
      try {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `products/${fileName}`;

        const { data, error } = await supabase.storage
          .from('media')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('media')
          .getPublicUrl(filePath);

        imageUrl = publicUrl;
      } catch (error: any) {
        console.error("Error uploading image to Supabase:", error);
        showAlert("Failed to upload image: " + (error?.message || error?.error_description || JSON.stringify(error)), "Upload Error");
        setIsSubmitting(false);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const mainImage = imageList[0] || (formData.get('image') as string) || '';
    const productData = {
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      stock: Number(formData.get('stock')),
      weightGrams: Number(formData.get('weightGrams')) || 500,
      availableWeights: availableWeights,
      hasJarOption: hasJarOption,
      type: formData.get('type') as ProductType,
      description: formData.get('description') as string,
      image: mainImage,
      images: imageList.length > 0 ? imageList : (mainImage ? [mainImage] : []),
      spiciness: Number(formData.get('spiciness')),
      isBestseller: formData.get('isBestseller') === 'true',
      id: editingProduct ? editingProduct.id : Date.now()
    };

    try {
      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.docId), productData);
        showToast('Product updated successfully!', 'success');
      } else {
        await addDoc(collection(db, 'products'), productData);
        showToast('New product added to inventory!', 'success');
      }
      setIsModalOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error("Error saving product:", error);
      showAlert(`Failed to save product: ${error.message || 'Unknown error'}. Please check your Firebase rules.`, "Save Error");
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
      <div className="bg-warm-light p-6 rounded-2xl border border-warm-dark/5 shadow-sm mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-serif font-bold text-warm-dark">Inventory</h2>
          <p className="text-sm text-warm-dark/60 mt-1 font-serif">Manage your catalog of pickles and podis.</p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={() => {
              setEditingProduct(null);
              setIsModalOpen(true);
            }}
            className="bg-warm-accent text-white px-6 py-2.5 rounded-xl font-bold tracking-widest uppercase text-[10px] flex items-center gap-2 transition-all hover:bg-warm-accent/90 cursor-pointer shadow-sm animate-pulse"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-warm-light border border-warm-dark/5 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 w-full max-w-[95vw] md:max-w-none mx-auto relative z-10">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-dark/40" />
          <input 
            type="text" 
            placeholder="Search products..." 
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
                <div className="h-56 relative overflow-hidden">
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
                        const isOutOfStock = product.stock <= 0;
                        const newStock = isOutOfStock ? 50 : 0;
                        try {
                          await updateDoc(doc(db, 'products', product.docId), { stock: newStock });
                        } catch (err) {
                          console.error("Error toggling stock status:", err);
                        }
                      }}
                      className={`px-3 py-2 rounded-xl border flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        product.stock <= 0
                          ? 'bg-green-50 text-green-600 border-green-200/60 hover:bg-green-100 hover:border-green-300'
                          : 'bg-red-50/50 text-red-600 border-red-200/45 hover:bg-red-50 hover:border-red-300'
                      }`}
                    >
                      {product.stock <= 0 ? '✓ Mark In Stock' : '✕ Out of Stock'}
                    </button>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingProduct(product);
                          setIsModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl border border-warm-dark/10 bg-white text-warm-dark hover:bg-warm-dark hover:text-white transition-colors flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
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
              className="bg-white md:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative z-10 w-full md:max-w-2xl h-full md:h-auto md:max-h-[85vh] overflow-hidden flex flex-col border border-warm-dark/5"
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
                    className="p-2 hover:bg-warm-bg rounded-full transition-colors text-warm-dark/40 hover:text-warm-dark cursor-pointer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-8 space-y-8 flex-1 bg-gradient-to-b from-white to-warm-bg/10">
                  <div className="space-y-6">
                    {/* Basic details: Name and Price */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-warm-dark/50 mb-2">Product Name</label>
                        <input 
                          name="name" 
                          required 
                          defaultValue={editingProduct?.name} 
                          className="w-full bg-white border border-warm-dark/10 rounded-xl p-3.5 font-serif focus:ring-2 focus:ring-warm-accent/20 focus:border-warm-accent outline-none transition-all shadow-sm focus:shadow-md text-sm" 
                          placeholder="e.g. Garlic Pickle" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-warm-dark/50 mb-2">Price (₹)</label>
                        <input 
                          name="price" 
                          required 
                          type="number" 
                          defaultValue={editingProduct?.price} 
                          className="w-full bg-white border border-warm-dark/10 rounded-xl p-3.5 font-serif focus:ring-2 focus:ring-warm-accent/20 focus:border-warm-accent outline-none transition-all shadow-sm focus:shadow-md text-sm" 
                          placeholder="299" 
                        />
                      </div>
                    </div>

                    {/* Stock, Weight and Spiciness */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-warm-dark/50 mb-2">Stock Level</label>
                        <input 
                          name="stock" 
                          required 
                          type="number" 
                          defaultValue={editingProduct?.stock ?? 50} 
                          className="w-full bg-white border border-warm-dark/10 rounded-xl p-3.5 font-serif focus:ring-2 focus:ring-warm-accent/20 focus:border-warm-accent outline-none transition-all shadow-sm focus:shadow-md text-sm" 
                        />
                      </div>
                    </div>

                    {/* Weight and Spiciness */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-warm-dark/50 mb-2">Product Weight (grams)</label>
                        <input 
                          name="weightGrams" 
                          required 
                          type="number" 
                          min="1"
                          defaultValue={editingProduct?.weightGrams ?? 500} 
                          className="w-full bg-white border border-warm-dark/10 rounded-xl p-3.5 font-serif focus:ring-2 focus:ring-warm-accent/20 focus:border-warm-accent outline-none transition-all shadow-sm focus:shadow-md text-sm" 
                          placeholder="e.g. 250"
                        />
                        <p className="text-[10px] text-warm-dark/40 font-serif italic">Net weight per jar/packet in grams. Used for shipping cost calculation.</p>
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] uppercase font-bold tracking-widest text-warm-dark/50 mb-2">Spiciness Level</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { level: 1, label: '🌶️ Mild' },
                            { level: 2, label: '🌶️🌶️ Med' },
                            { level: 3, label: '🌶️🌶️🌶️ Hot' }
                          ].map(item => (
                            <button
                              key={item.level}
                              type="button"
                              onClick={() => setSpiciness(item.level)}
                              className={`py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border shadow-sm cursor-pointer text-center ${
                                spiciness === item.level
                                  ? 'bg-warm-dark text-white border-warm-dark'
                                  : 'bg-white text-warm-dark/70 border-warm-dark/10 hover:bg-warm-light/50'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                        <input type="hidden" name="spiciness" value={spiciness} />
                      </div>
                    </div>

                    {/* Category Selector (Pills style) */}
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase font-bold tracking-widest text-warm-dark/50 mb-2">Category</label>
                      <div className="flex flex-wrap gap-2">
                        {['pickle', 'podi', 'snacks', 'fryums', 'bundle'].map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategoryType(cat)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border border-warm-dark/10 shadow-sm cursor-pointer ${
                              categoryType === cat
                                ? 'bg-warm-accent text-white border-warm-accent'
                                : 'bg-white text-warm-dark/70 hover:bg-warm-light/50'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      <input type="hidden" name="type" value={categoryType} />
                    </div>

                    {/* Bestseller Toggle */}
                    <div className="flex items-center justify-between p-4 bg-warm-light/40 border border-warm-dark/10 rounded-xl shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-warm-dark">Tag as Bestseller</span>
                        <span className="text-[10px] text-warm-dark/40 font-serif italic">Should this show in the Home page bestseller section?</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsBestseller(!isBestseller)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isBestseller ? 'bg-warm-accent' : 'bg-warm-dark/10'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            isBestseller ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                      <input type="hidden" name="isBestseller" value={isBestseller ? 'true' : 'false'} />
                    </div>

                    {/* Glass Jar Packaging Option (+₹100) Toggle */}
                    <div className="flex items-center justify-between p-4 bg-warm-light/40 border border-warm-dark/10 rounded-xl shadow-sm">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-wider text-warm-dark flex items-center gap-1.5">
                          🫙 Glass Jar Option (+₹100)
                        </span>
                        <span className="text-[10px] text-warm-dark/40 font-serif italic">Enable customer option to upgrade packaging to Glass Jar for +₹100</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setHasJarOption(!hasJarOption)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          hasJarOption ? 'bg-warm-accent' : 'bg-warm-dark/10'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            hasJarOption ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Available Weight Options (250g, 500g & 1000g) */}
                    <div className="space-y-2 p-4 bg-warm-light/40 border border-warm-dark/10 rounded-xl shadow-sm">
                      <label className="block text-xs font-bold uppercase tracking-wider text-warm-dark">Available Weight Options</label>
                      <div className="flex gap-3 pt-1">
                        {[250, 500, 1000].map(weight => {
                          const isSelected = availableWeights.includes(weight);
                          return (
                            <button
                              key={weight}
                              type="button"
                              onClick={() => {
                                if (isSelected) {
                                  if (availableWeights.length > 1) {
                                    setAvailableWeights(availableWeights.filter(w => w !== weight));
                                  }
                                } else {
                                  setAvailableWeights([...availableWeights, weight].sort((a,b) => a-b));
                                }
                              }}
                              className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center gap-2 shadow-xs cursor-pointer ${
                                isSelected
                                  ? 'bg-warm-accent/10 border-warm-accent text-warm-accent ring-1 ring-warm-accent/30 font-black'
                                  : 'bg-white text-warm-dark/70 border-warm-dark/15 hover:border-warm-dark/40 hover:bg-warm-light/40'
                              }`}
                            >
                              {isSelected && <Check className="w-4 h-4 stroke-[3] text-warm-accent" />}
                              <span>{weight === 1000 ? '1000g (1kg)' : `${weight}g`}</span>
                            </button>
                          );
                        })}
                      </div>
                      <p className="text-[10px] text-warm-dark/40 font-serif italic mt-1">Select available weight variants for customers (250g = 0.5x, 500g = 1x, 1000g = 2x base price).</p>
                    </div>

                    {/* Product Images Gallery (Multiple Images) */}
                    <div className="space-y-4 p-4 bg-warm-light/40 border border-warm-dark/10 rounded-xl shadow-sm">
                      <div className="flex justify-between items-center">
                        <label className="block text-xs font-bold uppercase tracking-wider text-warm-dark">Product Gallery Images ({imageList.length})</label>
                        <span className="text-[10px] text-warm-dark/40 font-serif italic">First image is used as main cover</span>
                      </div>

                      {/* Existing Images Thumbnails */}
                      {imageList.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {imageList.map((url, index) => (
                            <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-warm-dark/15 bg-white shadow-xs group">
                              <img src={url} alt={`Product view ${index + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              {index === 0 && (
                                <span className="absolute top-1.5 left-1.5 bg-warm-accent text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded shadow-sm">
                                  ★ Main Cover
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => setImageList(prev => prev.filter((_, idx) => idx !== index))}
                                className="absolute top-1.5 right-1.5 p-1 bg-red-600/90 hover:bg-red-600 text-white rounded-full shadow-md transition-all cursor-pointer opacity-90 group-hover:opacity-100"
                                title="Remove image"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Image Add Selector Tabs */}
                      <div className="pt-2 border-t border-warm-dark/10">
                        <div className="flex border-b border-warm-dark/10 mb-3 gap-4">
                          <button
                            type="button"
                            onClick={() => setImageTab('upload')}
                            className={`pb-1.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                              imageTab === 'upload' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                            }`}
                          >
                            Upload File(s)
                          </button>
                          <button
                            type="button"
                            onClick={() => setImageTab('url')}
                            className={`pb-1.5 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                              imageTab === 'url' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                            }`}
                          >
                            Add Image URL
                          </button>
                        </div>

                        {imageTab === 'upload' ? (
                          <div 
                            onClick={() => document.getElementById('multi-image-upload')?.click()}
                            className="border-2 border-dashed border-warm-dark/15 bg-white hover:bg-warm-accent/5 hover:border-warm-accent transition-all rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer min-h-[110px]"
                          >
                            <ImageIcon className="w-6 h-6 text-warm-dark/30 mb-1" />
                            <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/60">Upload Image File(s)</span>
                            <span className="text-[10px] text-warm-dark/40 mt-0.5 font-serif italic">Select one or multiple photos to add to gallery</span>
                            <input 
                              id="multi-image-upload"
                              type="file" 
                              accept="image/*" 
                              multiple
                              className="hidden" 
                              onChange={(e) => handleMultiFileUpload(e.target.files)}
                            />
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <input 
                              type="url"
                              value={newUrlInput} 
                              onChange={e => setNewUrlInput(e.target.value)}
                              className="flex-1 bg-white border border-warm-dark/10 rounded-xl p-3 font-serif text-xs outline-none focus:border-warm-accent"
                              placeholder="https://example.com/product-image.jpg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (newUrlInput.trim()) {
                                  setImageList(prev => [...prev, newUrlInput.trim()]);
                                  setNewUrlInput('');
                                }
                              }}
                              className="px-4 py-3 bg-warm-dark hover:bg-warm-accent text-white font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer"
                            >
                              Add URL
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="block text-[10px] uppercase font-bold tracking-widest text-warm-dark/50 mb-2">Description</label>
                      <textarea 
                        name="description" 
                        required 
                        rows={3} 
                        defaultValue={editingProduct?.description} 
                        className="w-full bg-white border border-warm-dark/10 rounded-xl p-3.5 font-serif focus:ring-2 focus:ring-warm-accent/20 focus:border-warm-accent outline-none transition-all shadow-sm focus:shadow-md text-sm" 
                        placeholder="Short description..."
                      />
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t border-warm-dark/5 bg-white/90 backdrop-blur-md flex justify-end items-center gap-6 sticky bottom-0 z-20">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="text-xs font-bold uppercase tracking-widest text-warm-dark/40 hover:text-warm-accent transition-colors cursor-pointer"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="bg-warm-dark hover:bg-warm-accent text-white px-10 py-4 rounded-xl font-bold tracking-widest uppercase text-xs transition-all disabled:opacity-50 cursor-pointer shadow-sm"
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
