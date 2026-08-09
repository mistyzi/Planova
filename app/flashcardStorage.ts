import AsyncStorage from "@react-native-async-storage/async-storage";

export type Flashcard = {
  id: string;
  question: string;
  answer: string;
};

export type FlashcardDeck = {
  id: string;
  title: string;
  description: string;
  cards: Flashcard[];
  date: string;
};

const STORAGE_KEY = "@planova_flashcards";

export async function getFlashcardDecks(): Promise<FlashcardDeck[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as FlashcardDeck[];
  } catch (error) {
    console.log("Failed to load flashcard decks:", error);
    return [];
  }
}

export async function saveFlashcardDecks(decks: FlashcardDeck[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
  } catch (error) {
    console.log("Failed to save flashcard decks:", error);
  }
}

export async function addFlashcardDeck(deck: FlashcardDeck): Promise<void> {
  const decks = await getFlashcardDecks();
  await saveFlashcardDecks([deck, ...decks]);
}

export async function getFlashcardDeckById(id: string): Promise<FlashcardDeck | null> {
  const decks = await getFlashcardDecks();
  return decks.find((deck) => deck.id === id) ?? null;
}

export async function updateFlashcardDeck(updatedDeck: FlashcardDeck): Promise<void> {
  const decks = await getFlashcardDecks();
  const updatedDecks = decks.map((deck) =>
    deck.id === updatedDeck.id ? updatedDeck : deck
  );
  await saveFlashcardDecks(updatedDecks);
}

export async function deleteFlashcardDeck(id: string): Promise<void> {
  const decks = await getFlashcardDecks();
  await saveFlashcardDecks(decks.filter((deck) => deck.id !== id));
}

export function createFlashcardId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2);
}