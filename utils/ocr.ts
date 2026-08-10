import Constants from "expo-constants";

const OCR_KEY =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_OCR_API_KEY ??
    process.env.EXPO_PUBLIC_OCR_API_KEY;
