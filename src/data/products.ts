export type ProductType = 'murukku' | 'namkeen' | 'snacks';

export interface Product {
  id: number;
  name: string;
  price: number;
  type: ProductType;
  spiciness: number;
  image: string;
  images?: string[];
  description: string;
  longDescription?: string;
  ingredients?: string[];
  weightGrams?: number;
  availableWeights?: number[];
  hasJarOption?: boolean;
  stock: number;
  isBestseller?: boolean;
  weightPrices?: Record<number, number>;
}

export const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Ring Murukku (Chakli) – 100g',
    price: 120,
    type: 'murukku',
    spiciness: 1,
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80',
    description: 'Indulge in the ultimate crunch with our premium Round Murukku (Chakli). Multi-layered concentric rings, slow-fried to golden perfection.',
    longDescription: 'Made using a heritage recipe, our Ring Murukku is shaped into pristine, multi-layered concentric rings that deliver a deeply satisfying snap. We carefully slow-fry each piece to achieve a uniform golden texture without retaining excess oil. Zero preservatives, pure crunch.',
    ingredients: ['Rice Flour', 'Urad Dal', 'Sesame Seeds', 'Butter', 'Cumin', 'Salt', 'Cold-Pressed Oil'],
    weightGrams: 100,
    stock: 60
  },
  {
    id: 2,
    name: 'Ribbon Murukku – 150g',
    price: 150,
    type: 'murukku',
    spiciness: 2,
    image: 'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80',
    description: 'Crispy flat ribbon-shaped murukku with a bold hit of red chili and sesame. An Andhra teatime staple.',
    longDescription: 'Ribbon Murukku (Nada Murukku) is pressed through a flat disc mold to form long, thin ribbons of crunch. Our recipe uses premium rice flour, lentil flour, and freshly ground red chili paste, fried slowly in cold-pressed sesame oil for authentic flavour and lightness.',
    ingredients: ['Rice Flour', 'Chana Dal Flour', 'Red Chili Powder', 'Sesame Seeds', 'Asafoetida', 'Salt', 'Sesame Oil'],
    weightGrams: 150,
    stock: 45
  },
  {
    id: 3,
    name: 'Butter Chilli Murukku – 300g',
    price: 260,
    type: 'murukku',
    spiciness: 1,
    image: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=600&q=80',
    description: 'Crispy rice flour swirls made with rich white butter and subtle green chili heat. Melts in the mouth.',
    longDescription: 'Traditional Andhra style Murukku. We knead high-quality rice flour with real, unsalted white butter and freshly ground green chili paste. The dough is hand-pressed and golden-fried into crispy spirals that melt in the mouth. Absolute perfection with afternoon chai.',
    ingredients: ['Rice Flour', 'White Butter', 'Green Chilies', 'Sesame Seeds', 'Cold-Pressed Oil', 'Salt'],
    weightGrams: 300,
    stock: 30
  },
  {
    id: 4,
    name: 'Kai Murukku – 150g',
    price: 160,
    type: 'murukku',
    spiciness: 1,
    image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
    description: 'Hand-twisted kai murukku shaped by skilled artisans — nutty, buttery and gloriously crunchy.',
    longDescription: 'Kai Murukku is hand-shaped — each piece twisted by experienced artisans to create an irregular, rustic spiral. No two pieces look alike! Made with pure ghee and roasted sesame, the buttery nuttiness of each bite is exceptional. A vanishing traditional craft we are proud to revive.',
    ingredients: ['Rice Flour', 'Urad Dal', 'Pure Ghee', 'Sesame Seeds', 'Salt', 'Cold-Pressed Oil'],
    weightGrams: 150,
    stock: 35
  },
  {
    id: 5,
    name: 'Garlic Masala Murukku – 150g',
    price: 175,
    type: 'murukku',
    spiciness: 3,
    image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80',
    description: 'Bold, garlicky murukku with a fiery masala kick — for those who like their snacks extra punchy.',
    longDescription: 'For the bold snacker! We infuse our standard rice flour murukku dough with freshly pounded garlic and a robust blend of whole spices — coriander, cumin, and Guntur red chili. The result is an intensely savory, mildly spicy murukku that you simply cannot stop eating.',
    ingredients: ['Rice Flour', 'Fresh Garlic Paste', 'Guntur Red Chili', 'Coriander', 'Cumin', 'Sesame Seeds', 'Salt', 'Oil'],
    weightGrams: 150,
    stock: 40
  },
  {
    id: 6,
    name: 'Kara Sev – 150g',
    price: 130,
    type: 'namkeen',
    spiciness: 2,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&q=80',
    description: 'Crispy gram-flour sev with a punchy pepper and chili seasoning. The ultimate chai-time companion.',
    longDescription: 'Kara Sev is made by pressing seasoned chickpea flour through a fine-holed disc into golden strands of sev. Our version adds freshly cracked black pepper and hot red chili for an extra kick. Light, crunchy, and completely addictive.',
    ingredients: ['Chickpea Flour', 'Black Pepper', 'Red Chili Powder', 'Asafoetida', 'Salt', 'Oil'],
    weightGrams: 150,
    stock: 50
  },
  {
    id: 7,
    name: 'Sorrel Sev – 150g',
    price: 130,
    type: 'namkeen',
    spiciness: 1,
    image: 'https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?w=600&q=80',
    description: 'Crispy gram-flour sev infused with the tangy zing of local Gongura (sorrel) leaves. Unique and irresistible.',
    longDescription: 'A modern twist on standard tea-time sev! We blend freshly ground gram flour with pureed tangy Gongura leaves, then press them into golden strands of sev. Airtight packed to maintain maximum crispness. Zero preservatives, a genuinely unique Andhra flavour profile.',
    ingredients: ['Gram Flour', 'Sorrel (Gongura) Leaves', 'Spices', 'Cold-Pressed Oil', 'Sea Salt'],
    weightGrams: 150,
    stock: 25
  },
  {
    id: 8,
    name: 'Andhra Mixture – 200g',
    price: 180,
    type: 'namkeen',
    spiciness: 2,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80',
    description: 'A classic South Indian festival mix — sev, fried peanuts, curry leaf flakes and crunchy bits all in one bag.',
    longDescription: 'Our Andhra Mixture is an explosion of textures and flavours. Crunchy sev, fried peanuts, roasted chana dal, curry leaf chips, and small fried boondi are tossed together with our secret spice blend. A guaranteed crowd-pleaser at any event.',
    ingredients: ['Chickpea Flour Sev', 'Peanuts', 'Chana Dal', 'Curry Leaves', 'Boondi', 'Spices', 'Salt', 'Oil'],
    weightGrams: 200,
    stock: 40
  },
  {
    id: 9,
    name: 'Millet Rings – 150g',
    price: 130,
    type: 'snacks',
    spiciness: 1,
    image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=600&q=80',
    description: 'Healthy, crunchy rings baked with ragi and bajra millets, spiced with onion and garlic. Guilt-free snacking.',
    longDescription: 'Snacking made guilt-free. These light, crunchy rings are baked with nutritional superfoods ragi (finger millet) and bajra (pearl millet). Seasoned with a delicious dust of roasted onion, garlic, and traditional spices. Loved by children and adults alike.',
    ingredients: ['Ragi Flour', 'Bajra Flour', 'Onion Powder', 'Garlic Dust', 'Traditional Spices', 'Salt'],
    weightGrams: 150,
    stock: 40
  },
  {
    id: 10,
    name: 'Rice Sticks (Janthikalu) – 150g',
    price: 130,
    type: 'snacks',
    spiciness: 1,
    image: 'https://images.unsplash.com/photo-1605197161470-5d6e6fd8d0c2?w=600&q=80',
    description: 'Super crunchy traditional rice sticks made with pure butter and sesame. The perfect filter coffee partner.',
    longDescription: 'Rice Sticks (Janthikalu) are a timeless Andhra evening favourite. Made with high-quality rice flour, pure butter, and a generous sprinkle of sesame seeds, these sticks are extruded and fried to a deep golden crisp. The ultimate partner for hot filter coffee.',
    ingredients: ['Rice Flour', 'White Butter', 'Sesame Seeds', 'Cold-Pressed Oil', 'Sea Salt'],
    weightGrams: 150,
    stock: 35
  },
  {
    id: 11,
    name: 'Peanut Masala – 150g',
    price: 110,
    type: 'namkeen',
    spiciness: 2,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
    description: 'Crunchy roasted peanuts coated in a spiced chickpea batter and fried to a golden crisp.',
    longDescription: 'These are not your ordinary peanuts! We coat whole shelled peanuts in a seasoned chickpea flour batter with chili, coriander, and cumin, then deep fry them to a thick, crunchy golden shell. Rich in protein and absolutely addictive.',
    ingredients: ['Peanuts', 'Chickpea Flour', 'Red Chili', 'Coriander', 'Cumin', 'Salt', 'Oil'],
    weightGrams: 150,
    stock: 55
  },
  {
    id: 12,
    name: 'Chekodi (Chakkuli) – 200g',
    price: 190,
    type: 'murukku',
    spiciness: 1,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&q=80',
    description: 'Thick, crunchy spiral murukku made with a rice and lentil blend — a festival favourite across Andhra.',
    longDescription: 'Chekodi (known as Chakkuli in Karnataka) is a thicker, heartier cousin of the standard murukku. Made with a blend of rice flour and roasted chana dal flour, pressed through a star disc to create chunky spirals. Each piece has a satisfying bite and a rich, nutty flavour.',
    ingredients: ['Rice Flour', 'Roasted Chana Dal Flour', 'Butter', 'Sesame Seeds', 'Cumin', 'Salt', 'Oil'],
    weightGrams: 200,
    stock: 30
  }
];
