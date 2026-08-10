import AsyncStorage from "@react-native-async-storage/async-storage";

export type Bookmark = {
  id: string;
  title: string;
  url: string;
  description?: string;
  date: string;
};

const BOOKMARKS_KEY = "@planova_bookmarks";

export const createBookmarkId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

export const getBookmarks = async (): Promise<Bookmark[]> => {
  try {
    const stored = await AsyncStorage.getItem(BOOKMARKS_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as Bookmark[];
  } catch (error) {
    console.log("Failed to load bookmarks:", error);
    return [];
  }
};

export const getBookmarkById = async (id: string): Promise<Bookmark | null> => {
  const bookmarks = await getBookmarks();
  return bookmarks.find((bookmark) => bookmark.id === id) ?? null;
};

export const addBookmark = async (bookmark: Bookmark): Promise<void> => {
  try {
    const bookmarks = await getBookmarks();
    const updatedBookmarks = [bookmark, ...bookmarks];
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
  } catch (error) {
    console.log("Failed to add bookmark:", error);
    throw error;
  }
};

export const updateBookmark = async (updatedBookmark: Bookmark): Promise<void> => {
  try {
    const bookmarks = await getBookmarks();
    const updatedBookmarks = bookmarks.map((bookmark) =>
      bookmark.id === updatedBookmark.id ? updatedBookmark : bookmark
    );
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
  } catch (error) {
    console.log("Failed to update bookmark:", error);
    throw error;
  }
};

export const deleteBookmark = async (id: string): Promise<void> => {
  try {
    const bookmarks = await getBookmarks();
    const updatedBookmarks = bookmarks.filter((bookmark) => bookmark.id !== id);
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
  } catch (error) {
    console.log("Failed to delete bookmark:", error);
    throw error;
  }
};

export const clearBookmarks = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(BOOKMARKS_KEY);
  } catch (error) {
    console.log("Failed to clear bookmarks:", error);
    throw error;
  }
};