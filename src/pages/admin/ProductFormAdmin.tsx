import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon, Loader2, Check, Flame, X, Package, Sparkles } from 'lucide-react';
import { Product, ProductType } from '../../data/products';
import { db } from '../../firebase';
import { collection, query, where, getDocs, doc, addDoc, updateDoc, limit } from 'firebase/firestore';
import { supabase } from '../../supabase';
import { usePopups } from '../../context/PopupContext';
import SEO from '../../components/SEO';

export default function ProductFormAdmin() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showAlert, showToast } = usePopups();

  const isEditMode = Boolean(id);

  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Form State
  const [docId, setDocId] = useState<string | null>(null);
  const [productId, setProductId] = useState<number>(Date.now());
  const [name, setName] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [stock, setStock] = useState<string>('50');
  const [weightGrams, setWeightGrams] = useState<string>('250');
  const [type, setType] = useState<ProductType>('pickle');
  const [spiciness, setSpiciness] = useState<number>(2);
  const [isBestseller, setIsBestseller] = useState<boolean>(false);
  const [hasJarOption, setHasJarOption] = useState<boolean>(true);
  const [availableWeights, setAvailableWeights] = useState<number[]>([250, 500, 1000]);
  
  const [description, setDescription] = useState<string>('');
  const [longDescription, setLongDescription] = useState<string>('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState<string>('');

  // Image Management State
  const [imageList, setImageList] = useState<string[]>([]);
  const [imageTab, setImageTab] = useState<'upload' | 'url'>('upload');
  const [newUrlInput, setNewUrlInput] = useState<string>('');

  // Fetch product data if in edit mode
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        let q = query(collection(db, 'products'), where('id', '==', Number(id)), limit(1));
        let snap = await getDocs(q);

        if (snap.empty) {
          // Try docId directly
          const qDoc = query(collection(db, 'products'), where('__name__', '==', id), limit(1));
          snap = await getDocs(qDoc);
        }

        if (!snap.empty) {
          const docSnap = snap.docs[0];
          const prod = docSnap.data() as Product;
          setDocId(docSnap.id);
          setProductId(prod.id || Date.now());
          setName(prod.name || '');
          setPrice(String(prod.price || ''));
          setStock(String(prod.stock ?? 50));
          setWeightGrams(String(prod.weightGrams || 250));
          setType(prod.type || 'pickle');
          setSpiciness(prod.spiciness || 1);
          setIsBestseller(!!prod.isBestseller);
          setHasJarOption(prod.hasJarOption !== false);
          setAvailableWeights(prod.availableWeights || [250, 500, 1000]);
          setDescription(prod.description || '');
          setLongDescription(prod.longDescription || '');
          setIngredients(prod.ingredients || []);

          const imgs = prod.images && prod.images.length > 0
            ? prod.images
            : prod.image ? [prod.image] : [];
          setImageList(imgs);
        } else {
          showAlert("Product not found.", "Error");
          navigate('/admin/products');
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        showAlert("Failed to load product details.", "Error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, showAlert]);

  // Handle file uploads to Supabase Storage
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

  // Add ingredient tag
  const handleAddIngredient = () => {
    if (ingredientInput.trim()) {
      if (!ingredients.includes(ingredientInput.trim())) {
        setIngredients(prev => [...prev, ingredientInput.trim()]);
      }
      setIngredientInput('');
    }
  };

  // Save product to Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showAlert("Please enter a product name.", "Validation Error");
      return;
    }
    if (!price || Number(price) <= 0) {
      showAlert("Please enter a valid price.", "Validation Error");
      return;
    }

    setIsSubmitting(true);

    try {
      const mainImage = imageList[0] || '';
      const productPayload = {
        id: productId,
        name: name.trim(),
        price: Number(price),
        stock: Number(stock) || 0,
        weightGrams: Number(weightGrams) || 250,
        availableWeights: availableWeights,
        hasJarOption: hasJarOption,
        type: type,
        spiciness: Number(spiciness),
        isBestseller: isBestseller,
        description: description.trim(),
        longDescription: longDescription.trim() || description.trim(),
        ingredients: ingredients,
        image: mainImage,
        images: imageList.length > 0 ? imageList : (mainImage ? [mainImage] : [])
      };

      if (isEditMode && docId) {
        await updateDoc(doc(db, 'products', docId), productPayload);
        showToast("Product updated successfully!", "success");
      } else {
        await addDoc(collection(db, 'products'), productPayload);
        showToast("New product created successfully!", "success");
      }

      navigate('/admin/products');
    } catch (error: any) {
      console.error("Error saving product:", error);
      showAlert("Failed to save product: " + (error?.message || "Unknown error"), "Error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-12 h-12 text-warm-accent animate-spin mb-4" />
        <p className="font-serif italic text-warm-dark/40">Loading product editor...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      <SEO title={isEditMode ? `Edit ${name}` : 'Craft New Product'} description="Admin product creation & editing portal" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-dark/10 pb-6">
        <div>
          <Link 
            to="/admin/products" 
            className="inline-flex items-center gap-2 text-warm-dark/60 hover:text-warm-accent font-bold uppercase tracking-wider text-xs mb-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Products Catalog
          </Link>
          <h1 className="text-3xl sm:text-4xl font-serif text-warm-dark leading-tight flex items-center gap-3">
            {isEditMode ? 'Refine Product' : 'Craft New Product'}
            {isBestseller && (
              <span className="text-xs font-bold uppercase tracking-wider bg-warm-accent/10 border border-warm-accent/30 text-warm-accent px-2.5 py-1 rounded-full flex items-center gap-1 font-sans">
                <Sparkles className="w-3.5 h-3.5" /> Bestseller
              </span>
            )}
          </h1>
          <p className="text-warm-dark/60 font-serif italic text-sm mt-1">
            {isEditMode ? 'Update recipe details, pricing, variants and gallery imagery.' : 'Fill in the catalog specifications to publish a new authentic delicacy.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-5 py-3 border border-warm-dark/20 text-warm-dark hover:bg-warm-light/50 font-bold uppercase tracking-wider text-xs rounded-xl transition-all"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isUploading}
            className="px-6 py-3 bg-warm-dark hover:bg-warm-accent text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> {isEditMode ? 'Update Product' : 'Publish Product'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Core Info & Copy (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Basic Details Card */}
          <div className="bg-white rounded-2xl border border-warm-dark/10 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-serif font-bold text-warm-dark border-b border-warm-dark/10 pb-3 flex items-center gap-2">
              <Package className="w-5 h-5 text-warm-accent" /> Essential Product Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warm-dark mb-2">
                  Product Name <span className="text-warm-accent">*</span>
                </label>
                <input 
                  type="text" 
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Chicken Pickle Tender & Juicy"
                  className="w-full bg-warm-light/30 border border-warm-dark/15 rounded-xl p-3.5 font-serif text-base focus:ring-2 focus:ring-warm-accent/20 focus:border-warm-accent outline-none transition-all shadow-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-warm-dark mb-2">
                    Base Price (₹) <span className="text-warm-accent">*</span>
                  </label>
                  <input 
                    type="number" 
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="475"
                    min="1"
                    className="w-full bg-warm-light/30 border border-warm-dark/15 rounded-xl p-3 font-serif text-sm focus:ring-2 focus:ring-warm-accent/20 focus:border-warm-accent outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-warm-dark mb-2">
                    Stock Level
                  </label>
                  <input 
                    type="number" 
                    value={stock}
                    onChange={e => setStock(e.target.value)}
                    placeholder="50"
                    min="0"
                    className="w-full bg-warm-light/30 border border-warm-dark/15 rounded-xl p-3 font-serif text-sm focus:ring-2 focus:ring-warm-accent/20 focus:border-warm-accent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-warm-dark mb-2">
                    Base Weight (g)
                  </label>
                  <input 
                    type="number" 
                    value={weightGrams}
                    onChange={e => setWeightGrams(e.target.value)}
                    placeholder="250"
                    className="w-full bg-warm-light/30 border border-warm-dark/15 rounded-xl p-3 font-serif text-sm focus:ring-2 focus:ring-warm-accent/20 focus:border-warm-accent outline-none"
                  />
                </div>
              </div>

              {/* Category Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warm-dark mb-2.5">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {(['pickle', 'podi', 'snacks', 'fryums', 'bundle'] as ProductType[]).map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setType(cat)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        type === cat
                          ? 'bg-warm-dark text-white border-warm-dark shadow-sm'
                          : 'bg-white text-warm-dark/60 border-warm-dark/15 hover:bg-warm-light/50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Spiciness Level */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warm-dark mb-2.5">
                  Spiciness Level
                </label>
                <div className="flex gap-3">
                  {[
                    { level: 1, label: '🌶️ Mild' },
                    { level: 2, label: '🌶️🌶️ Medium' },
                    { level: 3, label: '🌶️🌶️🌶️ Hot' }
                  ].map(item => (
                    <button
                      key={item.level}
                      type="button"
                      onClick={() => setSpiciness(item.level)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                        spiciness === item.level
                          ? 'bg-warm-dark text-white border-warm-dark shadow-sm'
                          : 'bg-white text-warm-dark/60 border-warm-dark/15 hover:bg-warm-light/50'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bestseller Toggle */}
              <div className="pt-2">
                <label 
                  onClick={() => setIsBestseller(!isBestseller)}
                  className="p-4 rounded-xl border border-warm-dark/10 bg-warm-light/30 flex items-center justify-between cursor-pointer hover:bg-warm-light/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className={`w-5 h-5 ${isBestseller ? 'text-warm-accent' : 'text-warm-dark/40'}`} />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-warm-dark block">Tag as Homepage Bestseller</span>
                      <span className="text-[11px] text-warm-dark/60 font-serif italic">Feature this product in the home page curated section</span>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${isBestseller ? 'bg-warm-accent' : 'bg-warm-dark/20'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isBestseller ? 'left-[22px]' : 'left-0.5'}`} />
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Copy & Story Card */}
          <div className="bg-white rounded-2xl border border-warm-dark/10 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-serif font-bold text-warm-dark border-b border-warm-dark/10 pb-3">
              Description & Authentic Story
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warm-dark mb-2">
                  Short Description (Card Summary)
                </label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Experience the bold flavours of Andhra with our handcrafted Chicken Pickle..."
                  className="w-full bg-warm-light/30 border border-warm-dark/15 rounded-xl p-3.5 font-serif text-sm focus:ring-2 focus:ring-warm-accent/20 focus:border-warm-accent outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warm-dark mb-2">
                  Long Detailed Story (Product Page Story)
                </label>
                <textarea
                  value={longDescription}
                  onChange={e => setLongDescription(e.target.value)}
                  rows={5}
                  placeholder="Our traditional recipes trace back generations, slow-cooked in small brass batches..."
                  className="w-full bg-warm-light/30 border border-warm-dark/15 rounded-xl p-3.5 font-serif text-sm focus:ring-2 focus:ring-warm-accent/20 focus:border-warm-accent outline-none"
                />
              </div>

              {/* Ingredients List Manager */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-warm-dark mb-2">
                  Pure Ingredients List
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={ingredientInput}
                    onChange={e => setIngredientInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddIngredient();
                      }
                    }}
                    placeholder="Add ingredient e.g. Guntur Red Chilli"
                    className="flex-1 bg-warm-light/30 border border-warm-dark/15 rounded-xl p-3 font-serif text-xs outline-none focus:border-warm-accent"
                  />
                  <button
                    type="button"
                    onClick={handleAddIngredient}
                    className="px-4 py-3 bg-warm-dark hover:bg-warm-accent text-white font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ing, idx) => (
                    <span 
                      key={idx} 
                      className="bg-warm-light border border-warm-dark/10 px-3 py-1.5 rounded-full text-xs font-serif italic text-warm-dark flex items-center gap-2"
                    >
                      {ing}
                      <button 
                        type="button" 
                        onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                        className="text-warm-dark/40 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Media & Variants (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Weight Variants & Packaging Options */}
          <div className="bg-white rounded-2xl border border-warm-dark/10 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-serif font-bold text-warm-dark border-b border-warm-dark/10 pb-3">
              Packaging & Variant Options
            </h2>

            {/* Glass Jar Upgrade Toggle */}
            <div className="p-4 rounded-xl border border-warm-dark/10 bg-warm-light/30 flex items-center justify-between cursor-pointer hover:bg-warm-light/60 transition-colors" onClick={() => setHasJarOption(!hasJarOption)}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-warm-dark block">🫙 Glass Jar Packaging (+₹100)</span>
                <span className="text-[11px] text-warm-dark/60 font-serif italic">Allow buyers to add Glass Jar packaging at checkout</span>
              </div>
              <div className={`w-11 h-6 rounded-full transition-colors relative ${hasJarOption ? 'bg-warm-accent' : 'bg-warm-dark/20'}`}>
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${hasJarOption ? 'left-[22px]' : 'left-0.5'}`} />
              </div>
            </div>

            {/* Available Weight Options */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-warm-dark">Available Weight Variants</label>
              <div className="flex gap-3">
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
                      className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? 'bg-warm-accent/10 border-warm-accent text-warm-accent ring-1 ring-warm-accent/30 font-black'
                          : 'bg-white text-warm-dark/60 border-warm-dark/15 hover:border-warm-dark/40 hover:bg-warm-light/40'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] text-warm-accent" />}
                      <span>{weight === 1000 ? '1000g (1kg)' : `${weight}g`}</span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-warm-dark/50 font-serif italic">
                Selected options will be available for customers on the storefront (250g = 0.5x, 500g = 1x, 1000g = 2x price multiplier).
              </p>
            </div>
          </div>

          {/* Multi-Image Media Manager */}
          <div className="bg-white rounded-2xl border border-warm-dark/10 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex justify-between items-center border-b border-warm-dark/10 pb-3">
              <h2 className="text-lg font-serif font-bold text-warm-dark">
                Product Imagery Gallery ({imageList.length})
              </h2>
              <span className="text-[10px] text-warm-dark/40 font-serif italic">★ First photo is main cover</span>
            </div>

            {/* Main Cover Preview */}
            {imageList.length > 0 && (
              <div className="relative aspect-square rounded-2xl overflow-hidden border border-warm-dark/10 bg-warm-light shadow-sm">
                <img 
                  src={imageList[0]} 
                  alt="Main cover photo" 
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                />
                <span className="absolute top-3 left-3 bg-warm-accent text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
                  ★ Main Cover Photo
                </span>
              </div>
            )}

            {/* Thumbnail Grid */}
            {imageList.length > 0 && (
              <div className="grid grid-cols-4 gap-3">
                {imageList.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-warm-dark/15 bg-white shadow-xs group">
                    <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <button
                      type="button"
                      onClick={() => setImageList(prev => prev.filter((_, idx) => idx !== index))}
                      className="absolute top-1 right-1 p-1 bg-red-600/90 hover:bg-red-600 text-white rounded-full shadow-md transition-all cursor-pointer opacity-90 group-hover:opacity-100"
                      title="Delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Image Upload Box */}
            <div className="pt-2">
              <div className="flex border-b border-warm-dark/10 mb-3 gap-4">
                <button
                  type="button"
                  onClick={() => setImageTab('upload')}
                  className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                    imageTab === 'upload' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                  }`}
                >
                  Upload Photos
                </button>
                <button
                  type="button"
                  onClick={() => setImageTab('url')}
                  className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
                    imageTab === 'url' ? 'border-warm-accent text-warm-dark font-black' : 'border-transparent text-warm-dark/40'
                  }`}
                >
                  Paste Image URL
                </button>
              </div>

              {imageTab === 'upload' ? (
                <div 
                  onClick={() => document.getElementById('full-page-image-upload')?.click()}
                  className="border-2 border-dashed border-warm-dark/15 bg-warm-bg/10 hover:bg-warm-accent/5 hover:border-warm-accent transition-all rounded-2xl py-8 flex flex-col items-center justify-center cursor-pointer min-h-[140px]"
                >
                  <ImageIcon className="w-8 h-8 text-warm-dark/30 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider text-warm-dark/70">Click to Select Photos</span>
                  <span className="text-[10px] text-warm-dark/40 mt-1 font-serif italic">Select one or multiple images simultaneously</span>
                  <input 
                    id="full-page-image-upload"
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
                    className="flex-1 bg-warm-light/30 border border-warm-dark/10 rounded-xl p-3.5 font-serif text-xs outline-none focus:border-warm-accent"
                    placeholder="https://example.com/product-photo.jpg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newUrlInput.trim()) {
                        setImageList(prev => [...prev, newUrlInput.trim()]);
                        setNewUrlInput('');
                      }
                    }}
                    className="px-4 py-3.5 bg-warm-dark hover:bg-warm-accent text-white font-bold text-xs uppercase rounded-xl transition-colors cursor-pointer"
                  >
                    Add URL
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
