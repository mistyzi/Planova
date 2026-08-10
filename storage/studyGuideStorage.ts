import AsyncStorage from "@react-native-async-storage/async-storage";

export type StudyGuideSection = {
  id: string;
  title: string;
  content: string;
};

export type StudyGuide = {
  id: string;
  title: string;
  description: string;
  sections: StudyGuideSection[];
  date: string;
};

const STORAGE_KEY = "@planova_study_guides";

export const createStudyGuideId = (): string => {
  return `study-guide-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

const readStudyGuides = async (): Promise<StudyGuide[]> => {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed: StudyGuide[] = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.log("Failed to read study guides:", error);
    return [];
  }
};

const writeStudyGuides = async (guides: StudyGuide[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(guides));
  } catch (error) {
    console.log("Failed to save study guides:", error);
    throw error;
  }
};

export const getStudyGuides = async (): Promise<StudyGuide[]> => {
  return readStudyGuides();
};

export const getStudyGuideById = async (id: string): Promise<StudyGuide | null> => {
  const guides = await readStudyGuides();
  return guides.find((guide) => guide.id === id) ?? null;
};

export const addStudyGuide = async (guide: StudyGuide): Promise<void> => {
  const guides = await readStudyGuides();
  await writeStudyGuides([guide, ...guides]);
};

export const updateStudyGuide = async (updatedGuide: StudyGuide): Promise<void> => {
  const guides = await readStudyGuides();
  const updatedGuides = guides.map((guide) =>
    guide.id === updatedGuide.id ? updatedGuide : guide
  );
  await writeStudyGuides(updatedGuides);
};

export const deleteStudyGuide = async (id: string): Promise<void> => {
  const guides = await readStudyGuides();
  const remainingGuides = guides.filter((guide) => guide.id !== id);
  await writeStudyGuides(remainingGuides);
};