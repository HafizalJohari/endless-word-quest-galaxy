// High-performance word validation using Trie data structure
// More efficient than Set for prefix-based word lookups

interface TrieNode {
  children: Map<string, TrieNode>;
  isEndOfWord: boolean;
  word?: string;
}

export class WordTrie {
  private root: TrieNode;
  private wordSet: Set<string>; // Fallback for exact lookups
  
  constructor() {
    this.root = {
      children: new Map(),
      isEndOfWord: false
    };
    this.wordSet = new Set();
  }

  // O(m) insertion where m is word length
  insert(word: string): void {
    const normalizedWord = word.toUpperCase();
    this.wordSet.add(normalizedWord);
    
    let current = this.root;
    for (const char of normalizedWord) {
      if (!current.children.has(char)) {
        current.children.set(char, {
          children: new Map(),
          isEndOfWord: false
        });
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
    current.word = normalizedWord;
  }

  // O(m) search where m is word length - much faster than array.find()
  search(word: string): boolean {
    const normalizedWord = word.toUpperCase();
    return this.wordSet.has(normalizedWord);
  }

  // Search with both forward and reverse directions
  searchBidirectional(word: string): string | null {
    const normalizedWord = word.toUpperCase();
    const reversedWord = normalizedWord.split('').reverse().join('');
    
    if (this.wordSet.has(normalizedWord)) {
      // Find original case from the set
      for (const originalWord of this.wordSet) {
        if (originalWord === normalizedWord) {
          return originalWord;
        }
      }
    }
    
    if (this.wordSet.has(reversedWord)) {
      for (const originalWord of this.wordSet) {
        if (originalWord === reversedWord) {
          return originalWord;
        }
      }
    }
    
    return null;
  }

  // Prefix matching for auto-completion (future feature)
  hasPrefix(prefix: string): boolean {
    const normalizedPrefix = prefix.toUpperCase();
    let current = this.root;
    
    for (const char of normalizedPrefix) {
      if (!current.children.has(char)) {
        return false;
      }
      current = current.children.get(char)!;
    }
    
    return true;
  }

  // Get all words with a given prefix
  getWordsWithPrefix(prefix: string): string[] {
    const normalizedPrefix = prefix.toUpperCase();
    let current = this.root;
    
    // Navigate to prefix node
    for (const char of normalizedPrefix) {
      if (!current.children.has(char)) {
        return [];
      }
      current = current.children.get(char)!;
    }
    
    // Collect all words from this point
    const words: string[] = [];
    this.collectWords(current, normalizedPrefix, words);
    return words;
  }

  private collectWords(node: TrieNode, prefix: string, words: string[]): void {
    if (node.isEndOfWord && node.word) {
      words.push(node.word);
    }
    
    for (const [char, childNode] of node.children) {
      this.collectWords(childNode, prefix + char, words);
    }
  }

  // Memory usage optimization
  getMemoryUsage(): { nodeCount: number; wordCount: number } {
    let nodeCount = 0;
    const countNodes = (node: TrieNode) => {
      nodeCount++;
      for (const child of node.children.values()) {
        countNodes(child);
      }
    };
    countNodes(this.root);
    
    return { nodeCount, wordCount: this.wordSet.size };
  }
}

// Factory function for creating optimized word validators
export const createWordValidator = (words: string[]): WordTrie => {
  const trie = new WordTrie();
  words.forEach(word => trie.insert(word));
  return trie;
};