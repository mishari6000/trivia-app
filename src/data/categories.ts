import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ImageSourcePropType } from 'react-native';

import type { CategoryName } from '../types/question';

export type Category = {
  name: CategoryName;
  /** Arabic label shown in the app. */
  label: string;
  /** Illustration for the category card (kie.ai, scripts/generate-category-art.mjs). */
  image?: ImageSourcePropType;
  /** Fallback shown if a category has no illustration. */
  icon: keyof typeof Ionicons.glyphMap;
};

/** All 24 categories (names match Open Trivia DB's, which the bank was planned from). */
export const categories: Category[] = [
  {
    name: 'General Knowledge',
    label: 'معلومات عامة',
    image: require('../../assets/images/category-general.jpg'),
    icon: 'bulb',
  },
  {
    name: 'Entertainment: Books',
    label: 'كتب',
    image: require('../../assets/images/category-books.jpg'),
    icon: 'book',
  },
  {
    name: 'Entertainment: Film',
    label: 'أفلام',
    image: require('../../assets/images/category-film.jpg'),
    icon: 'film',
  },
  {
    name: 'Entertainment: Music',
    label: 'موسيقى',
    image: require('../../assets/images/category-music.jpg'),
    icon: 'musical-notes',
  },
  {
    name: 'Entertainment: Musicals & Theatres',
    label: 'مسرح',
    image: require('../../assets/images/category-theatre.jpg'),
    icon: 'mic',
  },
  {
    name: 'Entertainment: Television',
    label: 'تلفزيون',
    image: require('../../assets/images/category-television.jpg'),
    icon: 'tv',
  },
  {
    name: 'Entertainment: Video Games',
    label: 'ألعاب فيديو',
    image: require('../../assets/images/category-videogames.jpg'),
    icon: 'game-controller',
  },
  {
    name: 'Entertainment: Board Games',
    label: 'ألعاب لوحية',
    image: require('../../assets/images/category-boardgames.jpg'),
    icon: 'dice',
  },
  {
    name: 'Science & Nature',
    label: 'علوم وطبيعة',
    image: require('../../assets/images/category-science.jpg'),
    icon: 'flask',
  },
  {
    name: 'Science: Computers',
    label: 'كمبيوتر',
    image: require('../../assets/images/category-computers.jpg'),
    icon: 'laptop',
  },
  {
    name: 'Science: Mathematics',
    label: 'رياضيات',
    image: require('../../assets/images/category-mathematics.jpg'),
    icon: 'calculator',
  },
  {
    name: 'Mythology',
    label: 'أساطير',
    image: require('../../assets/images/category-mythology.jpg'),
    icon: 'flash',
  },
  {
    name: 'Sports',
    label: 'رياضة',
    image: require('../../assets/images/category-sports.jpg'),
    icon: 'football',
  },
  {
    name: 'Geography',
    label: 'جغرافيا',
    image: require('../../assets/images/category-geography.jpg'),
    icon: 'earth',
  },
  {
    name: 'History',
    label: 'تاريخ',
    image: require('../../assets/images/category-history.jpg'),
    icon: 'hourglass',
  },
  {
    name: 'Politics',
    label: 'سياسة',
    image: require('../../assets/images/category-politics.jpg'),
    icon: 'flag',
  },
  {
    name: 'Art',
    label: 'فن',
    image: require('../../assets/images/category-art.jpg'),
    icon: 'color-palette',
  },
  {
    name: 'Celebrities',
    label: 'مشاهير',
    image: require('../../assets/images/category-celebrities.jpg'),
    icon: 'star',
  },
  {
    name: 'Animals',
    label: 'حيوانات',
    image: require('../../assets/images/category-animals.jpg'),
    icon: 'paw',
  },
  {
    name: 'Vehicles',
    label: 'مركبات',
    image: require('../../assets/images/category-vehicles.jpg'),
    icon: 'car-sport',
  },
  {
    name: 'Entertainment: Comics',
    label: 'قصص مصوّرة',
    image: require('../../assets/images/category-comics.jpg'),
    icon: 'chatbox-ellipses',
  },
  {
    name: 'Science: Gadgets',
    label: 'أجهزة',
    image: require('../../assets/images/category-gadgets.jpg'),
    icon: 'phone-portrait',
  },
  {
    name: 'Entertainment: Japanese Anime & Manga',
    label: 'أنمي ومانجا',
    image: require('../../assets/images/category-anime.jpg'),
    icon: 'happy',
  },
  {
    name: 'Entertainment: Cartoon & Animations',
    label: 'رسوم متحركة',
    image: require('../../assets/images/category-cartoons.jpg'),
    icon: 'balloon',
  },
];

export const DEFAULT_CATEGORY: CategoryName = 'General Knowledge';

/** Shown first on the welcome screen; the rest follow in list order. */
export const FEATURED: CategoryName[] = [
  'General Knowledge',
  'Science & Nature',
  'Geography',
  'History',
  'Sports',
  'Animals',
];

/** «صمم فئتك»: not in the bank; its questions are generated for the player's own topic. */
export const CUSTOM_CATEGORY: Category = { name: 'Custom', label: 'صمم فئتك', icon: 'sparkles' };

export function getCategory(name: CategoryName): Category {
  if (name === 'Custom') return CUSTOM_CATEGORY;
  return categories.find((c) => c.name === name) ?? categories[0];
}
