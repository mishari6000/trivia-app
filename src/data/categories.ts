import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ImageSourcePropType } from 'react-native';

import type { CategoryName, QuestionSource } from '../types/question';
import { questions } from './questions';

export type Category = {
  name: CategoryName;
  /** Arabic label shown in the app. */
  label: string;
  /** Open Trivia DB category id (https://opentdb.com/api_category.php). */
  openTriviaId: number;
  /** Illustration for the category card (kie.ai, scripts/generate-category-art.mjs). */
  image?: ImageSourcePropType;
  /** Fallback shown if a category has no illustration. */
  icon: keyof typeof Ionicons.glyphMap;
};

/** Every Open Trivia DB category, in its own order. */
export const categories: Category[] = [
  {
    name: 'General Knowledge',
    label: 'معلومات عامة',
    openTriviaId: 9,
    image: require('../../assets/images/category-general.jpg'),
    icon: 'bulb',
  },
  {
    name: 'Entertainment: Books',
    label: 'كتب',
    openTriviaId: 10,
    image: require('../../assets/images/category-books.jpg'),
    icon: 'book',
  },
  {
    name: 'Entertainment: Film',
    label: 'أفلام',
    openTriviaId: 11,
    image: require('../../assets/images/category-film.jpg'),
    icon: 'film',
  },
  {
    name: 'Entertainment: Music',
    label: 'موسيقى',
    openTriviaId: 12,
    image: require('../../assets/images/category-music.jpg'),
    icon: 'musical-notes',
  },
  {
    name: 'Entertainment: Musicals & Theatres',
    label: 'مسرح',
    openTriviaId: 13,
    image: require('../../assets/images/category-theatre.jpg'),
    icon: 'mic',
  },
  {
    name: 'Entertainment: Television',
    label: 'تلفزيون',
    openTriviaId: 14,
    image: require('../../assets/images/category-television.jpg'),
    icon: 'tv',
  },
  {
    name: 'Entertainment: Video Games',
    label: 'ألعاب فيديو',
    openTriviaId: 15,
    image: require('../../assets/images/category-videogames.jpg'),
    icon: 'game-controller',
  },
  {
    name: 'Entertainment: Board Games',
    label: 'ألعاب لوحية',
    openTriviaId: 16,
    image: require('../../assets/images/category-boardgames.jpg'),
    icon: 'dice',
  },
  {
    name: 'Science & Nature',
    label: 'علوم وطبيعة',
    openTriviaId: 17,
    image: require('../../assets/images/category-science.jpg'),
    icon: 'flask',
  },
  {
    name: 'Science: Computers',
    label: 'كمبيوتر',
    openTriviaId: 18,
    image: require('../../assets/images/category-computers.jpg'),
    icon: 'laptop',
  },
  {
    name: 'Science: Mathematics',
    label: 'رياضيات',
    openTriviaId: 19,
    image: require('../../assets/images/category-mathematics.jpg'),
    icon: 'calculator',
  },
  {
    name: 'Mythology',
    label: 'أساطير',
    openTriviaId: 20,
    image: require('../../assets/images/category-mythology.jpg'),
    icon: 'flash',
  },
  {
    name: 'Sports',
    label: 'رياضة',
    openTriviaId: 21,
    image: require('../../assets/images/category-sports.jpg'),
    icon: 'football',
  },
  {
    name: 'Geography',
    label: 'جغرافيا',
    openTriviaId: 22,
    image: require('../../assets/images/category-geography.jpg'),
    icon: 'earth',
  },
  {
    name: 'History',
    label: 'تاريخ',
    openTriviaId: 23,
    image: require('../../assets/images/category-history.jpg'),
    icon: 'hourglass',
  },
  {
    name: 'Politics',
    label: 'سياسة',
    openTriviaId: 24,
    image: require('../../assets/images/category-politics.jpg'),
    icon: 'flag',
  },
  {
    name: 'Art',
    label: 'فن',
    openTriviaId: 25,
    image: require('../../assets/images/category-art.jpg'),
    icon: 'color-palette',
  },
  {
    name: 'Celebrities',
    label: 'مشاهير',
    openTriviaId: 26,
    image: require('../../assets/images/category-celebrities.jpg'),
    icon: 'star',
  },
  {
    name: 'Animals',
    label: 'حيوانات',
    openTriviaId: 27,
    image: require('../../assets/images/category-animals.jpg'),
    icon: 'paw',
  },
  {
    name: 'Vehicles',
    label: 'مركبات',
    openTriviaId: 28,
    image: require('../../assets/images/category-vehicles.jpg'),
    icon: 'car-sport',
  },
  {
    name: 'Entertainment: Comics',
    label: 'قصص مصوّرة',
    openTriviaId: 29,
    image: require('../../assets/images/category-comics.jpg'),
    icon: 'chatbox-ellipses',
  },
  {
    name: 'Science: Gadgets',
    label: 'أجهزة',
    openTriviaId: 30,
    image: require('../../assets/images/category-gadgets.jpg'),
    icon: 'phone-portrait',
  },
  {
    name: 'Entertainment: Japanese Anime & Manga',
    label: 'أنمي ومانجا',
    openTriviaId: 31,
    image: require('../../assets/images/category-anime.jpg'),
    icon: 'happy',
  },
  {
    name: 'Entertainment: Cartoon & Animations',
    label: 'رسوم متحركة',
    openTriviaId: 32,
    image: require('../../assets/images/category-cartoons.jpg'),
    icon: 'balloon',
  },
];

export const DEFAULT_CATEGORY: CategoryName = 'General Knowledge';

/** The order the Arabic local categories are shown in. */
const LOCAL_ORDER: CategoryName[] = [
  'General Knowledge',
  'Science & Nature',
  'Geography',
  'History',
  'Sports',
  'Animals',
];

export function getCategory(name: CategoryName): Category {
  return categories.find((c) => c.name === name) ?? categories[0];
}

/** Whether the bundled Arabic bank has questions for this category. */
export function hasLocalQuestions(name: CategoryName): boolean {
  return questions.some((q) => q.category === name);
}

/** Categories a player can pick for a source: the Arabic six locally, all 24 online. */
export function categoriesFor(source: QuestionSource): Category[] {
  if (source === 'online') return categories;
  return LOCAL_ORDER.filter(hasLocalQuestions).map(getCategory);
}
