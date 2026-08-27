export interface SimpleProduct {
  price?: number;
  weightGrams?: number;
  availableWeights?: number[];
  weightPrices?: Record<string | number, number>;
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
  
  return [250, 500, 1000];
}

/**
 * Calculates the unit price for a specific weight and packaging option.
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
 * Calculates the lowest starting price ("From price") among all available weights.
 */
export function getProductStartingPrice(product: SimpleProduct): number {
  const weights = getAvailableWeights(product);
  const prices = weights.map(w => getProductUnitPrice(product, w, false));
  return prices.length > 0 ? Math.min(...prices) : (Number(product.price) || 0);
}
