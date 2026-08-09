import AsyncStorage from "@react-native-async-storage/async-storage";

const CUSTOM_FOCUS_KEY = "@planova_custom_cosmic_focuses";

export type CustomFocus = {
  id: string;
  name: string;
  durationSeconds: number;
  createdAt: number;
};

export async function getCustomFocuses(): Promise<CustomFocus[]> {
  try {
    const stored = await AsyncStorage.getItem(CUSTOM_FOCUS_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    return parsed as CustomFocus[];
  } catch (error) {
    console.log("Failed to load custom focuses:", error);
    return [];
  }
}

export async function saveCustomFocus(focus: CustomFocus): Promise<void> {
  try {
    const existing = await getCustomFocuses();
    const updated = [focus, ...existing.filter((item) => item.id !== focus.id)];
    await AsyncStorage.setItem(CUSTOM_FOCUS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.log("Failed to save custom focus:", error);
  }
}

export async function deleteCustomFocus(id: string): Promise<void> {
  try {
    const existing = await getCustomFocuses();
    const updated = existing.filter((item) => item.id !== id);
    await AsyncStorage.setItem(CUSTOM_FOCUS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.log("Failed to delete custom focus:", error);
  }
}