// Mock implementation of the transaction logic to run a dry-run test suite on all stock check cases

function calculateNewStock(productData: any, itemWeight: number, quantity: number) {
  let updatedFields: any = {};
  
  if (productData.weightStocks && typeof productData.weightStocks === 'object') {
    const variantStock = productData.weightStocks[itemWeight];
    if (variantStock !== undefined && variantStock !== null) {
      if (Number(variantStock) < quantity) {
        throw new Error(`Insufficient stock for ${productData.name} (${itemWeight}g). Only ${variantStock} left.`);
      }
      
      // Prepare updated weightStocks map
      const updatedWeightStocks = { ...productData.weightStocks };
      updatedWeightStocks[itemWeight] = Number(variantStock) - quantity;
      updatedFields.weightStocks = updatedWeightStocks;
      
      // Recalculate overall total stock
      const weights = productData.availableWeights || [250, 500, 1000];
      let totalStock = 0;
      let hasVariantStocks = false;
      for (const w of weights) {
        const s = updatedWeightStocks[w];
        if (s !== undefined && s !== null) {
          totalStock += Number(s);
          hasVariantStocks = true;
        }
      }
      updatedFields.stock = hasVariantStocks ? totalStock : Math.max(0, (productData.stock || 0) - quantity);
    } else {
      // Fallback if specific weight option is not explicitly mapped in weightStocks
      const currentStock = Number(productData.stock) || 0;
      if (currentStock < quantity) {
        throw new Error(`Insufficient stock for ${productData.name}. Only ${currentStock} left.`);
      }
      updatedFields.stock = currentStock - quantity;
    }
  } else {
    // Fallback for single-weight products without weightStocks
    const currentStock = Number(productData.stock) || 0;
    if (currentStock < quantity) {
      throw new Error(`Insufficient stock for ${productData.name}. Only ${currentStock} left.`);
    }
    updatedFields.stock = currentStock - quantity;
  }
  
  return updatedFields;
}

// Running Test Suite
console.log("=== STARTING STOCK TRANSACTION DRY RUN TESTS ===\n");

// Case A: Product has weightStocks and sufficient stock
const productA = {
  name: "Chicken Pickle",
  stock: 60,
  availableWeights: [250, 500, 1000],
  weightStocks: {
    250: 50,
    500: 0,
    1000: 10
  }
};

console.log("Case A: Order 2 units of 1000g from Chicken Pickle (has 10 units left)");
try {
  const resultA = calculateNewStock(productA, 1000, 2);
  console.log("Result A updates:", resultA);
  console.log("Expected weightStocks[1000]: 8, overall stock: 58");
  console.log(`Success: ${resultA.weightStocks[1000] === 8 && resultA.stock === 58 ? "PASS" : "FAIL"}\n`);
} catch (e: any) {
  console.error("Test A Failed with error:", e.message);
}

// Case B: Product has weightStocks but insufficient stock
console.log("Case B: Order 5 units of 500g from Chicken Pickle (has 0 units left)");
try {
  calculateNewStock(productA, 500, 5);
  console.log("FAIL: Expected an Insufficient stock error, but it succeeded.");
} catch (e: any) {
  console.log("Result B error:", e.message);
  console.log("Success: PASS (Correctly threw stock error)\n");
}

// Case C: Single weight fallback (no weightStocks map)
const productC = {
  name: "Moringa Leaf Spicy Podi",
  stock: 15,
  weightGrams: 100
};

console.log("Case C: Order 3 units of 100g from Moringa Podi (no variant stock, 15 overall)");
try {
  const resultC = calculateNewStock(productC, 100, 3);
  console.log("Result C updates:", resultC);
  console.log("Expected overall stock: 12");
  console.log(`Success: ${resultC.stock === 12 ? "PASS" : "FAIL"}\n`);
} catch (e: any) {
  console.error("Test C Failed with error:", e.message);
}
