import React, { forwardRef, useMemo, useState } from "react";
import { Image, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../context/themecontext";
import MusicSelector from "./musicselector";

const ProfileSheet = forwardRef<any, {}>((props, ref) => {
  const snapPoints = useMemo(() => ["90%"], []);
  const [studyReminders, setStudyReminders] = useState(true);
  const { theme, setTheme, isDark } = useTheme();

  const colors = isDark
    ? {
        sheetBackground: "#0A1024",
        gradientTop: "#121A45",
        gradientBottom: "#06070D",
        textPrimary: "#FFFFFF",
        textSecondary: "#A8B2FF",
        textMuted: "#9097B5",
        card: "#1A1E52",
        deleteCard: "#1B1D36",
        description: "#B7B6D8",
        icon: "#E5D7FF",
        button: "#7C5DFF",
        tag: "#282C5D",
        optionBorder: "#2E3160",
        optionText: "#D3D2F2",
        smallSubtitle: "#A6A5C9",
        gold: "#E7DDB2",
        goldText: "#323246",
        deleteTitle: "#D68A8A",
        deleteDescription: "#AFAFC7",
        deleteBorder: "#7C5A66",
        deleteText: "#F2C8D0",
        handle: "#7C5DFF",
        iconBackground: "rgba(255,255,255,0.06)",
        cardBorder: "rgba(255,255,255,0.08)",
      }
    : {
        sheetBackground: "#F7F5FF",
        gradientTop: "#F0EDFF",
        gradientBottom: "#FFFFFF",
        textPrimary: "#17152A",
        textSecondary: "#6658B5",
        textMuted: "#77748A",
        card: "#FFFFFF",
        deleteCard: "#FFF5F7",
        description: "#66627A",
        icon: "#6658A8",
        button: "#7C5DFF",
        tag: "#EEEAFF",
        optionBorder: "#D8D1F4",
        optionText: "#5D5870",
        smallSubtitle: "#77738B",
        gold: "#E7DDB2",
        goldText: "#323246",
        deleteTitle: "#B95F6C",
        deleteDescription: "#81727A",
        deleteBorder: "#D7AAB4",
        deleteText: "#A45A68",
        handle: "#7C5DFF",
        iconBackground: "rgba(124,93,255,0.08)",
        cardBorder: "rgba(91,76,145,0.12)",
      };

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableContentPanningGesture
      enableHandlePanningGesture
      enableDynamicSizing={false}
      backgroundStyle={[
        styles.sheetBackground,
        {
          backgroundColor: colors.sheetBackground,
        },
      ]}
      handleIndicatorStyle={[
        styles.handle,
        {
          backgroundColor: colors.handle,
        },
      ]}
      backdropComponent={(backdropProps) => (
        <BottomSheetBackdrop
          {...backdropProps}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.3}
          pressBehavior="none"
        />
      )}
    >
      <BottomSheetScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        bounces
        overScrollMode="always"
      >
        <LinearGradient
          colors={[colors.gradientTop, colors.gradientBottom]}
          style={styles.gradient}
        >
          <Image
            source={{
              uri: "https://i.pinimg.com/736x/e9/46/55/e94655294e897527f56c15e51580661a.jpg",
            }}
            style={styles.avatar}
          />
          <Text
            style={[
              styles.name,
              {
                color: colors.textPrimary,
              },
            ]}
          >
            Hokazono Iroha
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
              },
            ]}
          >
            SAIT • Software Development
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text
                style={[
                  styles.statNumber,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                1240
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                Tasks Completed
              </Text>
            </View>
            <View style={styles.stat}>
              <Text
                style={[
                  styles.statNumber,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                12
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                Planets
              </Text>
            </View>
            <View style={styles.stat}>
              <Text
                style={[
                  styles.statNumber,
                  {
                    color: colors.textPrimary,
                  },
                ]}
              >
                158
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  {
                    color: colors.textMuted,
                  },
                ]}
              >
                Hours
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.button,
              {
                backgroundColor: colors.button,
              },
            ]}
          >
            <Text style={styles.buttonText}>EDIT PROFILE</Text>
          </TouchableOpacity>
          <Text
            style={[
              styles.heading,
              {
                color: colors.textPrimary,
              },
            ]}
          >
            Settings
          </Text>
          <View
            style={[
              styles.settingCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.settingTopRow}>
              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor: colors.iconBackground,
                  },
                ]}
              >
                <Ionicons name="time-outline" size={18} color={colors.icon} />
              </View>
              <Switch
                value={studyReminders}
                onValueChange={setStudyReminders}
                thumbColor="#D9C4FF"
                trackColor={{
                  false: isDark ? "#3B3B55" : "#D9D4EB",
                  true: "#6E5EFF",
                }}
              />
            </View>
            <Text
              style={[
                styles.settingTitle,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              Study Reminders
            </Text>
            <Text
              style={[
                styles.settingDescription,
                {
                  color: colors.description,
                },
              ]}
            >
              Receive cosmic nudges for your planned focus sessions.
            </Text>
            <View style={styles.tagRow}>
              <TouchableOpacity
                style={[
                  styles.tag,
                  {
                    backgroundColor: colors.tag,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  Every 45m
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tag,
                  {
                    backgroundColor: colors.tag,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tagText,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  Zen Mode
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={[
              styles.settingCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.settingRow}>
              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor: colors.iconBackground,
                  },
                ]}
              >
                <Ionicons
                  name="color-palette-outline"
                  size={18}
                  color={colors.icon}
                />
              </View>
            </View>
            <Text
              style={[
                styles.settingTitle,
                {
                  color: colors.textPrimary,
                },
              ]}
            >
              System Theme
            </Text>
            <Text
              style={[
                styles.settingDescription,
                {
                  color: colors.description,
                },
              ]}
            >
              Select the atmosphere that aligns with your focus cycles.
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setTheme("light");
                }}
                style={[
                  styles.themeOption,
                  {
                    borderColor:
                      theme === "light" ? "#B6A8FF" : colors.optionBorder,
                    backgroundColor:
                      theme === "light"
                        ? isDark
                          ? "rgba(124,93,255,0.18)"
                          : "rgba(124,93,255,0.10)"
                        : "transparent",
                  },
                ]}
              >
                <Ionicons
                  name="moon-outline"
                  size={17}
                  color={
                    theme === "light" ? colors.textPrimary : colors.optionText
                  }
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    {
                      color:
                        theme === "light"
                          ? colors.textPrimary
                          : colors.optionText,
                    },
                  ]}
                >
                  Stellar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setTheme("dark");
                }}
                style={[
                  styles.themeOption,
                  {
                    borderColor:
                      theme === "dark" ? "#B6A8FF" : colors.optionBorder,
                    backgroundColor:
                      theme === "dark"
                        ? isDark
                          ? "rgba(124,93,255,0.18)"
                          : "rgba(124,93,255,0.10)"
                        : "transparent",
                  },
                ]}
              >
                <Ionicons
                  name="sunny-outline"
                  size={17}
                  color={
                    theme === "dark" ? colors.textPrimary : colors.optionText
                  }
                />
                <Text
                  style={[
                    styles.themeOptionText,
                    {
                      color:
                        theme === "dark"
                          ? colors.textPrimary
                          : colors.optionText,
                    },
                  ]}
                >
                  Lunar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={[
              styles.settingCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.settingRow}>
              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor: colors.iconBackground,
                  },
                ]}
              >
                <Ionicons
                  name="planet-outline"
                  size={18}
                  color={isDark ? "#F3CFA5" : "#8A6A35"}
                />
              </View>
              <View style={styles.astralText}>
                <Text
                  style={[
                    styles.settingTitle,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  Astral Progress Tracking
                </Text>
                <Text
                  style={[
                    styles.settingDescription,
                    {
                      color: colors.description,
                    },
                  ]}
                >
                  Detailed mapping of your intellectual expansion. Visualize
                  subject mastery as expanding nebulae.
                </Text>
              </View>
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[
                  styles.option,
                  {
                    borderColor: colors.optionBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.optionText,
                    {
                      color: colors.optionText,
                    },
                  ]}
                >
                  Configure Map
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.goldButton,
                  {
                    backgroundColor: colors.gold,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.goldButtonText,
                    {
                      color: colors.goldText,
                    },
                  ]}
                >
                  View Universe
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.smallCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.settingRow}>
              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor: colors.iconBackground,
                  },
                ]}
              >
                <Ionicons name="shield-outline" size={18} color={colors.icon} />
              </View>
              <View style={styles.smallText}>
                <Text
                  style={[
                    styles.smallTitle,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  Privacy & Sanctuary
                </Text>
                <Text
                  style={[
                    styles.smallSubtitle,
                    {
                      color: colors.smallSubtitle,
                    },
                  ]}
                >
                  Manage your study visibility
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? "#B6A8FF" : "#6658A8"}
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.smallCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.settingRow}>
              <View
                style={[
                  styles.settingIcon,
                  {
                    backgroundColor: colors.iconBackground,
                  },
                ]}
              >
                <Ionicons
                  name="git-network-outline"
                  size={18}
                  color={colors.icon}
                />
              </View>
              <View style={styles.smallText}>
                <Text
                  style={[
                    styles.smallTitle,
                    {
                      color: colors.textPrimary,
                    },
                  ]}
                >
                  Connected Orbits
                </Text>
                <Text
                  style={[
                    styles.smallSubtitle,
                    {
                      color: colors.smallSubtitle,
                    },
                  ]}
                >
                  Manage external data streams
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={18}
                color={isDark ? "#B6A8FF" : "#6658A8"}
              />
            </View>
          </TouchableOpacity>
          <MusicSelector />
          <View
            style={[
              styles.deleteCard,
              {
                backgroundColor: colors.deleteCard,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.deleteText}>
              <Text
                style={[
                  styles.deleteTitle,
                  {
                    color: colors.deleteTitle,
                  },
                ]}
              >
                End Expedition
              </Text>
              <Text
                style={[
                  styles.deleteDescription,
                  {
                    color: colors.deleteDescription,
                  },
                ]}
              >
                Permanently delete your account and all study nebulae.
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.deleteButton,
                {
                  borderColor: colors.deleteBorder,
                },
              ]}
            >
              <Text
                style={[
                  styles.deleteButtonText,
                  {
                    color: colors.deleteText,
                  },
                ]}
              >
                Delete{"\n"}Data
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

ProfileSheet.displayName = "ProfileSheet";

export default ProfileSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  handle: {
    width: 60,
    height: 4,
    borderRadius: 2,
  },
  gradient: {
    width: "100%",
    minHeight: "100%",
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 0,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 18,
  },
  name: {
    fontFamily: "BitterBold",
    fontSize: 28,
    textAlign: "center",
  },
  subtitle: {
    fontFamily: "Bitter",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
  },
  stat: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontFamily: "BitterBold",
    fontSize: 18,
  },
  statLabel: {
    fontFamily: "Bitter",
    marginTop: 4,
  },
  button: {
    padding: 14,
    borderRadius: 15,
    marginBottom: 30,
  },
  buttonText: {
    fontFamily: "BitterBold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  heading: {
    fontFamily: "BitterBold",
    fontSize: 28,
    marginBottom: 18,
  },
  settingCard: {
    width: "100%",
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
  },
  smallCard: {
    width: "100%",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  deleteCard: {
    width: "100%",
    borderRadius: 22,
    padding: 18,
    marginTop: 8,
    marginBottom: 0,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
  },
  settingTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  settingTitle: {
    fontFamily: "BitterBold",
    fontSize: 22,
    marginTop: 14,
    marginBottom: 8,
  },
  settingDescription: {
    fontFamily: "Bitter",
    lineHeight: 22,
    fontSize: 15,
  },
  tagRow: {
    flexDirection: "row",
    marginTop: 18,
  },
  tag: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
  },
  tagText: {
    fontFamily: "Bitter",
    fontSize: 12,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
  },
  themeOption: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
    marginHorizontal: 4,
  },
  themeOptionText: {
    fontFamily: "BitterBold",
    fontSize: 14,
  },
  option: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
  },
  optionText: {
    fontFamily: "Bitter",
  },
  goldButton: {
    flex: 1,
    marginLeft: 8,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
  },
  goldButtonText: {
    fontFamily: "BitterBold",
  },
  smallText: {
    flex: 1,
    marginLeft: 12,
  },
  smallTitle: {
    fontFamily: "BitterBold",
    fontSize: 17,
  },
  smallSubtitle: {
    fontFamily: "Bitter",
    marginTop: 4,
    fontSize: 13,
  },
  astralText: {
    flex: 1,
    marginLeft: 14,
  },
  deleteText: {
    flex: 1,
    marginRight: 12,
  },
  deleteTitle: {
    fontFamily: "BitterBold",
    fontSize: 18,
  },
  deleteDescription: {
    fontFamily: "Bitter",
    marginTop: 6,
    lineHeight: 20,
  },
  deleteButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  deleteButtonText: {
    fontFamily: "BitterBold",
    textAlign: "center",
  },
});