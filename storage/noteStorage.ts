import AsyncStorage from "@react-native-async-storage/async-storage";

export type NoteType = "Text" | "Images";

export type StoredNote = {
  id: string;
  title: string;
  type: NoteType;
  preview: string;
  date: string;
  text?: string;
  images?: string[];
  extractedText?: string;
};

const STORAGE_KEY = "@planova_notes";

export async function getNotes(): Promise<StoredNote[]> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed as StoredNote[];
  } catch (error) {
    console.log("Failed to load notes:", error);

    return [];
  }
}

export async function saveNotes(notes: StoredNote[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch (error) {
    console.log("Failed to save notes:", error);

    throw error;
  }
}

export async function addNote(note: StoredNote): Promise<void> {
  const notes = await getNotes();

  await saveNotes([note, ...notes]);
}

export async function getNoteById(id: string): Promise<StoredNote | null> {
  const notes = await getNotes();

  return notes.find((note) => note.id === id) ?? null;
}

export async function updateNote(updatedNote: StoredNote): Promise<void> {
  const notes = await getNotes();

  const updatedNotes = notes.map((note) =>
    note.id === updatedNote.id ? updatedNote : note
  );

  await saveNotes(updatedNotes);
}

export async function deleteNote(id: string): Promise<void> {
  const notes = await getNotes();

  const remainingNotes = notes.filter((note) => note.id !== id);

  await saveNotes(remainingNotes);
}