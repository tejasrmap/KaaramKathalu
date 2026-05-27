export type ProductType = 'pickle' | 'podi' | 'fryums' | 'snacks';

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
  stock: number;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Avakaya Mango Pickle Hot & Spicy (Karapavakaya)',
    price: 189,
    type: 'pickle',
    spiciness: 3,
    image: 'https://themanduvaproject.in/cdn/shop/files/Manduvawebsitepicture_1.png?v=1749711321&width=533',
    description: 'Traditional hot & spicy raw mango pickle made with heirloom family recipes in coastal Andhra.',
    longDescription: 'Our signature Karapavakaya is the quintessential Andhra mango pickle. Sun-dried spices are carefully hand-blended with cold-pressed sesame oil and sour, firm green mangoes. Whole garlic cloves add a delicious crunch. Free of preservatives, it brings the nostalgia of grandmother\'s open courtyard kitchens.',
    ingredients: ['Raw Mangoes', 'Red Chili Powder', 'Mustard Seeds', 'Cold-Pressed Sesame Oil', 'Garlic', 'Sea Salt', 'Fenugreek'],
    stock: 50
  },
  {
    id: 2,
    name: 'Tender Avakaya Mango Pickle Sweet & Spicy (Jeedi Avakaya)',
    price: 189,
    type: 'pickle',
    spiciness: 2,
    image: 'https://themanduvaproject.in/cdn/shop/files/TenderAvakaya2.jpg?v=1749711620&width=533',
    description: 'Exquisite tender mango pickle with a sweet and spicy kick, featuring whole baby mango slices.',
    longDescription: 'Jeedi Avakaya is crafted using tender, small green mangoes cut along with their inner shell. The soft, succulent pieces are pickled in sweet jaggery and spicy powders, creating a delightful harmony of flavors that elevates plain white rice and ghee to a celebration.',
    ingredients: ['Tender baby mangoes', 'Jaggery', 'Red Chili Powder', 'Cold-Pressed Oil', 'Mustard', 'Sea Salt'],
    stock: 35
  },
  {
    id: 3,
    name: 'Tiffin Sprinkle',
    price: 138,
    type: 'podi',
    spiciness: 2,
    image: 'https://themanduvaproject.in/cdn/shop/products/Edit_287A9043.jpg?v=1749196584&width=533',
    description: 'Perfect spice mix roasted and hand-pounded for Idli, Dosa, and breakfast spreads.',
    longDescription: 'Hand-pounded using old-school iron mortars, our Tiffin Sprinkle is the ultimate companion for breakfast. Made with premium roasted dal and traditional chilies, it adds a nutty, savory warmth to warm idlis and crispy dosas when mixed with pure ghee or sesame oil.',
    ingredients: ['Chana Dal', 'Urad Dal', 'Dry Red Chilies', 'Cumin Seeds', 'Asafoetida', 'Sea Salt'],
    stock: 40
  },
  {
    id: 4,
    name: 'Sorrel Sev - 150gm',
    price: 130,
    type: 'snacks',
    spiciness: 1,
    image: 'https://themanduvaproject.in/cdn/shop/files/sorrelsnacks.jpg?v=1778184480&width=533',
    description: 'Crispy gram-flour sev infused with the tangy zing of local Gongura (sorrel) leaves.',
    longDescription: 'A modern twist on standard tea-time snacks! We blend freshly ground gram flour with pureed tangy Gongura leaves, then press them into golden strands of sev. Air-tight packed to maintain maximum crispness and zero preservatives.',
    ingredients: ['Gram Flour', 'Sorrel (Gongura) Leaves', 'Spices', 'Cold-Pressed Oil', 'Sea Salt'],
    stock: 25
  },
  {
    id: 5,
    name: 'Bittergourd Pickle',
    price: 145,
    type: 'pickle',
    spiciness: 2,
    image: 'https://themanduvaproject.in/cdn/shop/files/IMG_0168.jpg?v=1749711209&width=533',
    description: 'Unique bittergourd slices cooked with tangy tamarind and spicy red chilies.',
    longDescription: 'If you think bittergourd cannot be delicious, think again! We thinly slice fresh bittergourd, salt them to draw out excessive bitterness, and slow-cook them with rich tamarind pulp and robust chili flakes. A deeply savory pickle that is a fantastic digestive aid.',
    ingredients: ['Bittergourd Slices', 'Tamarind Pulp', 'Garlic', 'Mustard Seeds', 'Red Chili Powder', 'Cold-Pressed Sesame Oil', 'Sea Salt'],
    stock: 15
  },
  {
    id: 6,
    name: 'Butter Chilli Murukku 300gms',
    price: 260,
    type: 'snacks',
    spiciness: 1,
    image: 'https://themanduvaproject.in/cdn/shop/files/butterchillimurukku.jpg?v=1778184712&width=533',
    description: 'Crispy rice flour swirls made with rich white butter and subtle green chili heat.',
    longDescription: 'Traditional Andhra style Murukku. We knead high-quality rice flour with real, unsalted white butter and freshly ground green chili paste. The dough is hand-pressed and golden-fried into crispy spirals that melt in the mouth. Absolute perfection with afternoon chai.',
    ingredients: ['Rice Flour', 'White Butter', 'Green Chilies', 'Sesame Seeds', 'Cold-Pressed Oil', 'Salt'],
    stock: 30
  },
  {
    id: 7,
    name: 'Tomato Pickle',
    price: 180,
    type: 'pickle',
    spiciness: 2,
    image: 'https://themanduvaproject.in/cdn/shop/files/IMG_0598.jpg?v=1730281477&width=533',
    description: 'Tangy tomato pickle slow-cooked with fresh garlic, mustard, and fenugreek.',
    longDescription: 'Juicy, sun-ripened tomatoes are slow-simmered until rich and concentrated, then seasoned with mustard seeds, whole garlic cloves, and aromatic fenugreek. This versatile pickle is sweet, tangy, and adequately spicy, tasting fantastic with parathas and dosas.',
    ingredients: ['Ripe Tomatoes', 'Tamarind', 'Garlic', 'Mustard Seeds', 'Fenugreek Powder', 'Red Chili Powder', 'Sesame Oil', 'Sea Salt'],
    stock: 45
  },
  {
    id: 8,
    name: 'Sambar Podi',
    price: 138,
    type: 'podi',
    spiciness: 2,
    image: 'https://themanduvaproject.in/cdn/shop/files/Untitleddesign_63.png?v=1749724561&width=533',
    description: 'Heirloom spice blend dry-roasted to aromatic perfection for authentic South Indian Sambar.',
    longDescription: 'No South Indian kitchen is complete without Sambar Podi. Our blend features organic coriander seeds, roasted lentils, and dark Guntur red chilies. Lightly dry-roasted on slow clay firewood to preserve natural oils and hand-ground for that unmistakable rural taste.',
    ingredients: ['Coriander Seeds', 'Bengal Gram', 'Black Gram', 'Red Chilies', 'Fenugreek', 'Turmeric', 'Cumin'],
    stock: 50
  },
  {
    id: 9,
    name: 'Gongura (Sorrel) Sweet Pickle',
    price: 180,
    type: 'pickle',
    spiciness: 1,
    image: 'https://themanduvaproject.in/cdn/shop/files/Untitleddesign_57.png?v=1749711362&width=533',
    description: 'Fresh sorrel leaves pickled with sweet palm jaggery, red chilies, and garlic.',
    longDescription: 'Fresh sorrel (Gongura) leaves are pureed and slow-cooked with traditional organic palm jaggery. The tang of the sorrel blends marvelously with the rich sweetness of the jaggery, backed by garlic and red chili. A true local specialty that balances sweet, sour, and spicy.',
    ingredients: ['Sorrel Leaves', 'Palm Jaggery', 'Garlic', 'Chili Flakes', 'Mustard Seeds', 'Cold-Pressed Sesame Oil'],
    stock: 20
  },
  {
    id: 10,
    name: 'Millet Rings - 150gm',
    price: 130,
    type: 'snacks',
    spiciness: 1,
    image: 'https://themanduvaproject.in/cdn/shop/files/milletringsSnacks.jpg?v=1778184161&width=533',
    description: 'Healthy, crunchy rings baked with ragi and bajra millets, spiced with onion and garlic.',
    longDescription: 'Snacking made guilt-free. These light, crunchy rings are baked with nutritional superfoods ragi (finger millet) and bajra (pearl millet). Seasoned with a delicious dust of roasted onion, garlic, and traditional spices. Loved by children and adults alike.',
    ingredients: ['Ragi Flour', 'Bajra Flour', 'Onion Powder', 'Garlic Dust', 'Traditional Spices', 'Salt'],
    stock: 40
  },
  {
    id: 11,
    name: 'Garlic Chilli Sprinkle',
    price: 195,
    type: 'podi',
    spiciness: 3,
    image: 'https://themanduvaproject.in/cdn/shop/files/Manduvawebsitepicture_8.png?v=1749724842&width=533',
    description: 'Fiery roasted garlic and red chili blend, perfect as a garnish or seasoning.',
    longDescription: 'For the ultimate spice lover! Our Garlic Chilli Sprinkle (also known as Vellulli Karam) is made by slow-roasting garlic cloves and hand-pounding them with hot red chilies. Perfect for seasoning dry curries, sprinkling on butter dosas, or tossing with hot popcorn!',
    ingredients: ['Roasted Garlic Cloves', 'Guntur Red Chilies', 'Cumin Seeds', 'Sea Salt'],
    stock: 25
  },
  {
    id: 12,
    name: 'Rice Sticks - 150gms',
    price: 130,
    type: 'snacks',
    spiciness: 1,
    image: 'https://themanduvaproject.in/cdn/shop/files/ricesticks.jpg?v=1778183645&width=533',
    description: 'Super crunchy traditional snacks made of rice flour and crushed sesame seeds.',
    longDescription: 'Rice Sticks (Janthikalu) are a timeless Andhra evening favorite. Made with high-quality rice flour, pure butter, and a generous sprinkle of sesame seeds, these sticks are extruded and fried to a deep golden crisp. The ultimate partner for hot filter coffee.',
    ingredients: ['Rice Flour', 'White Butter', 'Sesame Seeds', 'Cold-Pressed Oil', 'Sea Salt'],
    stock: 35
  },
  {
    id: 13,
    name: 'Manduva Masala Podi',
    price: 120,
    type: 'podi',
    spiciness: 2,
    image: 'https://themanduvaproject.in/cdn/shop/files/Untitleddesign_67.png?v=1728892621&width=533',
    description: 'Robust marinade spice powder for kebabs, curries, and rich biryanis.',
    longDescription: 'Our proprietary dry spice marinade blend. We roast green cardamom, cloves, cinnamon, stone flower, and mace, then crush them to a coarse masala powder. Use it as a dry rub or marinade base to unlock restaurant-grade, rich Andhra royal flavors in your home kitchen.',
    ingredients: ['Coriander Seeds', 'Green Cardamom', 'Cloves', 'Cinnamon Bark', 'Stone Flower', 'Mace', 'Fennel'],
    stock: 45
  }
];
