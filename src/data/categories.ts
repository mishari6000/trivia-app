import type Ionicons from '@expo/vector-icons/Ionicons';
import type { ImageSourcePropType } from 'react-native';

import type { CategoryName } from '../types/question';

export type Category = {
  name: CategoryName;
  /** Arabic label shown in the app. */
  label: string;
  /** Open Trivia DB category id, for loading internet questions later. */
  openTriviaId: number;
  /** Illustration for the category card; categories without one show `icon`. */
  image?: ImageSourcePropType;
  icon: keyof typeof Ionicons.glyphMap;
};

export const categories: Category[] = [
  {
    name: 'General Knowledge',
    label: 'معلومات عامة',
    openTriviaId: 9,
    image: require('../../assets/images/category-general.png'),
    icon: 'bulb',
  },
  {
    name: 'Science & Nature',
    label: 'علوم وطبيعة',
    openTriviaId: 17,
    image: require('../../assets/images/category-science.png'),
    icon: 'flask',
  },
  {
    name: 'Geography',
    label: 'جغرافيا',
    openTriviaId: 22,
    image: require('../../assets/images/category-geography.png'),
    icon: 'earth',
  },
  {
    name: 'History',
    label: 'تاريخ',
    openTriviaId: 23,
    image: require('../../assets/images/category-history.png'),
    icon: 'hourglass',
  },
  {
    name: 'Sports',
    label: 'رياضة',
    openTriviaId: 21,
    image: require('../../assets/images/category-sports.png'),
    icon: 'football',
  },
  {
    name: 'Animals',
    label: 'حيوانات',
    openTriviaId: 27,
    image: require('../../assets/images/category-animals.png'),
    icon: 'paw',
  },
];

export const DEFAULT_CATEGORY: CategoryName = 'General Knowledge';

export function getCategory(name: CategoryName): Category {
  return categories.find((c) => c.name === name) ?? categories[0];
}
