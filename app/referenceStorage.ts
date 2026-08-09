import AsyncStorage from "@react-native-async-storage/async-storage";

export type ReferenceType = "Book" | "Article" | "Website" | "Journal" | "Video" | "Other";

export type Reference = {
  id: string;
  author: string;
  title: string;
  publication: string;
  year: string;
  type: ReferenceType;
  url: string;
  notes: string;
  date: string;
};

const STORAGE_KEY = "@planova_references";

export const createReferenceId = (): string => {
  return `reference-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const getReferences = async (): Promise<Reference[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: Reference[] = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.log("Failed to get references:", error);
    return [];
  }
};

export const getReferenceById = async (id: string): Promise<Reference | null> => {
  const references = await getReferences();
  return references.find((reference) => reference.id === id) ?? null;
};

export const addReference = async (reference: Reference): Promise<void> => {
  try {
    const references = await getReferences();
    const updatedReferences = [reference, ...references];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReferences));
  } catch (error) {
    console.log("Failed to add reference:", error);
    throw error;
  }
};

export const updateReference = async (updatedReference: Reference): Promise<void> => {
  try {
    const references = await getReferences();
    const updatedReferences = references.map((reference) =>
      reference.id === updatedReference.id ? updatedReference : reference
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReferences));
  } catch (error) {
    console.log("Failed to update reference:", error);
    throw error;
  }
};

export const deleteReference = async (id: string): Promise<void> => {
  try {
    const references = await getReferences();
    const updatedReferences = references.filter((reference) => reference.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedReferences));
  } catch (error) {
    console.log("Failed to delete reference:", error);
    throw error;
  }
};