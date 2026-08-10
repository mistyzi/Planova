// KEY LOADER

import Constants from "expo-constants";

export function getOcrKey() {
    return (
        Constants.expoConfig?.extra?.EXPO_PUBLIC_OCR_API_KEY ??
        process.env.EXPO_PUBLIC_OCR_API_KEY
    );
}
