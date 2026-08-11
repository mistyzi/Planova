import React, { forwardRef, useEffect, useMemo, useState } from "react";
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../context/themecontext";
import MusicSelector from "./musicselector";

const PROFILE_STORAGE_KEY = "@planova_profile";
const TASKS_STORAGE_KEY = "@planova_tasks";
const STREAK_STORAGE_KEY = "@planova_streak";
const FOCUS_STORAGE_KEY = "@planova_focus_time";

type ProfileData = {
  name: string;
  school: string;
  program: string;
  avatarUri: string;
  backgroundUri: string;
};

type ProfileStats = {
  tasksCompleted: number;
  currentStreak: number;
  focusHours: number;
};

type ProfileSheetProps = {
  onLogout?: () => void;
};

const DEFAULT_PROFILE: ProfileData = {
  name: "Hokazono Iroha",
  school: "SAIT",
  program: "Software Development",
  avatarUri: "https://i.pinimg.com/736x/e9/46/55/e94655294e897527f56c15e51580661a.jpg",
  backgroundUri: "https://images.unsplash.com/photo-1534791547706-0c292bfb8004?auto=format&fit=crop&w=1200&q=80",
};

const DEFAULT_STATS: ProfileStats = {
  tasksCompleted: 0,
  currentStreak: 0,
  focusHours: 0,
};

const ProfileSheet = forwardRef<any, ProfileSheetProps>(({ onLogout }, ref) => {
  const snapPoints = useMemo(() => ["90%"], []);
  const [profile, setProfile] = useState<ProfileData>(DEFAULT_PROFILE);
  const [stats, setStats] = useState<ProfileStats>(DEFAULT_STATS);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editSchool, setEditSchool] = useState("");
  const [editProgram, setEditProgram] = useState("");
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
        description: "#B7B6D8",
        icon: "#E5D7FF",
        button: "#7C5DFF",
        tag: "#282C5D",
        optionBorder: "#2E3160",
        optionText: "#D3D2F2",
        smallSubtitle: "#A6A5C9",
        gold: "#E7DDB2",
        goldText: "#323246",
        logoutTitle: "#D8B8FF",
        logoutDescription: "#AAA9C8",
        logoutBorder: "#6255A8",
        logoutText: "#D7C9FF",
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
        description: "#66627A",
        icon: "#6658A8",
        button: "#7C5DFF",
        tag: "#EEEAFF",
        optionBorder: "#D8D1F4",
        optionText: "#5D5870",
        smallSubtitle: "#77738B",
        gold: "#E7DDB2",
        goldText: "#323246",
        logoutTitle: "#6658B5",
        logoutDescription: "#77738B",
        logoutBorder: "#B7ACE3",
        logoutText: "#6658B5",
        handle: "#7C5DFF",
        iconBackground: "rgba(124,93,255,0.08)",
        cardBorder: "rgba(91,76,145,0.12)",
      };

  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (!stored) {
        setProfile(DEFAULT_PROFILE);
        return;
      }
      const parsed = JSON.parse(stored);
      if (!parsed || typeof parsed !== "object") {
        setProfile(DEFAULT_PROFILE);
        return;
      }
      setProfile({
        name: typeof parsed.name === "string" && parsed.name.trim() ? parsed.name : DEFAULT_PROFILE.name,
        school: typeof parsed.school === "string" ? parsed.school : DEFAULT_PROFILE.school,
        program: typeof parsed.program === "string" ? parsed.program : DEFAULT_PROFILE.program,
        avatarUri: typeof parsed.avatarUri === "string" && parsed.avatarUri ? parsed.avatarUri : DEFAULT_PROFILE.avatarUri,
        backgroundUri: typeof parsed.backgroundUri === "string" && parsed.backgroundUri ? parsed.backgroundUri : DEFAULT_PROFILE.backgroundUri,
      });
    } catch (error) {
      console.log("Failed to load profile:", error);
      setProfile(DEFAULT_PROFILE);
    }
  };

  const loadStats = async () => {
    try {
      let tasksCompleted = 0;
      let currentStreak = 0;
      let focusHours = 0;

      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (storedTasks) {
        const parsedTasks = JSON.parse(storedTasks);
        if (Array.isArray(parsedTasks)) {
          tasksCompleted = parsedTasks.filter((task: any) => task?.completed === true || task?.isCompleted === true || task?.status === "completed").length;
        } else if (parsedTasks && typeof parsedTasks === "object") {
          if (typeof parsedTasks.completedTasks === "number") {
            tasksCompleted = parsedTasks.completedTasks;
          }
        }
      }

      const storedStreak = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
      if (storedStreak) {
        const parsedStreak = JSON.parse(storedStreak);
        if (typeof parsedStreak === "number") {
          currentStreak = parsedStreak;
        } else if (parsedStreak && typeof parsedStreak === "object") {
          if (typeof parsedStreak.currentStreak === "number") {
            currentStreak = parsedStreak.currentStreak;
          } else if (typeof parsedStreak.streak === "number") {
            currentStreak = parsedStreak.streak;
          }
        }
      }

      const storedFocus = await AsyncStorage.getItem(FOCUS_STORAGE_KEY);
      if (storedFocus) {
        const parsedFocus = JSON.parse(storedFocus);
        if (typeof parsedFocus === "number") {
          focusHours = parsedFocus / 60;
        } else if (parsedFocus && typeof parsedFocus === "object") {
          if (typeof parsedFocus.totalMinutes === "number") {
            focusHours = parsedFocus.totalMinutes / 60;
          } else if (typeof parsedFocus.focusMinutes === "number") {
            focusHours = parsedFocus.focusMinutes / 60;
          } else if (typeof parsedFocus.totalSeconds === "number") {
            focusHours = parsedFocus.totalSeconds / 3600;
          } else if (typeof parsedFocus.focusSeconds === "number") {
            focusHours = parsedFocus.focusSeconds / 3600;
          }
        }
      }

      setStats({ tasksCompleted, currentStreak, focusHours });
    } catch (error) {
      console.log("Failed to load Planova stats:", error);
      setStats(DEFAULT_STATS);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      loadStats();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const saveProfileToStorage = async (updatedProfile: ProfileData) => {
    try {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
    } catch (error) {
      console.log("Failed to save profile:", error);
    }
  };

  const openEditProfile = () => {
    setEditName(profile.name);
    setEditSchool(profile.school);
    setEditProgram(profile.program);
    setShowEditProfile(true);
  };

  const saveProfile = async () => {
    const trimmedName = editName.trim();
    const trimmedSchool = editSchool.trim();
    const trimmedProgram = editProgram.trim();

    if (!trimmedName) {
      Alert.alert("Missing Name", "Please enter your full name.");
      return;
    }
    if (!trimmedSchool) {
      Alert.alert("Missing School", "Please enter your school or educational institution.");
      return;
    }
    if (!trimmedProgram) {
      Alert.alert("Missing Field", "Please enter your grade, program, or field of study.");
      return;
    }

    const updatedProfile: ProfileData = {
      ...profile,
      name: trimmedName,
      school: trimmedSchool,
      program: trimmedProgram,
    };

    setProfile(updatedProfile);
    await saveProfileToStorage(updatedProfile);
    setShowEditProfile(false);
  };

  const pickProfilePicture = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Photo Permission", "Please allow Planova to access your photos.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const updatedProfile = { ...profile, avatarUri: uri };
        setProfile(updatedProfile);
        await saveProfileToStorage(updatedProfile);
      }
    } catch (error) {
      console.log("Failed to pick profile picture:", error);
    }
  };

  const takeProfilePicture = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Camera Permission", "Please allow Planova to use your camera.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });
      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const updatedProfile = { ...profile, avatarUri: uri };
        setProfile(updatedProfile);
        await saveProfileToStorage(updatedProfile);
      }
    } catch (error) {
      console.log("Failed to take profile picture:", error);
    }
  };

  const pickBackground = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Photo Permission", "Please allow Planova to access your photos.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.9,
      });
      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const updatedProfile = { ...profile, backgroundUri: uri };
        setProfile(updatedProfile);
        await saveProfileToStorage(updatedProfile);
      }
    } catch (error) {
      console.log("Failed to pick background:", error);
    }
  };

  const takeBackgroundPhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Camera Permission", "Please allow Planova to use your camera.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.9,
      });
      if (!result.canceled && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        const updatedProfile = { ...profile, backgroundUri: uri };
        setProfile(updatedProfile);
        await saveProfileToStorage(updatedProfile);
      }
    } catch (error) {
      console.log("Failed to take background photo:", error);
    }
  };

  const showAvatarOptions = () => {
    Alert.alert("Profile Picture", "How would you like to change your profile picture?", [
      { text: "Choose from Photos", onPress: pickProfilePicture },
      { text: "Take Photo", onPress: takeProfilePicture },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const showBackgroundOptions = () => {
    Alert.alert("Profile Background", "How would you like to change your profile background?", [
      { text: "Choose from Photos", onPress: pickBackground },
      { text: "Take Photo", onPress: takeBackgroundPhoto },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out of Planova?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          if (onLogout) {
            onLogout();
          } else {
            Alert.alert("Logout Ready", "Connect the onLogout prop to your authentication system to complete logout.");
          }
        },
      },
    ]);
  };

  const formattedFocusHours = stats.focusHours < 10 ? stats.focusHours.toFixed(1) : Math.round(stats.focusHours).toString();

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableContentPanningGesture
      enableHandlePanningGesture
      enableDynamicSizing={false}
      backgroundStyle={[styles.sheetBackground, { backgroundColor: colors.sheetBackground }]}
      handleIndicatorStyle={[styles.handle, { backgroundColor: colors.handle }]}
      backdropComponent={(backdropProps) => (
        <BottomSheetBackdrop {...backdropProps} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.3} pressBehavior="none" />
      )}
    >
      <BottomSheetScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <LinearGradient colors={[colors.gradientTop, colors.gradientBottom]} style={styles.gradient}>
          <View style={styles.profileHeader}>
            <Image source={{ uri: profile.backgroundUri }} style={styles.profileBackground} />
            <LinearGradient colors={["rgba(10,16,36,0.05)", colors.gradientTop, colors.gradientTop]} locations={[0, 0.72, 1]} style={styles.profileBackgroundOverlay} />
            <TouchableOpacity activeOpacity={0.8} onPress={showBackgroundOptions} style={[styles.backgroundEditButton, { backgroundColor: colors.iconBackground, borderColor: colors.cardBorder }]}>
              <Ionicons name="image-outline" size={17} color={colors.icon} />
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.9} onPress={showAvatarOptions}>
              <Image source={{ uri: profile.avatarUri }} style={styles.avatar} />
              <View style={[styles.avatarEditButton, { backgroundColor: colors.button }]}>
                <Ionicons name="camera" size={14} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
            <View style={styles.nameRow}>
              <Text style={[styles.name, { color: colors.textPrimary }]}>{profile.name}</Text>
              <TouchableOpacity activeOpacity={0.8} onPress={openEditProfile} style={[styles.nameEditButton, { backgroundColor: colors.iconBackground, borderColor: colors.cardBorder }]}>
                <Ionicons name="pencil" size={15} color={colors.icon} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {profile.school} • {profile.program}
            </Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{stats.tasksCompleted}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Tasks Completed</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{stats.currentStreak}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Current Streak</Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: colors.textPrimary }]}>{formattedFocusHours}</Text>
              <Text style={[styles.statLabel, { color: colors.textMuted }]}>Focus Hours</Text>
            </View>
          </View>

          <Text style={[styles.heading, { color: colors.textPrimary }]}>Settings</Text>

          <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.settingRow}>
              <View style={[styles.settingIcon, { backgroundColor: colors.iconBackground }]}>
                <Ionicons name="color-palette-outline" size={18} color={colors.icon} />
              </View>
            </View>
            <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>System Theme</Text>
            <Text style={[styles.settingDescription, { color: colors.description }]}>
              Select the atmosphere that aligns with your focus cycles.
            </Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setTheme("light")}
                style={[
                  styles.themeOption,
                  {
                    borderColor: theme === "light" ? "#B6A8FF" : colors.optionBorder,
                    backgroundColor: theme === "light" ? (isDark ? "rgba(124,93,255,0.18)" : "rgba(124,93,255,0.10)") : "transparent",
                  },
                ]}
              >
                <Ionicons name="moon-outline" size={17} color={theme === "light" ? colors.textPrimary : colors.optionText} />
                <Text style={[styles.themeOptionText, { color: theme === "light" ? colors.textPrimary : colors.optionText }]}>Stellar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setTheme("dark")}
                style={[
                  styles.themeOption,
                  {
                    borderColor: theme === "dark" ? "#B6A8FF" : colors.optionBorder,
                    backgroundColor: theme === "dark" ? (isDark ? "rgba(124,93,255,0.18)" : "rgba(124,93,255,0.10)") : "transparent",
                  },
                ]}
              >
                <Ionicons name="sunny-outline" size={17} color={theme === "dark" ? colors.textPrimary : colors.optionText} />
                <Text style={[styles.themeOptionText, { color: theme === "dark" ? colors.textPrimary : colors.optionText }]}>Lunar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <MusicSelector />

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleLogout}
            style={[styles.logoutCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
          >
            <View style={[styles.settingIcon, { backgroundColor: colors.iconBackground }]}>
              <Ionicons name="log-out-outline" size={19} color={colors.logoutTitle} />
            </View>
            <View style={styles.logoutTextContainer}>
              <Text style={[styles.logoutTitle, { color: colors.logoutTitle }]}>Log Out</Text>
              <Text style={[styles.logoutDescription, { color: colors.logoutDescription }]}>Sign out of your Planova account.</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.logoutTitle} />
          </TouchableOpacity>

          <View style={styles.bottomSpacer} />
        </LinearGradient>
      </BottomSheetScrollView>

      <Modal visible={showEditProfile} transparent animationType="fade" onRequestClose={() => setShowEditProfile(false)}>
        <KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.55)" }]}>
            <View style={[styles.profileEditModal, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <ScrollView
                style={styles.editProfileScroll}
                contentContainerStyle={styles.editProfileScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
                nestedScrollEnabled
              >
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Edit Profile</Text>
                  <TouchableOpacity activeOpacity={0.8} onPress={() => setShowEditProfile(false)}>
                    <Ionicons name="close" size={23} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.modalSectionTitle, { color: colors.textPrimary }]}>Profile Picture</Text>
                <View style={styles.photoButtonsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={pickProfilePicture}
                    style={[styles.photoButton, { backgroundColor: colors.iconBackground, borderColor: colors.cardBorder }]}
                  >
                    <Ionicons name="images-outline" size={19} color={colors.icon} />
                    <Text style={[styles.photoButtonText, { color: colors.textPrimary }]}>Photos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={takeProfilePicture}
                    style={[styles.photoButton, { backgroundColor: colors.iconBackground, borderColor: colors.cardBorder }]}
                  >
                    <Ionicons name="camera-outline" size={19} color={colors.icon} />
                    <Text style={[styles.photoButtonText, { color: colors.textPrimary }]}>Camera</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.modalSectionTitle, { color: colors.textPrimary }]}>Profile Background</Text>
                <View style={[styles.backgroundPreview, { borderColor: colors.cardBorder }]}>
                  <Image source={{ uri: profile.backgroundUri }} style={styles.backgroundPreviewImage} />
                  <LinearGradient colors={["transparent", "rgba(0,0,0,0.5)"]} style={styles.backgroundPreviewOverlay} />
                  <Ionicons name="image-outline" size={23} color="#FFFFFF" style={styles.backgroundPreviewIcon} />
                </View>
                <View style={styles.photoButtonsRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={pickBackground}
                    style={[styles.photoButton, { backgroundColor: colors.iconBackground, borderColor: colors.cardBorder }]}
                  >
                    <Ionicons name="images-outline" size={19} color={colors.icon} />
                    <Text style={[styles.photoButtonText, { color: colors.textPrimary }]}>Photos</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={takeBackgroundPhoto}
                    style={[styles.photoButton, { backgroundColor: colors.iconBackground, borderColor: colors.cardBorder }]}
                  >
                    <Ionicons name="camera-outline" size={19} color={colors.icon} />
                    <Text style={[styles.photoButtonText, { color: colors.textPrimary }]}>Camera</Text>
                  </TouchableOpacity>
                </View>

                <Text style={[styles.modalLabel, { color: colors.textMuted }]}>Full Name</Text>
                <TextInput
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Your full name"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="next"
                  style={[styles.modalInput, { color: colors.textPrimary, backgroundColor: colors.iconBackground, borderColor: colors.cardBorder }]}
                />

                <Text style={[styles.modalLabel, { color: colors.textMuted }]}>School / Educational Institution</Text>
                <TextInput
                  value={editSchool}
                  onChangeText={setEditSchool}
                  placeholder="e.g. SAIT, Central High School"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="next"
                  style={[styles.modalInput, { color: colors.textPrimary, backgroundColor: colors.iconBackground, borderColor: colors.cardBorder }]}
                />

                <Text style={[styles.modalLabel, { color: colors.textMuted }]}>Grade / Program / Field of Study</Text>
                <TextInput
                  value={editProgram}
                  onChangeText={setEditProgram}
                  placeholder="e.g. Grade 11, Software Development"
                  placeholderTextColor={colors.textMuted}
                  returnKeyType="done"
                  onSubmitEditing={saveProfile}
                  style={[styles.modalInput, { color: colors.textPrimary, backgroundColor: colors.iconBackground, borderColor: colors.cardBorder }]}
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity activeOpacity={0.8} onPress={() => setShowEditProfile(false)} style={styles.cancelButton}>
                    <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity activeOpacity={0.8} onPress={saveProfile} style={[styles.saveProfileButton, { backgroundColor: colors.button }]}>
                    <Text style={styles.saveProfileText}>Save Profile</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.keyboardBottomSpacer} />
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  profileHeader: {
    position: "relative",
    alignItems: "center",
    paddingTop: 10,
    marginBottom: 4,
  },
  profileBackground: {
    position: "absolute",
    top: -10,
    left: -24,
    right: -24,
    height: 185,
    width: undefined,
    opacity: 0.95,
  },
  profileBackgroundOverlay: {
    position: "absolute",
    top: -10,
    left: -24,
    right: -24,
    height: 185,
  },
  backgroundEditButton: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 36,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
    marginBottom: 14,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.8)",
  },
  avatarEditButton: {
    position: "absolute",
    right: 0,
    bottom: 12,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 2,
  },
  name: {
    fontFamily: "BitterBold",
    fontSize: 28,
    textAlign: "center",
  },
  nameEditButton: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 9,
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
  logoutCard: {
    width: "100%",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  logoutTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  logoutTitle: {
    fontFamily: "BitterBold",
    fontSize: 17,
  },
  logoutDescription: {
    fontFamily: "Bitter",
    marginTop: 4,
    fontSize: 13,
  },
  bottomSpacer: {
    height: 30,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  profileEditModal: {
    width: "100%",
    maxWidth: 430,
    height: "90%",
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  editProfileScroll: {
    flex: 1,
  },
  editProfileScrollContent: {
    padding: 20,
    paddingBottom: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  modalTitle: {
    fontFamily: "BitterBold",
    fontSize: 24,
  },
  modalSectionTitle: {
    fontFamily: "BitterBold",
    fontSize: 14,
    marginBottom: 9,
  },
  photoButtonsRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 17,
  },
  photoButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  photoButtonText: {
    fontFamily: "BitterBold",
    fontSize: 12,
  },
  backgroundPreview: {
    width: "100%",
    height: 90,
    borderRadius: 15,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 9,
  },
  backgroundPreviewImage: {
    width: "100%",
    height: "100%",
  },
  backgroundPreviewOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "60%",
  },
  backgroundPreviewIcon: {
    position: "absolute",
    right: 12,
    bottom: 12,
  },
  modalLabel: {
    fontFamily: "BitterBold",
    fontSize: 12,
    marginBottom: 7,
  },
  modalInput: {
    width: "100%",
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: "Bitter",
    fontSize: 14,
    marginBottom: 13,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginTop: 4,
  },
  cancelButton: {
    paddingHorizontal: 13,
    paddingVertical: 11,
  },
  cancelButtonText: {
    fontFamily: "BitterBold",
    fontSize: 13,
  },
  saveProfileButton: {
    borderRadius: 13,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  saveProfileText: {
    fontFamily: "BitterBold",
    fontSize: 13,
    color: "#FFFFFF",
  },
  keyboardBottomSpacer: {
    height: 180,
  },
});