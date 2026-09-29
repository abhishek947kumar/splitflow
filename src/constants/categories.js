// Expense Categories with color palettes and smart auto-suggestion
export const CATEGORIES = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: 'Utensils',
    emoji: '🍽️',
    color: '#f97316', // orange
    bg: 'rgba(249, 115, 22, 0.12)',
    keywords: ['dinner', 'lunch', 'breakfast', 'restaurant', 'cafe', 'coffee', 'bar', 'drinks', 'pizza', 'sushi', 'burger', 'brunch', 'tacos', 'ramen', 'omakase', 'bakery', 'starbucks', 'mcdonalds'],
  },
  {
    id: 'lodging',
    name: 'Lodging & Stays',
    icon: 'Hotel',
    emoji: '🏨',
    color: '#8b5cf6', // purple
    bg: 'rgba(139, 92, 246, 0.12)',
    keywords: ['hotel', 'airbnb', 'hostel', 'resort', 'stay', 'apartment', 'villa', 'lodge', 'room', 'booking', 'motel'],
  },
  {
    id: 'transport',
    name: 'Transport & Travel',
    icon: 'Plane',
    emoji: '✈️',
    color: '#06b6d4', // cyan
    bg: 'rgba(6, 182, 212, 0.12)',
    keywords: ['flight', 'uber', 'taxi', 'lyft', 'train', 'metro', 'subway', 'bus', 'fuel', 'gas', 'rental', 'car', 'parking', 'toll', 'ferry', 'shinkansen', 'vespa', 'scooter'],
  },
  {
    id: 'groceries',
    name: 'Groceries & Supplies',
    icon: 'ShoppingBag',
    emoji: '🛒',
    color: '#10b981', // emerald
    bg: 'rgba(16, 185, 129, 0.12)',
    keywords: ['groceries', 'supermarket', 'market', 'walmart', 'costco', 'trader joe', 'whole foods', 'produce', 'supplies', 'snacks', 'beer', 'wine', 'water', 'convenience'],
  },
  {
    id: 'entertainment',
    name: 'Entertainment & Fun',
    icon: 'Ticket',
    emoji: '🎟️',
    color: '#ec4899', // pink
    bg: 'rgba(236, 72, 153, 0.12)',
    keywords: ['tickets', 'museum', 'movie', 'cinema', 'concert', 'festival', 'tour', 'attraction', 'disney', 'amusement', 'club', 'bowling', 'karaoke', 'show', 'game', 'teamlab'],
  },
  {
    id: 'utilities',
    name: 'Utilities & Bills',
    icon: 'Zap',
    emoji: '💡',
    color: '#eab308', // amber
    bg: 'rgba(234, 179, 8, 0.12)',
    keywords: ['wifi', 'internet', 'electric', 'electricity', 'water', 'gas bill', 'bill', 'heat', 'trash', 'rent', 'cleaner', 'maid', 'subscription', 'netflix', 'spotify'],
  },
  {
    id: 'shopping',
    name: 'Shopping & Gear',
    icon: 'Tag',
    emoji: '🛍️',
    color: '#3b82f6', // blue
    bg: 'rgba(59, 130, 246, 0.12)',
    keywords: ['shopping', 'clothes', 'shoes', 'souvenir', 'gift', 'electronics', 'furniture', 'couch', 'amazon', 'gear', 'apparel'],
  },
  {
    id: 'general',
    name: 'General & Other',
    icon: 'CreditCard',
    emoji: '💳',
    color: '#64748b', // slate
    bg: 'rgba(100, 116, 139, 0.12)',
    keywords: ['other', 'misc', 'fee', 'charge', 'service', 'deposit'],
  },
];

export const CATEGORY_MAP = CATEGORIES.reduce((acc, cat) => {
  acc[cat.id] = cat;
  return acc;
}, {});

export function suggestCategory(title = '') {
  if (!title) return 'general';
  const clean = title.toLowerCase();
  for (const cat of CATEGORIES) {
    if (cat.keywords.some((kw) => clean.includes(kw))) {
      return cat.id;
    }
  }
  return 'general';
}
