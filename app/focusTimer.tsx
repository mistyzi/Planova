import StarryBackground from "@/components/starrybackground";
import { useTheme } from "@/context/themecontext";
import {
  ActiveFocusSession,
  clearActiveFocusSession,
  getActiveFocusSession,
  saveActiveFocusSession,
} from "@/storage/focusTimerStorage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const CUSTOM_FOCUSES_KEY = "@planova_custom_focuses";

export type FocusOption = {
  id: string;
  name: string;
  durationSeconds: number;
};

async function getCustomFocuses(): Promise<FocusOption[]> {
  try {
    const stored = await AsyncStorage.getItem(CUSTOM_FOCUSES_KEY);

    if (!stored) {
      return [];
    }

    return JSON.parse(stored) as FocusOption[];
  } catch (error) {
    console.log("Failed to load custom focuses:", error);
    return [];
  }
}

async function saveCustomFocus(focus: FocusOption): Promise<void> {
  try {
    const existing = await getCustomFocuses();

    const updated = [...existing, focus];

    await AsyncStorage.setItem(
      CUSTOM_FOCUSES_KEY,
      JSON.stringify(updated),
    );
  } catch (error) {
    console.log("Failed to save custom focus:", error);
  }
}

async function deleteSavedCustomFocus(focusId: string): Promise<void> {
  try {
    const existing = await getCustomFocuses();

    const updated = existing.filter((focus) => focus.id !== focusId);

    await AsyncStorage.setItem(
      CUSTOM_FOCUSES_KEY,
      JSON.stringify(updated),
    );
  } catch (error) {
    console.log("Failed to delete custom focus:", error);
  }
}

import AsyncStorage from "@react-native-async-storage/async-storage";

export default function FocusTimerScreen() {
  const { isDark } = useTheme();

  const scrollRef = useRef<ScrollView | null>(null);
  const expeditionY = useRef(0);

  const [selectedFocus, setSelectedFocus] =
    useState<FocusOption | null>(null);

  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customMinutes, setCustomMinutes] = useState("");
  const [customFocuses, setCustomFocuses] = useState<FocusOption[]>([]);
  const [hasActiveTimer, setHasActiveTimer] = useState(false);

  const backgroundColors: [string, string] = isDark
    ? ["#0e1938", "#6b41bf"]
    : ["#EEF3FF", "#DCCFF5"];

  const colors = isDark
    ? {
        title: "#e9d5ff",
        text: "#ffffff",
        secondaryText: "#c4b5fd",
        card: "rgba(14,25,56,0.70)",
        cardBorder: "rgba(196,181,253,0.30)",
        selectedCard: "rgba(192,132,252,0.20)",
        selectedBorder: "#c084fc",
        iconBackground: "rgba(196,181,253,0.13)",
        icon: "#c4b5fd",
        divider: "rgba(196,181,253,0.40)",
        button: "#8064B5",
        buttonText: "#ffffff",
        input: "rgba(14,25,56,0.80)",
        danger: "#f87171",
      }
    : {
        title: "#4F427D",
        text: "#30284C",
        secondaryText: "#6D5A9F",
        card: "rgba(255,255,255,0.72)",
        cardBorder: "rgba(79,66,125,0.25)",
        selectedCard: "rgba(185,169,223,0.30)",
        selectedBorder: "#8069B3",
        iconBackground: "rgba(79,66,125,0.10)",
        icon: "#4F427D",
        divider: "rgba(79,66,125,0.40)",
        button: "#8069B3",
        buttonText: "#ffffff",
        input: "rgba(255,255,255,0.90)",
        danger: "#dc2626",
      };

  const presetPlanets: FocusOption[] = [
    {
      id: "mercury",
      name: "Mercury",
      durationSeconds: 5 * 60,
    },
    {
      id: "venus",
      name: "Venus",
      durationSeconds: 15 * 60,
    },
    {
      id: "earth",
      name: "Earth",
      durationSeconds: 30 * 60,
    },
    {
      id: "mars",
      name: "Mars",
      durationSeconds: 45 * 60,
    },
    {
      id: "jupiter",
      name: "Jupiter",
      durationSeconds: 60 * 60,
    },
    {
      id: "saturn",
      name: "Saturn",
      durationSeconds: 2 * 60 * 60,
    },
  ];

  useEffect(() => {
    const loadCustomFocuses = async () => {
      const saved = await getCustomFocuses();
      setCustomFocuses(saved);
    };

    loadCustomFocuses();
  }, []);

  





  useEffect(() => {
    const checkActiveTimer = async () => {
      const session = await getActiveFocusSession();

      if (!session) {
        setHasActiveTimer(false);
        return;
      }

      if (session.isCompleted) {
        await clearActiveFocusSession();
        setHasActiveTimer(false);
        return;
      }

      if (!session.isRunning && session.remainingSeconds > 0) {
        setHasActiveTimer(true);
        return;
      }

      if (session.isRunning) {
        const remaining = Math.ceil(
          (session.endsAt - Date.now()) / 1000,
        );

        if (remaining > 0) {
          setHasActiveTimer(true);
          return;
        }

        await clearActiveFocusSession();
        setHasActiveTimer(false);
        return;
      }

      await clearActiveFocusSession();
      setHasActiveTimer(false);
    };

    checkActiveTimer();

    const interval = setInterval(checkActiveTimer, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} ${hours === 1 ? "hour" : "hours"}`;
    }

    return `${hours}h ${remainingMinutes}m`;
  };

  const selectFocus = (focus: FocusOption) => {
    setSelectedFocus(focus);

    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: expeditionY.current,
        animated: true,
      });
    }, 100);
  };

  const openActiveTimer = async () => {
    const session = await getActiveFocusSession();

    if (!session) {
      setHasActiveTimer(false);
      return;
    }

    if (session.isCompleted) {
      await clearActiveFocusSession();
      setHasActiveTimer(false);
      return;
    }

    if (!session.isRunning && session.remainingSeconds > 0) {
      router.push("/focusSession");
      return;
    }

    if (session.isRunning) {
      const remaining = Math.ceil(
        (session.endsAt - Date.now()) / 1000,
      );

      if (remaining > 0) {
        router.push("/focusSession");
        return;
      }
    }

    await clearActiveFocusSession();
    setHasActiveTimer(false);
  };

  const startExpedition = async () => {
    if (!selectedFocus) {
      return;
    }

    const existing = await getActiveFocusSession();

    





    if (existing) {
      if (existing.isCompleted) {
        await clearActiveFocusSession();
      } else if (
        !existing.isRunning &&
        existing.remainingSeconds > 0
      ) {
        router.push("/focusSession");
        return;
      } else if (existing.isRunning) {
        const remaining = Math.ceil(
          (existing.endsAt - Date.now()) / 1000,
        );

        if (remaining > 0) {
          router.push("/focusSession");
          return;
        }

        await clearActiveFocusSession();
      }
    }

    const now = Date.now();

    const session: ActiveFocusSession = {
      id: `${selectedFocus.id}-${now}`,
      name: selectedFocus.name,
      durationSeconds: selectedFocus.durationSeconds,
      startedAt: now,
      endsAt:
        now + selectedFocus.durationSeconds * 1000,
      remainingSeconds: selectedFocus.durationSeconds,
      isRunning: true,
      isCompleted: false,
    };

    



    await saveActiveFocusSession(session);

    setHasActiveTimer(true);

    router.push("/focusSession");
  };

  const createCustomFocus = async () => {
    const trimmedName = customName.trim();
    const minutes = Number(customMinutes);

    if (!trimmedName) {
      Alert.alert(
        "Missing Focus Name",
        "Please give your cosmic focus a name.",
      );
      return;
    }

    if (
      !customMinutes.trim() ||
      !Number.isFinite(minutes) ||
      minutes <= 0
    ) {
      Alert.alert(
        "Invalid Focus Time",
        "Please enter a number of minutes greater than 0.",
      );
      return;
    }

    if (minutes > 1440) {
      Alert.alert(
        "Focus Time Too Long",
        "Please choose a focus time of 24 hours or less.",
      );
      return;
    }

    const customFocus: FocusOption = {
      id: `custom-${Date.now()}`,
      name: trimmedName,
      durationSeconds: minutes * 60,
    };

    await saveCustomFocus(customFocus);

    setCustomFocuses((current) => [
      ...current,
      customFocus,
    ]);

    setCustomModalVisible(false);
    setCustomName("");
    setCustomMinutes("");

    selectFocus(customFocus);
  };

  const deleteCustomFocus = async (focusId: string) => {
    Alert.alert(
      "Delete Cosmic Focus",
      "Do you want to remove this saved focus?",
      [
        {
          text: "Keep",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteSavedCustomFocus(focusId);

            setCustomFocuses((current) =>
              current.filter((focus) => focus.id !== focusId),
            );

            if (selectedFocus?.id === focusId) {
              setSelectedFocus(null);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={backgroundColors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      <StarryBackground />

      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            router.replace("/(tabs)/study")
          }
          style={styles.backButton}
        >
          <Ionicons
            name="chevron-back"
            size={23}
            color={colors.title}
          />
        </TouchableOpacity>

        {hasActiveTimer && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={openActiveTimer}
            style={[
              styles.activeTimerButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="timer-outline"
              size={14}
              color={colors.title}
            />

            <Text
              style={[
                styles.activeTimerText,
                { color: colors.title },
              ]}
            >
              Ongoing Focus
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: colors.title },
            ]}
          >
            Cosmic Focus
          </Text>

          <View
            style={[
              styles.divider,
              { backgroundColor: colors.divider },
            ]}
          />

          <Text
            style={[
              styles.subtitle,
              { color: colors.secondaryText },
            ]}
          >
            Choose your orbit and focus on the task
            ahead.
          </Text>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.title },
            ]}
          >
            Choose Cosmic Focus
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              { color: colors.secondaryText },
            ]}
          >
            Select a planet to begin your focus session.
          </Text>

          <View style={styles.grid}>
            {presetPlanets.map((planet) => {
              const selected =
                selectedFocus?.id === planet.id;

              return (
                <TouchableOpacity
                  key={planet.id}
                  activeOpacity={0.8}
                  onPress={() => selectFocus(planet)}
                  style={[
                    styles.planetCard,
                    {
                      backgroundColor: selected
                        ? colors.selectedCard
                        : colors.card,
                      borderColor: selected
                        ? colors.selectedBorder
                        : colors.cardBorder,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.planetIcon,
                      {
                        backgroundColor:
                          colors.iconBackground,
                      },
                    ]}
                  >
                    <Ionicons
                      name="planet-outline"
                      size={22}
                      color={colors.icon}
                    />
                  </View>

                  <Text
                    style={[
                      styles.planetName,
                      { color: colors.text },
                    ]}
                  >
                    {planet.name}
                  </Text>

                  <Text
                    style={[
                      styles.planetTime,
                      {
                        color: colors.secondaryText,
                      },
                    ]}
                  >
                    {formatDuration(
                      planet.durationSeconds,
                    )}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.title },
            ]}
          >
            My Cosmic Focuses
          </Text>

          <Text
            style={[
              styles.sectionSubtitle,
              { color: colors.secondaryText },
            ]}
          >
            Your saved custom focus sessions.
          </Text>

          <View style={styles.customList}>
            {customFocuses.map((focus) => {
              const selected =
                selectedFocus?.id === focus.id;

              return (
                <View
                  key={focus.id}
                  style={[
                    styles.customCard,
                    {
                      backgroundColor: selected
                        ? colors.selectedCard
                        : colors.card,
                      borderColor: selected
                        ? colors.selectedBorder
                        : colors.cardBorder,
                    },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => selectFocus(focus)}
                    style={styles.customMain}
                  >
                    <View
                      style={[
                        styles.customIcon,
                        {
                          backgroundColor:
                            colors.iconBackground,
                        },
                      ]}
                    >
                      <Ionicons
                        name="sparkles-outline"
                        size={22}
                        color={colors.icon}
                      />
                    </View>

                    <View style={styles.customText}>
                      <Text
                        style={[
                          styles.customName,
                          { color: colors.text },
                        ]}
                      >
                        {focus.name}
                      </Text>

                      <Text
                        style={[
                          styles.customTime,
                          {
                            color:
                              colors.secondaryText,
                          },
                        ]}
                      >
                        {formatDuration(
                          focus.durationSeconds,
                        )}
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() =>
                      deleteCustomFocus(focus.id)
                    }
                    style={styles.deleteButton}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={colors.danger}
                    />
                  </TouchableOpacity>
                </View>
              );
            })}

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setCustomModalVisible(true)
              }
              style={[
                styles.customCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.customIcon,
                  {
                    backgroundColor:
                      colors.iconBackground,
                  },
                ]}
              >
                <Ionicons
                  name="add"
                  size={23}
                  color={colors.icon}
                />
              </View>

              <View style={styles.customText}>
                <Text
                  style={[
                    styles.customName,
                    { color: colors.text },
                  ]}
                >
                  Create Custom Focus
                </Text>

                <Text
                  style={[
                    styles.customTime,
                    {
                      color: colors.secondaryText,
                    },
                  ]}
                >
                  Choose your own name and focus time
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {selectedFocus && (
          <View
            onLayout={(event) => {
              expeditionY.current =
                event.nativeEvent.layout.y;
            }}
            style={styles.expedition}
          >
            <View
              style={[
                styles.divider,
                {
                  backgroundColor: colors.divider,
                },
              ]}
            />

            <Text
              style={[
                styles.sessionLabel,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              CURRENT EXPEDITION
            </Text>

            <View
              style={[
                styles.selectedCard,
                {
                  backgroundColor:
                    colors.selectedCard,
                  borderColor:
                    colors.selectedBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.selectedIcon,
                  {
                    backgroundColor:
                      colors.iconBackground,
                  },
                ]}
              >
                <Ionicons
                  name="planet-outline"
                  size={28}
                  color={colors.icon}
                />
              </View>

              <Text
                style={[
                  styles.selectedName,
                  { color: colors.title },
                ]}
              >
                {selectedFocus.name}
              </Text>

              <Text
                style={[
                  styles.selectedDuration,
                  {
                    color: colors.secondaryText,
                  },
                ]}
              >
                {formatDuration(
                  selectedFocus.durationSeconds,
                )}
              </Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={startExpedition}
                style={[
                  styles.startButton,
                  {
                    backgroundColor: colors.button,
                  },
                ]}
              >
                <Ionicons
                  name="play"
                  size={17}
                  color={colors.buttonText}
                />

                <Text
                  style={[
                    styles.startText,
                    {
                      color: colors.buttonText,
                    },
                  ]}
                >
                  Start Expedition
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View
          style={[
            styles.finalDivider,
            {
              backgroundColor: colors.divider,
            },
          ]}
        />
      </ScrollView>

      <Modal
        visible={customModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setCustomModalVisible(false)
        }
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View
              style={[
                styles.modalIcon,
                {
                  backgroundColor:
                    colors.iconBackground,
                },
              ]}
            >
              <Ionicons
                name="sparkles-outline"
                size={25}
                color={colors.icon}
              />
            </View>

            <Text
              style={[
                styles.modalTitle,
                { color: colors.title },
              ]}
            >
              Custom Cosmic Focus
            </Text>

            <Text
              style={[
                styles.modalDescription,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              Give your focus a name and choose how
              long you want to focus.
            </Text>

            <TextInput
              value={customName}
              onChangeText={setCustomName}
              placeholder="Focus name"
              placeholderTextColor={
                colors.secondaryText
              }
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.cardBorder,
                  color: colors.text,
                },
              ]}
            />

            <TextInput
              value={customMinutes}
              onChangeText={setCustomMinutes}
              keyboardType="number-pad"
              placeholder="Minutes"
              placeholderTextColor={
                colors.secondaryText
              }
              style={[
                styles.modalInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.cardBorder,
                  color: colors.text,
                },
              ]}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setCustomModalVisible(false);
                  setCustomName("");
                  setCustomMinutes("");
                }}
                style={[
                  styles.cancelModalButton,
                  {
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cancelText,
                    {
                      color: colors.secondaryText,
                    },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={createCustomFocus}
                style={[
                  styles.createButton,
                  {
                    backgroundColor: colors.button,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.createText,
                    {
                      color: colors.buttonText,
                    },
                  ]}
                >
                  Save Focus
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },

  content: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 60,
  },

  backButton: {
    position: "absolute",
    top: 16,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  activeTimerButton: {
    position: "absolute",
    top: 17,
    right: 18,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 10,
  },

  activeTimerText: {
    fontFamily: "BitterBold",
    fontSize: 9.5,
  },

  header: {
    alignItems: "center",
    marginBottom: 34,
  },

  title: {
    fontFamily: "BitterBold",
    fontSize: 29,
    marginBottom: 14,
    textAlign: "center",
  },

  divider: {
    width: "60%",
    height: 1,
    marginBottom: 16,
  },

  subtitle: {
    fontFamily: "Bitter",
    fontSize: 12.5,
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 310,
  },

  section: {
    width: "100%",
    marginBottom: 34,
  },

  sectionTitle: {
    fontFamily: "BitterBold",
    fontSize: 19,
    textAlign: "center",
    marginBottom: 7,
  },

  sectionSubtitle: {
    fontFamily: "Bitter",
    fontSize: 11,
    lineHeight: 17,
    textAlign: "center",
    marginBottom: 18,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  planetCard: {
    width: "31.5%",
    minHeight: 125,
    borderRadius: 19,
    borderWidth: 1,
    padding: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },

  planetIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 9,
  },

  planetName: {
    fontFamily: "BitterBold",
    fontSize: 12.5,
    marginBottom: 4,
  },

  planetTime: {
    fontFamily: "Bitter",
    fontSize: 10.5,
  },

  customList: {
    gap: 11,
  },

  customCard: {
    minHeight: 76,
    borderRadius: 19,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
  },

  customMain: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  customIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },

  customText: {
    flex: 1,
  },

  customName: {
    fontFamily: "BitterBold",
    fontSize: 14,
    marginBottom: 4,
  },

  customTime: {
    fontFamily: "Bitter",
    fontSize: 10.5,
  },

  deleteButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },

  expedition: {
    width: "100%",
    alignItems: "center",
    marginTop: 5,
  },

  sessionLabel: {
    fontFamily: "BitterBold",
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  selectedCard: {
    width: "100%",
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
  },

  selectedIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  selectedName: {
    fontFamily: "BitterBold",
    fontSize: 21,
    marginBottom: 5,
  },

  selectedDuration: {
    fontFamily: "Bitter",
    fontSize: 12,
    marginBottom: 19,
  },

  startButton: {
    minWidth: 190,
    height: 49,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
    gap: 8,
  },

  startText: {
    fontFamily: "BitterBold",
    fontSize: 13,
  },

  finalDivider: {
    width: "60%",
    height: 1,
    alignSelf: "center",
    marginTop: 32,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  modalCard: {
    width: "100%",
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    alignItems: "center",
  },

  modalIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  modalTitle: {
    fontFamily: "BitterBold",
    fontSize: 20,
    marginBottom: 7,
    textAlign: "center",
  },

  modalDescription: {
    fontFamily: "Bitter",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginBottom: 18,
  },

  modalInput: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 15,
    fontFamily: "Bitter",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 12,
  },

  modalButtons: {
    width: "100%",
    flexDirection: "row",
    gap: 10,
    marginTop: 5,
  },

  cancelModalButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelText: {
    fontFamily: "BitterBold",
    fontSize: 11,
  },

  createButton: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  createText: {
    fontFamily: "BitterBold",
    fontSize: 11,
  },
});