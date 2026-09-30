export interface SimpleProduct {
  price?: number;
  originalPrice?: number;
  weightGrams?: number;
  availableWeights?: number[];
  weightPrices?: Record<string | number, number>;
  variantOriginalPrices?: Record<string | number, number>;
  weightStocks?: Record<string | number, number>;
  stock?: number;
  enableDiscount?: boolean;
  discountPercentage?: number;
  [key: string]: any;
}

/**
 * Determines the available weights for a product based on its database attributes.
 */
export function getAvailableWeights(product: SimpleProduct): number[] {
  if (product.availableWeights && Array.isArray(product.availableWeights) && product.availableWeights.length > 0) {
    return product.availableWeights;
  }
  
  if (product.weightPrices && typeof product.weightPrices === 'object') {
    const keys = Object.keys(product.weightPrices)
      .map(Number)
      .filter(w => !isNaN(w) && w > 0);
    if (keys.length > 0) {
      return keys.sort((a, b) => a - b);
    }
  }
  
  if (product.weightGrams && !isNaN(Number(product.weightGrams))) {
    return [Number(product.weightGrams)];
  }
  
  return [100, 250, 500, 1000];
}

/**
 * Calculates the unit selling price for a specific weight and packaging option.
 */
export function getProductUnitPrice(product: SimpleProduct, weight: number, isJar: boolean = false): number {
  const customWeightPrice = product.weightPrices?.[weight];
  let baseUnitPrice = 0;
  
  if (customWeightPrice !== undefined && customWeightPrice !== null && !isNaN(Number(customWeightPrice)) && Number(customWeightPrice) > 0) {
    baseUnitPrice = Number(customWeightPrice);
  } else {
    baseUnitPrice = Number(product.price) || 0;
  }
  
  return baseUnitPrice + (isJar ? 100 : 0);
}

/**
 * Calculates the original MRP / strikethrough price for a specific weight and packaging option.
 * Returns null if discount pricing is disabled or if no original MRP is higher than selling price.
 */
export function getProductOriginalPrice(
  product: SimpleProduct,
  weight: number,
  isJar: boolean = false,
  globalDiscountEnabled: boolean = true,
  globalDiscountPercent: number = 15
): number | null {
  if (!globalDiscountEnabled || product.enableDiscount === false) {
    return null;
  }

  const sellingPrice = getProductUnitPrice(product, weight, isJar);
  if (sellingPrice <= 0) return null;

  // 1. Check custom variant original MRP
  const customVariantOriginal = product.variantOriginalPrices?.[weight] ?? (product as any).weightOriginalPrices?.[weight];
  if (customVariantOriginal !== undefined && customVariantOriginal !== null && !isNaN(Number(customVariantOriginal))) {
    const orig = Number(customVariantOriginal) + (isJar ? 100 : 0);
    if (orig > sellingPrice) return orig;
  }

  // 2. Check product-level original price
  if (product.originalPrice !== undefined && product.originalPrice !== null && !isNaN(Number(product.originalPrice))) {
    const baseWeight = Number(product.weightGrams) || 250;
    let baseOriginal = Number(product.originalPrice);
    if (baseWeight > 0 && weight > 0 && baseWeight !== weight) {
      const ratio = weight / baseWeight;
      baseOriginal = Math.round(baseOriginal * ratio);
    }
    const orig = baseOriginal + (isJar ? 100 : 0);
    if (orig > sellingPrice) return orig;
  }

  // 3. Fallback: Default discount percentage (product level or global store setting, default 15%)
  const discountPct = (product.discountPercentage !== undefined && product.discountPercentage !== null)
    ? Number(product.discountPercentage)
    : (globalDiscountPercent || 15);

  if (discountPct > 0 && discountPct < 100) {
    const computedOriginal = Math.round(sellingPrice / (1 - discountPct / 100));
    if (computedOriginal > sellingPrice) return computedOriginal;
  }

  return null;
}

/**
 * Calculates the lowest starting price ("From price") among all available weights.
 */
export function getProductStartingPrice(product: SimpleProduct): number {
  const weights = getAvailableWeights(product);
  const prices = weights.map(w => getProductUnitPrice(product, w, false));
  return prices.length > 0 ? Math.min(...prices) : (Number(product.price) || 0);
}

/**
 * Calculates the starting original price (strikethrough MRP) for the lowest weight variant.
 */
export function getProductStartingOriginalPrice(
  product: SimpleProduct,
  globalDiscountEnabled: boolean = true,
  globalDiscountPercent: number = 15
): number | null {
  const weights = getAvailableWeights(product);
  if (weights.length === 0) return null;
  const startingWeight = Math.min(...weights);
  return getProductOriginalPrice(product, startingWeight, false, globalDiscountEnabled, globalDiscountPercent);
}

/**
 * Calculates savings percentage between selling price and original price.
 */
export function getDiscountPercentage(sellingPrice: number, originalPrice: number | null): number {
  if (!originalPrice || originalPrice <= sellingPrice || sellingPrice <= 0) return 0;
  return Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);
}

/**
 * Calculates total stock of all active weight variants.
 */
export function getProductStock(product: SimpleProduct): number {
  if (product.weightStocks && typeof product.weightStocks === 'object') {
    const weights = getAvailableWeights(product);
    let totalStock = 0;
    let hasVariantStocks = false;
    for (const w of weights) {
      const s = product.weightStocks[w];
      if (s !== undefined && s !== null && !isNaN(Number(s))) {
        totalStock += Number(s);
        hasVariantStocks = true;
      }
    }
    if (hasVariantStocks) return totalStock;
  }
  return Number(product.stock) || 0;
}

/**
 * Checks if a specific weight variant is in stock.
 */
export function isWeightInStock(product: SimpleProduct, weight: number): boolean {
  if (product.weightStocks && typeof product.weightStocks === 'object') {
    const s = product.weightStocks[weight];
    if (s !== undefined && s !== null && !isNaN(Number(s))) {
      return Number(s) > 0;
    }
  }
  return (Number(product.stock) || 0) > 0;
}
