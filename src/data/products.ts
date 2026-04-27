export type ProductType = 'pickle' | 'podi' | 'bundle';

export interface Product {
  id: number;
  name: string;
  price: number;
  type: ProductType;
  spiciness: number;
  image: string;
  description: string;
  longDescription?: string;
  ingredients?: string[];
}

export const PRODUCTS: Product[] = [
  { 
    id: 1, 
    name: 'Traditional Avakaya', 
    price: 299, 
    type: 'pickle', 
    spiciness: 3, 
    image: 'https://images.unsplash.com/photo-1626388416805-40b991ea4518?w=800&q=80', 
    description: 'Authentic Andhra mango pickle made with freshly ground spices and cold-pressed sesame oil.',
    longDescription: 'Our Traditional Avakaya is crafted using a generations-old recipe from the heartlands of Andhra. We select the finest raw mangoes, sun-dry our spices, and blend them with premium cold-pressed oil to ensure every bite delivers the perfect balance of heat, tang, and tradition. Pairs beautifully with piping hot rice and a dollop of ghee.',
    ingredients: ['Raw Mango', 'Mustard Powder', 'Red Chili Powder', 'Cold-pressed Sesame Oil', 'Garlic', 'Sea Salt', 'Fenugreek Powder']
  },
  { 
    id: 2, 
    name: 'Gongura Pickle', 
    price: 249, 
    type: 'pickle', 
    spiciness: 2, 
    image: 'https://images.unsplash.com/photo-1589115792437-51a84f3e5c94?w=800&q=80', 
    description: 'Tangy and spicy sorrel leaf pickle, a classic accompaniment to hot rice and ghee.',
    longDescription: 'Known as the pride of Telugu cuisine, our Gongura pickle uses fresh sorrel leaves sourced directly from local farms. The tangy leaves are cooked down with a masterful blend of robust spices to create a rich, pasty pickle. It\'s an essential flavor that awakens the palate and adds depth to simplest of meals.',
    ingredients: ['Gongura Leaves (Sorrel)', 'Red Chilies', 'Garlic', 'Tamarind', 'Coriander Seeds', 'Peanut Oil']
  },
  { 
    id: 3, 
    name: 'Tomato Pickle', 
    price: 199, 
    type: 'pickle', 
    spiciness: 2, 
    image: 'https://images.unsplash.com/photo-1541344933930-b3addbf52331?w=800&q=80', 
    description: 'Sun-dried tomatoes blended with aromatic spices for a sweet-spicy kick.',
    longDescription: 'A versatile favorite! We slow-roast ripe, juicy tomatoes until their sugars caramelize, then blend them with mustard and fenugreek. The result is a vibrant, slightly sweet, and adequately spicy pickle that tastes fantastic with dosas, idlis, parathas, and rice.',
    ingredients: ['Ripe Tomatoes', 'Tamarind Extract', 'Mustard Seeds', 'Garlic', 'Red Chili Powder', 'Refined Sunflower Oil']
  },
  { 
    id: 4, 
    name: 'Nimmakaya (Lemon)', 
    price: 199, 
    type: 'pickle', 
    spiciness: 1, 
    image: 'https://images.unsplash.com/photo-1583344607830-ec85cb2ba2bb?w=800&q=80', 
    description: 'Aged lemon pickle with a balanced tangy flavor, perfect for your daily meals.',
    longDescription: 'An age-old digestive aid turned culinary delight! Our Nimmakaya is aged for months to let the sharp citrus mellow into a deep, complex zest. Free from artificial souring agents, it relies purely on the natural tartness of farm-fresh lemons preserved in turmeric and salt before being lightly spiced.',
    ingredients: ['Lemons', 'Sea Salt', 'Turmeric', 'Red Chili Powder', 'Fenugreek Powder']
  },
  { 
    id: 5, 
    name: 'Kandi Podi', 
    price: 149, 
    type: 'podi', 
    spiciness: 1, 
    image: 'https://images.unsplash.com/photo-1596649557760-44e27f673f8d?w=800&q=80', 
    description: 'A comforting blend of roasted lentils and spices. Best enjoyed with hot rice and ghee.',
    longDescription: 'The ultimate comfort food enhancer. Kandi Podi (Toor Dal Powder) is dry-roasted over a low flame to bring out a nutty, earthy aroma. Mixed with a tiny bit of red chili and cumin, it offers a protein-rich, mild flavor profile that is wholesome and deeply satisfying.',
    ingredients: ['Toor Dal', 'Bengal Gram', 'Cumin Seeds', 'Dry Red Chilies', 'Garlic', 'Salt']
  },
  { 
    id: 6, 
    name: 'Karivepaku Podi', 
    price: 149, 
    type: 'podi', 
    spiciness: 2, 
    image: 'https://images.unsplash.com/photo-1618413813898-7505342a3a5f?w=800&q=80', 
    description: 'Nutritious curry leaf powder that packs a punch of flavor and health benefits.',
    longDescription: 'Health meets flavor. Packed with iron-rich curry leaves, this coarse powder is an absolute wonder. We gently shade-dry fresh curry leaves to retain their essential oils, then grind them with roasted lentils and spices. Try it sprinkled on Idli or mixed with hot rice!',
    ingredients: ['Fresh Curry Leaves', 'Urad Dal', 'Chana Dal', 'Coriander Seeds', 'Tamarind', 'Garlic', 'Red Chilies']
  },
  {
    id: 7,
    name: 'Heritage Tasting Box',
    price: 899,
    type: 'bundle',
    spiciness: 2,
    image: 'https://i.etsystatic.com/21035089/r/il/9ce70d/5680541580/il_1588xN.5680541580_b6zq.jpg',
    description: 'The perfect gift featuring a rustic assortment of our best-selling pickles and podis in a beautiful traditional package.',
    longDescription: 'Experience the complete spectrum of Kaaram Kathalu flavors. This curated gift box contains miniature jars of our most beloved recipes perfectly bundled for festive gifting or a personal tasting journey. Elegantly packaged with rustic charm as seen in this stunning ensemble.',
    ingredients: ['Assortment of Mango, Tomato, and Lemon Pickles', 'Kandi Podi included', 'Hand-crafted packaging']
  }
];
