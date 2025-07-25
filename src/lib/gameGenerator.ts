export type Difficulty = 'easy' | 'medium' | 'hard';

export interface GameData {
  grid: string[][];
  wordsToFind: string[];
  theme: string;
  difficulty: Difficulty;
}

interface ThemeWordList {
  [key: string]: {
    easy: string[];
    medium: string[];
    hard: string[];
  };
}

const THEMES: ThemeWordList = {
  animals: {
    easy: ['cat', 'dog', 'cow', 'pig', 'bee', 'ant', 'fox', 'owl', 'bat', 'rat', 'bug', 'fish'],
    medium: ['tiger', 'elephant', 'giraffe', 'penguin', 'dolphin', 'monkey', 'rabbit', 'turtle', 'lizard', 'eagle', 'shark', 'whale'],
    hard: ['rhinoceros', 'hippopotamus', 'chimpanzee', 'crocodile', 'kangaroo', 'chameleon', 'butterfly', 'octopus', 'flamingo', 'platypus', 'armadillo', 'mongoose']
  },
  food: {
    easy: ['pie', 'egg', 'ham', 'jam', 'tea', 'ice', 'nut', 'gum', 'cake', 'milk', 'soup', 'rice'],
    medium: ['pizza', 'burger', 'chicken', 'cheese', 'banana', 'orange', 'potato', 'tomato', 'carrot', 'lettuce', 'butter', 'yogurt'],
    hard: ['spaghetti', 'broccoli', 'strawberry', 'chocolate', 'sandwich', 'avocado', 'cucumber', 'zucchini', 'asparagus', 'artichoke', 'cauliflower', 'blueberry']
  },
  sports: {
    easy: ['run', 'jump', 'swim', 'ski', 'bike', 'ball', 'game', 'win', 'race', 'kick', 'throw', 'catch'],
    medium: ['soccer', 'tennis', 'hockey', 'boxing', 'racing', 'skiing', 'diving', 'rowing', 'cycling', 'golfing', 'surfing', 'skating'],
    hard: ['basketball', 'volleyball', 'badminton', 'wrestling', 'gymnastics', 'marathon', 'swimming', 'football', 'baseball', 'cheerleading', 'weightlifting', 'skateboarding']
  },
  nature: {
    easy: ['sun', 'moon', 'star', 'tree', 'leaf', 'wind', 'rain', 'snow', 'rock', 'sand', 'hill', 'lake'],
    medium: ['forest', 'mountain', 'rainbow', 'thunder', 'lightning', 'sunset', 'flower', 'volcano', 'desert', 'island', 'valley', 'canyon'],
    hard: ['waterfall', 'wilderness', 'hurricane', 'earthquake', 'avalanche', 'tornado', 'glacier', 'meadow', 'prairie', 'plateau', 'peninsula', 'archipelago']
  },
  colors: {
    easy: ['red', 'blue', 'pink', 'gold', 'gray', 'tan', 'navy', 'lime', 'black', 'white', 'brown', 'cyan'],
    medium: ['green', 'yellow', 'orange', 'purple', 'silver', 'bronze', 'maroon', 'violet', 'indigo', 'salmon', 'coral', 'amber'],
    hard: ['turquoise', 'magenta', 'crimson', 'lavender', 'emerald', 'burgundy', 'chartreuse', 'vermillion', 'aquamarine', 'fuchsia', 'periwinkle', 'mahogany']
  },
  school: {
    easy: ['pen', 'book', 'desk', 'art', 'math', 'read', 'draw', 'test', 'quiz', 'page', 'word', 'line'],
    medium: ['pencil', 'teacher', 'student', 'homework', 'science', 'history', 'library', 'computer', 'notebook', 'backpack', 'classroom', 'assignment'],
    hard: ['calculator', 'geography', 'literature', 'education', 'assignment', 'knowledge', 'microscope', 'experiment', 'biography', 'encyclopedia', 'dictionary', 'multiplication']
  },
  space: {
    easy: ['sun', 'moon', 'star', 'mars', 'sky', 'ufo', 'orbit', 'comet', 'earth', 'space', 'alien', 'rocket'],
    medium: ['planet', 'rocket', 'saturn', 'galaxy', 'meteor', 'jupiter', 'neptune', 'mercury', 'venus', 'uranus', 'pluto', 'asteroid'],
    hard: ['astronaut', 'telescope', 'constellation', 'spacecraft', 'universe', 'satellite', 'nebula', 'supernova', 'blackhole', 'meteorite', 'observatory', 'cosmology']
  },
  transportation: {
    easy: ['car', 'bus', 'van', 'jet', 'boat', 'bike', 'taxi', 'train', 'truck', 'ship', 'plane', 'walk'],
    medium: ['truck', 'plane', 'ferry', 'subway', 'scooter', 'helicopter', 'motorcycle', 'bicycle', 'trolley', 'wagon', 'sled', 'canoe'],
    hard: ['automobile', 'helicopter', 'submarine', 'spacecraft', 'ambulance', 'limousine', 'bulldozer', 'excavator', 'steamboat', 'hovercraft', 'monorail', 'stagecoach']
  }
};

const GRID_SIZE = 12;

const getRandomTheme = (): string => {
  const themes = Object.keys(THEMES);
  return themes[Math.floor(Math.random() * themes.length)];
};

const getWordsForDifficulty = (theme: string, difficulty: Difficulty, count: number): string[] => {
  const themeWords = THEMES[theme];
  let selectedWords: string[] = [];
  
  // Mix words from different difficulty levels based on the current difficulty
  switch (difficulty) {
    case 'easy':
      // For easy: 8 easy words, 3 medium words, 1 hard word
      selectedWords = [
        ...getRandomWords(themeWords.easy, 8),
        ...getRandomWords(themeWords.medium, 3),
        ...getRandomWords(themeWords.hard, 1)
      ];
      break;
    case 'medium':
      // For medium: 4 easy words, 6 medium words, 2 hard words
      selectedWords = [
        ...getRandomWords(themeWords.easy, 4),
        ...getRandomWords(themeWords.medium, 6),
        ...getRandomWords(themeWords.hard, 2)
      ];
      break;
    case 'hard':
      // For hard: 2 easy words, 4 medium words, 6 hard words
      selectedWords = [
        ...getRandomWords(themeWords.easy, 2),
        ...getRandomWords(themeWords.medium, 4),
        ...getRandomWords(themeWords.hard, 6)
      ];
      break;
  }
  
  // Shuffle the final list and ensure we have exactly the requested count
  const shuffled = selectedWords.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

const getRandomWords = (wordList: string[], count: number): string[] => {
  const shuffled = [...wordList].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, wordList.length));
};

const createEmptyGrid = (): string[][] => {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(''));
};

const getRandomLetter = (): string => {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
};

const canPlaceWord = (
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: [number, number]
): boolean => {
  const [dRow, dCol] = direction;
  
  for (let i = 0; i < word.length; i++) {
    const newRow = row + i * dRow;
    const newCol = col + i * dCol;
    
    if (
      newRow < 0 || newRow >= GRID_SIZE ||
      newCol < 0 || newCol >= GRID_SIZE ||
      (grid[newRow][newCol] !== '' && grid[newRow][newCol] !== word[i].toUpperCase())
    ) {
      return false;
    }
  }
  
  return true;
};

const placeWord = (
  grid: string[][],
  word: string,
  row: number,
  col: number,
  direction: [number, number]
): void => {
  const [dRow, dCol] = direction;
  
  for (let i = 0; i < word.length; i++) {
    const newRow = row + i * dRow;
    const newCol = col + i * dCol;
    grid[newRow][newCol] = word[i].toUpperCase();
  }
};

const getDirections = (): [number, number][] => {
  return [
    [0, 1],   // Right
    [1, 0],   // Down
    [1, 1],   // Down-Right
    [0, -1],  // Left
    [-1, 0],  // Up
    [-1, -1], // Up-Left
    [1, -1],  // Down-Left
    [-1, 1]   // Up-Right
  ];
};

const placeWordsInGrid = (words: string[]): string[][] => {
  const grid = createEmptyGrid();
  const directions = getDirections();
  const placedWords: string[] = [];
  
  for (const word of words) {
    let placed = false;
    let attempts = 0;
    const maxAttempts = 100;
    
    while (!placed && attempts < maxAttempts) {
      const direction = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      
      if (canPlaceWord(grid, word, row, col, direction)) {
        placeWord(grid, word, row, col, direction);
        placedWords.push(word);
        placed = true;
      }
      
      attempts++;
    }
  }
  
  // Fill empty cells with random letters
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === '') {
        grid[row][col] = getRandomLetter();
      }
    }
  }
  
  return grid;
};

const getPreferredTheme = (preferences: string[]): string => {
  // Map preferences to actual theme names
  const preferenceThemeMap: { [key: string]: string[] } = {
    'animals': ['animals'],
    'vacation': ['transportation', 'nature'],
    'location': ['nature'],
    'sports': ['sports'],
    'hobby': ['sports', 'colors'],
    'school': ['school'],
    'colors': ['colors'],
    'space': ['space']
  };
  
  // Collect all possible themes based on preferences
  const possibleThemes: string[] = [];
  preferences.forEach(pref => {
    const themes = preferenceThemeMap[pref];
    if (themes) {
      possibleThemes.push(...themes);
    }
  });
  
  // If no preferences or no matching themes, use all themes
  if (possibleThemes.length === 0) {
    return getRandomTheme();
  }
  
  // Return a random theme from the preferred ones
  return possibleThemes[Math.floor(Math.random() * possibleThemes.length)];
};

export const generateGameData = async (difficulty: Difficulty, preferences: string[] = []): Promise<GameData> => {
  // Simulate async operation for more realistic loading
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const theme = getPreferredTheme(preferences);
  
  // Always find 12 words for consistent challenge
  const wordCount = 12;
  
  const words = getWordsForDifficulty(theme, difficulty, wordCount);
  const grid = placeWordsInGrid(words);
  
  return {
    grid,
    wordsToFind: words,
    theme: theme.charAt(0).toUpperCase() + theme.slice(1),
    difficulty
  };
};