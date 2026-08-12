import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import MaskedView from "@react-native-masked-view/masked-view";

import { useProfileSheet } from "@/context/profilesheetcontext";
import { useTheme } from "@/context/themecontext";

import { SafeAreaView } from "react-native-safe-area-context";
import NotificationPopup from "@/components/notificationsheet";

const logo = require("../assets/logo.png");

export default function Header() {
  const { openProfile } = useProfileSheet();
  const { isDark } = useTheme();

  const colors = isDark
    ? {
        iconBackground: "rgba(255,255,255,0.12)",
        iconBorder: "rgba(196,181,253,0.35)",
      }
    : {
        iconBackground: "rgba(70,58,120,0.18)",
        iconBorder: "rgba(79,66,125,0.40)",
      };

  return (
    <SafeAreaView style={styles.headerContainer}>
      {/* ================================================== */}
      {/* HEADER GRADIENT */}
      {/* ================================================== */}

      <LinearGradient
        colors={
          isDark
            ? [
                "#0E1938",
                "#0E1938",
                "rgba(14,25,56,0.75)",
                "rgba(14,25,56,0.30)",
                "rgba(14,25,56,0)",
              ]
            : [
                "#EEF3FF",
                "#EEF3FF",
                "rgba(238,243,255,0.75)",
                "rgba(238,243,255,0.30)",
                "rgba(238,243,255,0)",
              ]
        }
        locations={[0, 0.22, 0.52, 0.78, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.headerGradient}
        pointerEvents="none"
      />

      {/* ================================================== */}
      {/* HEADER CONTENT */}
      {/* ================================================== */}

      <View style={styles.header}>
        {/* ================================================== */}
        {/* PLANOVA LOGO + GRADIENT WORDMARK */}
        {/* ================================================== */}

        <View style={styles.logoRow}>
          <Image
            source={logo}
            style={styles.logoImage}
            resizeMode="contain"
          />

          {/* 
            MaskedView makes the gradient apply directly to
            the PLANOVA letters.

            The Text appears TWICE intentionally:
            1. Once as the mask.
            2. Once inside the gradient.

            This keeps every letter, including the "A".
          */}
          <MaskedView
            style={styles.wordmarkMask}
            maskElement={
              <Text style={styles.logoText}>
                PLANOVA
              </Text>
            }
          >
            <LinearGradient
              colors={
                isDark
                  ? [
                      "#E9D5FF",
                      "#C4B5FD",
                      "#8B7CF6",
                      "#6D5A9F",
                    ]
                  : [
                      "#6D5A9F",
                      "#8B7CF6",
                      "#A78BFA",
                      "#4F427D",
                    ]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.wordmarkGradient}
            >
              <Text
                style={[
                  styles.logoText,
                  styles.logoTextInvisible,
                ]}
              >
                PLANOVA
              </Text>
            </LinearGradient>
          </MaskedView>
        </View>

        {/* ================================================== */}
        {/* HEADER ICONS */}
        {/* ================================================== */}

        <View style={styles.headerIcons}>
          <NotificationPopup />

          <TouchableOpacity
            style={[
              styles.iconBubble,
              {
                backgroundColor: colors.iconBackground,
                borderColor: colors.iconBorder,
              },
            ]}
            onPress={openProfile}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="account"
              size={18}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 100,
    elevation: 100,
  },

  headerGradient: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    zIndex: 0,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 24,
    paddingTop: 0,
    paddingBottom: 20,

    zIndex: 1,
  },

  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  logoImage: {
    width: 30,
    height: 30,
    marginRight: 8,
  },

  wordmarkMask: {
    justifyContent: "center",
    alignItems: "flex-start",
  },

  logoText: {
    fontFamily: "MysteryQuest",
    fontSize: 28,
    fontWeight: "400",
    letterSpacing: 1,
    includeFontPadding: false,
    textAlign: "left",
  },

  logoTextInvisible: {
    opacity: 0,
  },

  wordmarkGradient: {
    alignSelf: "flex-start",
  },

  headerIcons: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,

    borderWidth: 1,

    alignItems: "center",
    justifyContent: "center",

    marginLeft: 10,
  },
});