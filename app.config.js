import 'dotenv/config';

export default {
  expo: {
    name: "planova",
    slug: "planova",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "planova",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,

    ios: {
      supportsTablet: true
    },

    android: {
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },

    web: {
      output: "static",
      favicon: "./assets/favicon.png"
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000"
          }
        }
      ],
      "expo-font",
      "expo-audio"
    ],

    experiments: {
      typedRoutes: true,
      reactCompiler: true
    },

    extra: {
      EXPO_PUBLIC_OCR_API_KEY: process.env.EXPO_PUBLIC_OCR_API_KEY
    }
  }
};
