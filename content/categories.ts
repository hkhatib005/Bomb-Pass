import type { Category } from '../types/game';

export function getCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((category) => category.id === id);
}

/**
 * Placeholder category content. All items are plain, generic nouns/concepts
 * (no trademarks, no real people) so they're safe to ship as-is or replace
 * later with final copy. Each category has 16 items so it can back both
 * Bomb Pass (any count) and Chameleon (needs a 4x4 grid of exactly 16).
 */
export const CATEGORIES: Category[] = [
  // --- party-classics (free) ---
  {
    id: 'animals',
    name: 'Animals',
    pack: 'party-classics',
    difficulty: 'easy',
    items: ['Lion', 'Elephant', 'Giraffe', 'Penguin', 'Kangaroo', 'Dolphin', 'Owl', 'Zebra', 'Panda', 'Cheetah', 'Tiger', 'Wolf', 'Fox', 'Bear', 'Rabbit', 'Horse'],
  },
  {
    id: 'fruits',
    name: 'Fruits',
    pack: 'party-classics',
    difficulty: 'medium',
    items: ['Apple', 'Banana', 'Mango', 'Pineapple', 'Watermelon', 'Strawberry', 'Kiwi', 'Peach', 'Cherry', 'Papaya', 'Orange', 'Grape', 'Blueberry', 'Coconut', 'Lemon', 'Plum'],
  },
  {
    id: 'colors',
    name: 'Colors',
    pack: 'party-classics',
    difficulty: 'hard',
    items: ['Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Orange', 'Pink', 'Turquoise', 'Maroon', 'Beige', 'Black', 'White', 'Gray', 'Gold', 'Silver', 'Teal'],
  },
  {
    id: 'kitchen-items',
    name: 'Kitchen Items',
    pack: 'party-classics',
    difficulty: 'easy',
    items: ['Spatula', 'Whisk', 'Blender', 'Toaster', 'Cutting Board', 'Colander', 'Ladle', 'Grater', 'Rolling Pin', 'Skillet', 'Oven Mitt', 'Tongs', 'Measuring Cup', 'Strainer', 'Peeler', 'Timer'],
  },
  {
    id: 'emotions',
    name: 'Emotions',
    pack: 'party-classics',
    difficulty: 'medium',
    items: ['Happy', 'Sad', 'Angry', 'Nervous', 'Excited', 'Confused', 'Proud', 'Jealous', 'Relieved', 'Surprised', 'Bored', 'Curious', 'Anxious', 'Calm', 'Grateful', 'Embarrassed'],
  },
  {
    id: 'school-subjects',
    name: 'School Subjects',
    pack: 'party-classics',
    difficulty: 'hard',
    items: ['Math', 'Science', 'History', 'Art', 'Music', 'Geography', 'Biology', 'Chemistry', 'Physics', 'Literature', 'Economics', 'Psychology', 'Computer Science', 'Drama', 'Philosophy', 'Statistics'],
  },
  {
    id: 'birthday-party-things',
    name: 'Birthday Party Things',
    pack: 'party-classics',
    difficulty: 'easy',
    items: ['Balloons', 'Cake', 'Candles', 'Streamers', 'Party Hat', 'Piñata', 'Gift Bag', 'Confetti', 'Banner', 'Party Games', 'Wrapping Paper', 'Card', 'Cupcakes', 'Guest List', 'Photo Booth', 'Party Favors'],
  },
  {
    id: 'ice-cream-flavors',
    name: 'Ice Cream Flavors',
    pack: 'party-classics',
    difficulty: 'medium',
    items: ['Vanilla', 'Chocolate', 'Strawberry', 'Mint Chip', 'Cookie Dough', 'Pistachio', 'Rocky Road', 'Butter Pecan', 'Coffee', 'Mango', 'Strawberry Cheesecake', 'Bubblegum', 'Neapolitan', 'Sherbet', 'Peanut Butter', 'Cotton Candy'],
  },
  {
    id: 'sports',
    name: 'Sports',
    pack: 'party-classics',
    difficulty: 'hard',
    items: ['Soccer', 'Basketball', 'Tennis', 'Swimming', 'Volleyball', 'Baseball', 'Hockey', 'Golf', 'Boxing', 'Cycling', 'Rugby', 'Cricket', 'Skiing', 'Surfing', 'Wrestling', 'Badminton'],
  },
  {
    id: 'tabletop-game-types',
    name: 'Tabletop Game Types',
    pack: 'party-classics',
    difficulty: 'easy',
    items: ['Trivia Game', 'Trading Game', 'Word Guessing Game', 'Card Matching Game', 'Dice Game', 'Strategy War Game', 'Puzzle Game', 'Auction Game', 'Cooperative Game', 'Bluffing Game', 'Deduction Game', 'Drawing Game', 'Party Game', 'Deck-Building Game', 'Tile-Placement Game', 'Roll-and-Move Game'],
  },

  // --- pop-culture (free) ---
  {
    id: 'music-genres',
    name: 'Music Genres',
    pack: 'pop-culture',
    difficulty: 'easy',
    items: ['Pop', 'Rock', 'Jazz', 'Hip Hop', 'Country', 'Classical', 'Reggae', 'Blues', 'Electronic', 'Folk', 'Metal', 'Punk', 'Funk', 'Disco', 'Gospel', 'Latin'],
  },
  {
    id: 'dance-styles',
    name: 'Dance Styles',
    pack: 'pop-culture',
    difficulty: 'medium',
    items: ['Ballet', 'Tap', 'Hip Hop', 'Salsa', 'Ballroom', 'Breakdancing', 'Contemporary', 'Line Dancing', 'Tango', 'Swing', 'Jazz Dance', 'Modern', 'Waltz', 'Cha-Cha', 'Krumping', 'Flamenco'],
  },
  {
    id: 'emojis',
    name: 'Emojis',
    pack: 'pop-culture',
    difficulty: 'hard',
    items: ['Laughing Face', 'Heart Eyes', 'Thumbs Up', 'Fire', 'Party Popper', 'Skull', 'Crying Face', 'Sunglasses Face', 'Clapping Hands', 'Star Struck', 'Wink Face', 'Thinking Face', 'Rolling Eyes', 'Cool Face', 'Angry Face', 'Ghost'],
  },
  {
    id: 'streaming-content-types',
    name: 'Streaming Content Types',
    pack: 'pop-culture',
    difficulty: 'easy',
    items: ['Documentary', 'Sitcom', 'Drama', 'Reality Show', 'Anime', 'Talk Show', 'Game Show', 'Stand-Up Special', 'Kids Show', 'True Crime', 'Cooking Show', 'Nature Documentary', 'Music Special', 'Awards Show', 'Miniseries', 'Variety Show'],
  },
  {
    id: 'superhero-powers',
    name: 'Superhero Powers',
    pack: 'pop-culture',
    difficulty: 'medium',
    items: ['Flight', 'Super Strength', 'Invisibility', 'Telepathy', 'Super Speed', 'Shape-Shifting', 'Time Travel', 'X-Ray Vision', 'Healing Factor', 'Elemental Control', 'Teleportation', 'Mind Control', 'Invulnerability', 'Weather Control', 'Super Hearing', 'Duplication'],
  },
  {
    id: 'sitcom-settings',
    name: 'Sitcom Settings',
    pack: 'pop-culture',
    difficulty: 'hard',
    items: ['Coffee Shop', 'Apartment Building', 'Office', 'High School', 'Hospital', 'Restaurant', 'Summer Camp', 'Suburban House', 'College Dorm', 'Small Town', 'Diner', 'Beach House', 'Retirement Home', 'Bookstore', 'Fire Station', 'Neighborhood Block'],
  },
  {
    id: 'award-show-categories',
    name: 'Award Show Categories',
    pack: 'pop-culture',
    difficulty: 'easy',
    items: ['Best Picture', 'Best Actor', 'Best Song', 'Best Costume', 'Best Director', 'Best Visual Effects', 'Best Screenplay', 'Best Editing', 'Best Score', 'Best Documentary', 'Best Cinematography', 'Best Sound', 'Best Makeup', 'Best Animated Feature', 'Best Original Song', 'Lifetime Achievement'],
  },
  {
    id: 'video-game-genres',
    name: 'Video Game Genres',
    pack: 'pop-culture',
    difficulty: 'medium',
    items: ['Platformer', 'Racing', 'Puzzle', 'Shooter', 'RPG', 'Fighting', 'Simulation', 'Strategy', 'Horror', 'Sports', 'Battle Royale', 'Sandbox', 'Rhythm', 'Tower Defense', 'Roguelike', 'Party Game'],
  },
  {
    id: 'social-media-actions',
    name: 'Social Media Actions',
    pack: 'pop-culture',
    difficulty: 'hard',
    items: ['Like', 'Share', 'Comment', 'Follow', 'Post', 'Story', 'Livestream', 'Direct Message', 'Tag', 'React', 'Save', 'Mute', 'Block', 'Pin', 'Repost', 'Bookmark'],
  },
  {
    id: 'cartoon-character-traits',
    name: 'Cartoon Character Traits',
    pack: 'pop-culture',
    difficulty: 'easy',
    items: ['Talking Animal', 'Superpower', 'Time Traveler', 'Robot Sidekick', 'Secret Identity', 'Magic Wand', 'Best Friend Duo', 'Villain Sidekick', 'Talking Vehicle', 'Wise Mentor', 'Catchphrase', 'Rival', 'Transformation', 'Sidekick Animal', 'Secret Lair', 'Gadget Belt'],
  },

  // --- around-the-world (paid) ---
  {
    id: 'countries',
    name: 'Countries',
    pack: 'around-the-world',
    difficulty: 'easy',
    items: ['Brazil', 'Japan', 'Egypt', 'Canada', 'Australia', 'France', 'Kenya', 'Norway', 'Thailand', 'Mexico', 'Italy', 'Germany', 'India', 'Spain', 'Argentina', 'Nigeria'],
  },
  {
    id: 'capital-cities',
    name: 'Capital Cities',
    pack: 'around-the-world',
    difficulty: 'medium',
    items: ['Tokyo', 'Paris', 'Cairo', 'Ottawa', 'Canberra', 'Nairobi', 'Oslo', 'Bangkok', 'Mexico City', 'Brasilia', 'London', 'Berlin', 'Madrid', 'New Delhi', 'Buenos Aires', 'Abuja'],
  },
  {
    id: 'famous-landmarks',
    name: 'Famous Landmarks',
    pack: 'around-the-world',
    difficulty: 'hard',
    items: ['Eiffel Tower', 'Great Wall', 'Pyramids of Giza', 'Statue of Liberty', 'Taj Mahal', 'Colosseum', 'Big Ben', 'Sydney Opera House', 'Christ the Redeemer', 'Machu Picchu', 'Golden Gate Bridge', 'Leaning Tower of Pisa', 'Mount Rushmore', 'Niagara Falls', 'Stonehenge', 'Petra'],
  },
  {
    id: 'languages',
    name: 'Languages',
    pack: 'around-the-world',
    difficulty: 'easy',
    items: ['Spanish', 'Mandarin', 'Arabic', 'Hindi', 'Portuguese', 'Russian', 'Japanese', 'Swahili', 'German', 'Korean', 'French', 'Italian', 'Vietnamese', 'Turkish', 'Polish', 'Dutch'],
  },
  {
    id: 'world-currencies',
    name: 'World Currencies',
    pack: 'around-the-world',
    difficulty: 'medium',
    items: ['Dollar', 'Euro', 'Yen', 'Peso', 'Rupee', 'Real', 'Won', 'Franc', 'Ruble', 'Dinar', 'Pound', 'Krona', 'Rand', 'Shekel', 'Baht', 'Zloty'],
  },
  {
    id: 'continents-and-oceans',
    name: 'Continents & Oceans',
    pack: 'around-the-world',
    difficulty: 'hard',
    items: ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Antarctica', 'Oceania', 'Pacific Ocean', 'Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Southern Ocean', 'Eurasia', 'Sub-Saharan Africa', 'Polynesia', 'Caribbean'],
  },
  {
    id: 'mountain-ranges',
    name: 'Mountain Ranges',
    pack: 'around-the-world',
    difficulty: 'easy',
    items: ['Andes', 'Alps', 'Himalayas', 'Rocky Mountains', 'Atlas Mountains', 'Ural Mountains', 'Appalachian Mountains', 'Carpathians', 'Pyrenees', 'Caucasus Mountains', 'Sierra Nevada', 'Great Dividing Range', 'Drakensberg', 'Zagros Mountains', 'Altai Mountains', 'Southern Alps'],
  },
  {
    id: 'national-foods',
    name: 'National Foods',
    pack: 'around-the-world',
    difficulty: 'medium',
    items: ['Sushi', 'Pizza', 'Tacos', 'Curry', 'Paella', 'Pho', 'Croissant', 'Dumplings', 'Hummus', 'Poutine', 'Goulash', 'Ramen', 'Falafel', 'Ceviche', 'Borscht', 'Kimchi'],
  },
  {
    id: 'modes-of-transportation',
    name: 'Modes of Transportation',
    pack: 'around-the-world',
    difficulty: 'hard',
    items: ['Bicycle', 'Train', 'Rickshaw', 'Ferry', 'Scooter', 'Subway', 'Tram', 'Cable Car', 'Gondola', 'Camel', 'Airplane', 'Sailboat', 'Motorcycle', 'Helicopter', 'Hot Air Balloon', 'Skateboard'],
  },
  {
    id: 'famous-rivers',
    name: 'Famous Rivers',
    pack: 'around-the-world',
    difficulty: 'easy',
    items: ['Nile', 'Amazon', 'Yangtze', 'Mississippi', 'Danube', 'Thames', 'Ganges', 'Congo', 'Volga', 'Mekong', 'Rhine', 'Colorado River', 'Euphrates', 'Zambezi', 'Murray River', 'Yellow River'],
  },

  // --- food-and-drink (paid) ---
  {
    id: 'pizza-toppings',
    name: 'Pizza Toppings',
    pack: 'food-and-drink',
    difficulty: 'easy',
    items: ['Pepperoni', 'Mushroom', 'Olive', 'Pineapple', 'Sausage', 'Onion', 'Bell Pepper', 'Bacon', 'Spinach', 'Jalapeno', 'Ham', 'Anchovy', 'Artichoke', 'Tomato', 'Garlic', 'Pesto'],
  },
  {
    id: 'breakfast-foods',
    name: 'Breakfast Foods',
    pack: 'food-and-drink',
    difficulty: 'medium',
    items: ['Pancakes', 'Waffles', 'Oatmeal', 'Bacon', 'Eggs', 'Toast', 'Cereal', 'Bagel', 'Muffin', 'Yogurt', 'French Toast', 'Granola', 'Smoothie Bowl', 'Breakfast Burrito', 'Porridge', 'Crepes'],
  },
  {
    id: 'candy-types',
    name: 'Candy Types',
    pack: 'food-and-drink',
    difficulty: 'hard',
    items: ['Gummy Bears', 'Lollipop', 'Chocolate Bar', 'Caramel', 'Licorice', 'Taffy', 'Mint', 'Jellybean', 'Fudge', 'Toffee', 'Marshmallow', 'Gum', 'Peppermint', 'Praline', 'Nougat', 'Sour Candy'],
  },
  {
    id: 'cocktails-and-mocktails',
    name: 'Cocktails & Mocktails',
    pack: 'food-and-drink',
    difficulty: 'easy',
    items: ['Mojito', 'Lemonade', 'Iced Tea', 'Smoothie', 'Sparkling Cider', 'Fruit Punch', 'Milkshake', 'Shirley Temple', 'Virgin Mary', 'Ginger Ale Float', 'Sangria', 'Mule', 'Spritzer', 'Cooler', 'Fizz', 'Punch Bowl'],
  },
  {
    id: 'cooking-methods',
    name: 'Cooking Methods',
    pack: 'food-and-drink',
    difficulty: 'medium',
    items: ['Baking', 'Grilling', 'Boiling', 'Frying', 'Roasting', 'Steaming', 'Sauteing', 'Broiling', 'Poaching', 'Simmering', 'Blanching', 'Grating', 'Marinating', 'Searing', 'Whisking', 'Fermenting'],
  },
  {
    id: 'spices-and-herbs',
    name: 'Spices & Herbs',
    pack: 'food-and-drink',
    difficulty: 'hard',
    items: ['Basil', 'Cinnamon', 'Cumin', 'Paprika', 'Oregano', 'Ginger', 'Turmeric', 'Rosemary', 'Thyme', 'Nutmeg', 'Clove', 'Cardamom', 'Saffron', 'Dill', 'Sage', 'Fennel'],
  },
  {
    id: 'fast-food-items',
    name: 'Fast Food Items',
    pack: 'food-and-drink',
    difficulty: 'easy',
    items: ['Burger', 'Fries', 'Milkshake', 'Hot Dog', 'Chicken Nuggets', 'Onion Rings', 'Taco', 'Sub Sandwich', 'Nachos', 'Soft Pretzel', 'Corn Dog', 'Wrap', 'Slider', 'Churro', 'Curly Fries', 'Chicken Sandwich'],
  },
  {
    id: 'desserts',
    name: 'Desserts',
    pack: 'food-and-drink',
    difficulty: 'medium',
    items: ['Cheesecake', 'Brownie', 'Tiramisu', 'Pudding', 'Cupcake', 'Pie', 'Cookies', 'Donut', 'Macaron', 'Sorbet', 'Baklava', 'Trifle', 'Flan', 'Eclair', 'Panna Cotta', 'Gelato'],
  },
  {
    id: 'cheese-types',
    name: 'Cheese Types',
    pack: 'food-and-drink',
    difficulty: 'hard',
    items: ['Cheddar', 'Mozzarella', 'Brie', 'Gouda', 'Feta', 'Parmesan', 'Swiss', 'Blue Cheese', 'Ricotta', 'Camembert', 'Provolone', 'Manchego', 'Gorgonzola', 'Havarti', 'Asiago', 'Colby'],
  },
  {
    id: 'coffee-drinks',
    name: 'Coffee Drinks',
    pack: 'food-and-drink',
    difficulty: 'easy',
    items: ['Espresso', 'Latte', 'Cappuccino', 'Americano', 'Mocha', 'Macchiato', 'Cold Brew', 'Affogato', 'Flat White', 'Frappe', 'Irish Coffee', 'Cortado', 'Ristretto', 'Iced Coffee', 'Nitro Cold Brew', 'Turkish Coffee'],
  },
];
