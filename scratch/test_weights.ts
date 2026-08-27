import { getAvailableWeights, getProductUnitPrice } from '../src/utils/price';

const chickenPickle = {
  "images": [
    "https://iuyaxtohkvsgvuybjduv.supabase.co/storage/v1/object/public/media/products/1786090469857_zdaflzuzmqa.jpeg"
  ],
  "id": 1786090470458,
  "description": "Chicken Pickle...",
  "hasJarOption": true,
  "image": "...",
  "stock": 50,
  "name": "CHICKEN PICKLE",
  "spiciness": 3,
  "ingredients": [],
  "weightGrams": 250,
  "weightPrices": {
    "250": 100,
    "500": 150,
    "1000": 200
  },
  "availableWeights": [
    250,
    500,
    1000
  ],
  "type": "pickle",
  "isBestseller": false,
  "price": 475
};

console.log("availableWeights from function:", getAvailableWeights(chickenPickle));
console.log("250g price:", getProductUnitPrice(chickenPickle, 250));
console.log("500g price:", getProductUnitPrice(chickenPickle, 500));
console.log("1000g price:", getProductUnitPrice(chickenPickle, 1000));
