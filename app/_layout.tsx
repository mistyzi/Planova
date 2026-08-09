import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "../context/themecontext";
import { FocusTimerProvider } from "../context/focustimercontext";
import FocusTimerOverlay from "@/components/focusTimerOverlay";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Bitter: require("../assets/fonts/Bitter-Regular.otf"),
    BitterBold: require("../assets/fonts/Bitter-Bold.otf"),
    MysteryQuest: require("../assets/fonts/MysteryQuest-Regular.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <FocusTimerProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
          </Stack>
          <FocusTimerOverlay />
          <StatusBar style="auto" />
        </FocusTimerProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}