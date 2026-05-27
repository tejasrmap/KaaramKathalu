export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  instructions: string[];
  pairing: string;
}

export const RECIPES: Recipe[] = [
  {
    id: 'tiffin-paniyaram',
    title: 'Golden Bites of Tradition: Paniyaram with Tiffin Sprinkle',
    description: 'A traditional, crispy breakfast snack made from fermented batter, enhanced with the savory magic of roasted Tiffin Sprinkle podi.',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1000&auto=format&fit=crop',
    prepTime: '20 mins',
    difficulty: 'Easy',
    ingredients: [
      '2 cups Fermented Idli/Dosa batter',
      '2 tbsp Manduva Tiffin Sprinkle Podi',
      '1 small Onion, finely chopped',
      '1 green Chili, chopped',
      'A pinch of mustard seeds and curry leaves for tempering',
      'Ghee or cold-pressed oil'
    ],
    instructions: [
      'Heat a small pan, add a teaspoon of oil, and temper mustard seeds and curry leaves.',
      'Sauté onions and green chilies until soft, then stir this mixture into the fermented batter.',
      'Heat the paniyaram pan (appe pan) and drizzle a few drops of ghee in each cavity.',
      'Pour the batter into each cavity, filling it up to 3/4th.',
      'Cook covered on medium heat until the bottom turns golden brown. Flip and cook the other side.',
      'Remove and immediately dust with Manduva Tiffin Sprinkle. Serve hot with coconut chutney.'
    ],
    pairing: 'Tiffin Sprinkle'
  },
  {
    id: 'bittergourd-twist',
    title: 'Bittergourd Pickle Twists',
    description: 'Transform standard yogurt rice or mild dishes with the tangy, spicy, and deep savory bite of slow-cooked bittergourd slices.',
    image: 'https://images.unsplash.com/photo-1541344933930-b3addbf52331?q=80&w=1000&auto=format&fit=crop',
    prepTime: '10 mins',
    difficulty: 'Easy',
    ingredients: [
      '1 cup chilled thick yogurt',
      '1 cup cooked warm rice',
      '1.5 tbsp Manduva Bittergourd Pickle',
      'A sprinkle of roasted cumin powder'
    ],
    instructions: [
      'Mix warm rice with a pinch of salt and mash slightly.',
      'Add chilled thick yogurt and blend thoroughly to make a creamy curd rice.',
      'Place the curd rice in a bowl and scoop a generous portion of Bittergourd Pickle on top.',
      'Drizzle the spiced pickle oil over the yogurt and dust with cumin powder.',
      'Take a scoop of curd rice along with a slice of pickle and experience the marvelous contrast.'
    ],
    pairing: 'Bittergourd Pickle'
  },
  {
    id: 'traditional-avakaya-annam',
    title: 'Traditional Avakaya Annam',
    description: 'The royal comfort food of Andhra. Steaming hot Sona Masuri rice hand-mixed with fiery mango pickle and local cold-pressed sesame oil or ghee.',
    image: 'https://themanduvaproject.in/cdn/shop/files/Manduvawebsitepicture_1.png?v=1749711321&width=533',
    prepTime: '5 mins',
    difficulty: 'Easy',
    ingredients: [
      '1.5 cups Steaming hot white rice',
      '2 tbsp Manduva Avakaya Mango Pickle',
      '1 tbsp Ghee or Pure Cold-Pressed Sesame Oil'
    ],
    instructions: [
      'Spread hot rice in a wide ceramic plate to cool slightly but stay warm.',
      'Add the mango pickle in the center, getting a mix of both the spiced skin, tender baby mango meat, and red chili oil.',
      'Drizzle pure ghee or raw sesame oil over the pickle.',
      'Using your fingers, mix the pickle and oil into the warm rice until every grain turns a vibrant golden-red.',
      'Form into small rounds (mudda) and enjoy while warm with a side of crispy papad.'
    ],
    pairing: 'Avakaya Mango Pickle Hot & Spicy (Karapavakaya)'
  }
];
