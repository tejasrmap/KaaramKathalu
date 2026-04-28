export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  ingredients: string[];
  instructions: string[];
  pairing: string; // The pickle/podi it pairs with
}

export const RECIPES: Recipe[] = [
  {
    id: 'avakaya-annam',
    title: 'Avakaya Annam',
    description: 'The ultimate comfort food of Andhra Pradesh. Steaming hot rice mixed with spicy mango pickle and a dollop of pure ghee.',
    image: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1000&auto=format&fit=crop',
    prepTime: '5 mins',
    difficulty: 'Easy',
    ingredients: [
      '1 cup Steaming hot Sona Masuri rice',
      '2 tbsp Kaaram Kathalu Avakaya (Mango Pickle)',
      '1 tbsp Pure Desi Ghee',
      'A pinch of salt (optional)'
    ],
    instructions: [
      'Place the hot rice in a wide plate.',
      'Add a generous spoonful of Avakaya, ensuring you get both the mango pieces and the masala oil.',
      'Pour hot melted ghee over the pickle.',
      'Mix thoroughly with your fingers until every grain of rice is coated in the spicy, tangy masala.',
      'Enjoy while hot with a side of papad or mudda pappu.'
    ],
    pairing: 'Avakaya (Mango Pickle)'
  },
  {
    id: 'allam-dosa',
    title: 'Ginger Pickle Dosa',
    description: 'Elevate your morning dosa with the zesty kick of ginger pickle. A perfect balance of fermented tang and spicy warmth.',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=1000&auto=format&fit=crop',
    prepTime: '15 mins',
    difficulty: 'Easy',
    ingredients: [
      'Dosa batter (fermented)',
      'Kaaram Kathalu Allam Pachadi (Ginger Pickle)',
      'Finely chopped onions',
      'Oil or Ghee for roasting'
    ],
    instructions: [
      'Heat a flat griddle (tava) and pour a ladle of dosa batter, spreading it thinly in circles.',
      'Drizzle oil around the edges.',
      'Spread a thin layer of Allam Pachadi directly onto the top of the cooking dosa.',
      'Sprinkle chopped onions.',
      'Fold and serve hot once the bottom is golden brown and crispy.'
    ],
    pairing: 'Allam Pachadi (Ginger Pickle)'
  },
  {
    id: 'podi-pasta',
    title: 'Spiced Podi Fusion Pasta',
    description: 'A modern twist where Italian comfort meets Indian spice. Pasta tossed in olive oil and our signature Karappodi.',
    image: 'https://images.unsplash.com/photo-1473093226795-af9932fe5856?q=80&w=1000&auto=format&fit=crop',
    prepTime: '20 mins',
    difficulty: 'Medium',
    ingredients: [
      '200g Spaghetti or Penne',
      '3 tbsp Extra Virgin Olive Oil',
      '2 tbsp Kaaram Kathalu Nalla Karam or Idli Podi',
      '4 cloves of Garlic, minced',
      'Fresh curry leaves for garnish'
    ],
    instructions: [
      'Boil pasta in salted water until al dente. Reserve half a cup of pasta water.',
      'Heat olive oil in a pan, add minced garlic and curry leaves until fragrant.',
      'Add the cooked pasta and the reserved water.',
      'Turn off the heat and sprinkle the Podi generously.',
      'Toss well until the pasta is coated in a "sandy" spicy texture. Serve immediately.'
    ],
    pairing: 'Nalla Karam / Idli Podi'
  }
];
