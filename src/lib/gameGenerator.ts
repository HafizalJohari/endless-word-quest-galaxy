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
    easy: ['cat', 'dog', 'cow', 'pig', 'bee', 'ant', 'fox', 'owl'],
    medium: ['tiger', 'elephant', 'giraffe', 'penguin', 'dolphin', 'monkey', 'rabbit'],
    hard: ['rhinoceros', 'hippopotamus', 'chimpanzee', 'crocodile', 'kangaroo', 'chameleon']
  },
  food: {
    easy: ['pie', 'egg', 'ham', 'jam', 'tea', 'ice', 'nut', 'gum'],
    medium: ['pizza', 'burger', 'chicken', 'cheese', 'banana', 'orange', 'potato'],
    hard: ['spaghetti', 'broccoli', 'strawberry', 'chocolate', 'sandwich', 'avocado']
  },
  sports: {
    easy: ['run', 'jump', 'swim', 'ski', 'bike', 'ball', 'game', 'win'],
    medium: ['soccer', 'tennis', 'hockey', 'boxing', 'racing', 'skiing', 'diving'],
    hard: ['basketball', 'volleyball', 'badminton', 'wrestling', 'gymnastics', 'marathon']
  },
  nature: {
    easy: ['sun', 'moon', 'star', 'tree', 'leaf', 'wind', 'rain', 'snow'],
    medium: ['forest', 'mountain', 'rainbow', 'thunder', 'lightning', 'sunset', 'flower'],
    hard: ['waterfall', 'wilderness', 'hurricane', 'earthquake', 'avalanche', 'tornado']
  },
  colors: {
    easy: ['red', 'blue', 'pink', 'gold', 'gray', 'tan', 'navy', 'lime'],
    medium: ['green', 'yellow', 'orange', 'purple', 'silver', 'bronze', 'maroon'],
    hard: ['turquoise', 'magenta', 'crimson', 'lavender', 'emerald', 'burgundy']
  },
  school: {
    easy: ['pen', 'book', 'desk', 'art', 'math', 'read', 'draw', 'test'],
    medium: ['pencil', 'teacher', 'student', 'homework', 'science', 'history', 'library'],
    hard: ['calculator', 'geography', 'literature', 'education', 'assignment', 'knowledge']
  },
  space: {
    easy: ['sun', 'moon', 'star', 'mars', 'sky', 'ufo', 'orbit', 'comet'],
    medium: ['planet', 'rocket', 'saturn', 'galaxy', 'meteor', 'jupiter', 'neptune'],
    hard: ['astronaut', 'telescope', 'constellation', 'spacecraft', 'universe', 'satellite']
  },
  transportation: {
    easy: ['car', 'bus', 'van', 'jet', 'boat', 'bike', 'taxi', 'train'],
    medium: ['truck', 'plane', 'ferry', 'subway', 'scooter', 'helicopter', 'motorcycle'],
    hard: ['automobile', 'helicopter', 'submarine', 'spacecraft', 'ambulance', 'limousine']
  }
};

const GRID_SIZE = 12;

const getRandomTheme = (): string => {
  const themes = Object.keys(THEMES);
  return themes[Math.floor(Math.random() * themes.length)];
};

const getWordsForDifficulty = (theme: string, difficulty: Difficulty, count: number): string[] => {
  const words = THEMES[theme][difficulty];
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, words.length));
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

export const generateGameData = async (difficulty: Difficulty): Promise<GameData> => {
  // Simulate async operation for more realistic loading
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const theme = getRandomTheme();
  
  // Determine number of words based on difficulty
  const wordCounts = {
    easy: 6,
    medium: 8,
    hard: 10
  };
  
  const wordCount = wordCounts[difficulty];
  const words = getWordsForDifficulty(theme, difficulty, wordCount);
  const grid = placeWordsInGrid(words);
  
  return {
    grid,
    wordsToFind: words,
    theme: theme.charAt(0).toUpperCase() + theme.slice(1),
    difficulty
  };
};