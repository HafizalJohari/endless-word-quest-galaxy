import React, { useState, useCallback, useRef } from 'react';

interface WordSearchGridProps {
  grid: string[][];
  wordsToFind: string[];
  onWordFound: (word: string) => void;
  foundWords: Set<string>;
}

interface CellPosition {
  row: number;
  col: number;
}

interface SelectedPath {
  start: CellPosition;
  end: CellPosition;
  cells: CellPosition[];
}

export const WordSearchGrid: React.FC<WordSearchGridProps> = ({
  grid,
  wordsToFind,
  onWordFound,
  foundWords
}) => {
  const [selectedPath, setSelectedPath] = useState<SelectedPath | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [foundPaths, setFoundPaths] = useState<Map<string, CellPosition[]>>(new Map());
  const gridRef = useRef<HTMLDivElement>(null);

  const getCellKey = (row: number, col: number) => `${row}-${col}`;

  const getSelectedWord = useCallback((path: CellPosition[]): string => {
    return path.map(pos => grid[pos.row][pos.col]).join('');
  }, [grid]);

  const isValidDirection = (start: CellPosition, end: CellPosition): boolean => {
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    
    // Allow horizontal, vertical, and diagonal selections
    return (
      (rowDiff === 0 && colDiff !== 0) || // Horizontal
      (colDiff === 0 && rowDiff !== 0) || // Vertical
      (Math.abs(rowDiff) === Math.abs(colDiff)) // Diagonal
    );
  };

  const getPathBetween = (start: CellPosition, end: CellPosition): CellPosition[] => {
    const path: CellPosition[] = [];
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;
    
    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
    const rowStep = steps === 0 ? 0 : rowDiff / steps;
    const colStep = steps === 0 ? 0 : colDiff / steps;
    
    for (let i = 0; i <= steps; i++) {
      path.push({
        row: start.row + Math.round(rowStep * i),
        col: start.col + Math.round(colStep * i)
      });
    }
    
    return path;
  };

  const handleMouseDown = (row: number, col: number) => {
    const start = { row, col };
    setSelectedPath({
      start,
      end: start,
      cells: [start]
    });
    setIsSelecting(true);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isSelecting && selectedPath) {
      const end = { row, col };
      if (isValidDirection(selectedPath.start, end)) {
        const cells = getPathBetween(selectedPath.start, end);
        setSelectedPath({
          ...selectedPath,
          end,
          cells
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (selectedPath && isSelecting) {
      const word = getSelectedWord(selectedPath.cells);
      const reversedWord = word.split('').reverse().join('');
      
      // Check if the word or its reverse is in the words to find
      const foundWord = wordsToFind.find(w => 
        w.toUpperCase() === word.toUpperCase() || 
        w.toUpperCase() === reversedWord.toUpperCase()
      );
      
      if (foundWord && !foundWords.has(foundWord)) {
        onWordFound(foundWord);
        setFoundPaths(prev => new Map(prev).set(foundWord, selectedPath.cells));
      }
    }
    
    setSelectedPath(null);
    setIsSelecting(false);
  };

  const isCellSelected = (row: number, col: number): boolean => {
    return selectedPath?.cells.some(cell => cell.row === row && cell.col === col) || false;
  };

  const isCellFound = (row: number, col: number): boolean => {
    return Array.from(foundPaths.values()).some(path =>
      path.some(cell => cell.row === row && cell.col === col)
    );
  };

  return (
    <div className="flex flex-col items-center">
      <div
        ref={gridRef}
        className="grid grid-cols-12 gap-1 p-4 bg-game-grid rounded-lg shadow-inner select-none"
        onMouseLeave={() => {
          if (isSelecting) {
            setSelectedPath(null);
            setIsSelecting(false);
          }
        }}
      >
        {grid.map((row, rowIndex) =>
          row.map((letter, colIndex) => (
            <div
              key={getCellKey(rowIndex, colIndex)}
              className={`
                w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 
                flex items-center justify-center 
                text-sm sm:text-base md:text-lg font-bold 
                rounded-lg cursor-pointer transition-all duration-200
                shadow-cell
                ${isCellFound(rowIndex, colIndex)
                  ? 'bg-game-found text-secondary-foreground'
                  : isCellSelected(rowIndex, colIndex)
                  ? 'bg-game-highlight text-accent-foreground scale-110'
                  : 'bg-game-cell text-foreground hover:bg-game-cell-hover hover:scale-105'
                }
              `}
              onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
              onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
              onMouseUp={handleMouseUp}
            >
              {letter.toUpperCase()}
            </div>
          ))
        )}
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Click and drag to select words horizontally, vertically, or diagonally
        </p>
      </div>
    </div>
  );
};