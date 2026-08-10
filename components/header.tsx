import React from "react";

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";

import { useProfileSheet } from "@/context/profilesheetcontext";
import { useTheme } from "@/context/themecontext";

import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function Header() {
  const insets = useSafeAreaInsets();
  const { openProfile } = useProfileSheet();
  const { isDark } = useTheme();

  /*
   * ============================================================
   * EXISTING COLORS — UNCHANGED
   * ============================================================
   */

  const colors = isDark
    ? {
        logo: "#e9d5ff",

        iconBackground: "rgba(255,255,255,0.12)",
        iconBorder: "rgba(196,181,253,0.35)",

        badge: "#d8b4fe",
        badgeText: "#0e1938",
      }
    : {
        logo: "#4F427D",

        iconBackground: "rgba(70,58,120,0.18)",
        iconBorder: "rgba(79,66,125,0.40)",

        badge: "#B9A9DF",
        badgeText: "#29233F",
      };

  return (
    <SafeAreaView style={styles.headerContainer}>
      {/* ================================================== */}
      {/* HEADER BACKGROUND */}
      {/* ================================================== */}

      <LinearGradient
        colors={
          isDark
            ? [
                "#0e1938",
                "#0e1938",
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
      {/* HEADER CONTENT — UNCHANGED */}
      {/* ================================================== */}

      <View style={styles.header}>
        <View style={styles.logoRow}>
          <MaterialCommunityIcons
            name="star-four-points"
            size={24}
            color={isDark ? "#c4b5fd" : "#6D5A9F"}
          />

          <Text
            style={[
              styles.logoText,
              {
                color: colors.logo,
              },
            ]}
          >
            PLANOVA
          </Text>
        </View>

        <View style={styles.headerIcons}>
          {/* Notifications */}

          <TouchableOpacity
            style={[
              styles.iconBubble,
              {
                backgroundColor: colors.iconBackground,
                borderColor: colors.iconBorder,
              },
            ]}
          >
            <Ionicons name="notifications" size={18} color="#ffffff" />

            <View
              style={[
                styles.badge,
                {
                  backgroundColor: colors.badge,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color: colors.badgeText,
                  },
                ]}
              >
                ✦
              </Text>
            </View>
          </TouchableOpacity>

          {/* Profile */}

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
            <Ionicons name="person" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /*
   * IMPORTANT:
   *
   * The header is now ABSOLUTE so it sits on top
   * of the ScrollView instead of pushing the ScrollView down.
   */

  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,

    height: 120,

    zIndex: 100,
    elevation: 100,
  },

  /*
   * This is the actual fade.
   *
   * It is intentionally SHORT.
   * The transparent bottom lets the scrolling
   * content show through.
   */

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

  logoText: {
    fontFamily: "MysteryQuest",
    marginLeft: 8,
    fontSize: 28,
    letterSpacing: 1,
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

  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  badgeText: {
    fontFamily: "BitterBold",
    fontSize: 9,
  },
});
