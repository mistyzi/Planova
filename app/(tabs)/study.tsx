import { useTheme } from "@/context/themecontext";
import {
  ActiveFocusSession,
  clearActiveFocusSession,
  getActiveFocusSession,
  pauseActiveFocusSession,
  resumeActiveFocusSession,
  saveActiveFocusSession,
} from "@/storage/focusTimerStorage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FocusSessionScreen() {
  const { isDark } = useTheme();
  const [session, setSession] = useState<ActiveFocusSession | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [changingState, setChangingState] = useState(false);

  const colors = isDark
    ? {
        title: "#e9d5ff",
        text: "#ffffff",
        secondary: "#c4b5fd",
        card: "rgba(14,25,56,0.70)",
        border: "rgba(196,181,253,0.30)",
        iconBackground: "rgba(196,181,253,0.13)",
        icon: "#c4b5fd",
        button: "#8064B5",
        buttonText: "#ffffff",
        danger: "#f87171",
        backgroundTop: "#080D24",
        backgroundMiddle: "#11183A",
        backgroundBottom: "#24184A",
      }
    : {
        title: "#4F427D",
        text: "#30284C",
        secondary: "#6D5A9F",
        card: "rgba(255,255,255,0.72)",
        border: "rgba(79,66,125,0.25)",
        iconBackground: "rgba(79,66,125,0.10)",
        icon: "#4F427D",
        button: "#8069B3",
        buttonText: "#ffffff",
        danger: "#dc2626",
        backgroundTop: "#DCD5F0",
        backgroundMiddle: "#EEE9F8",
        backgroundBottom: "#F8F5FC",
      };

  const showCompletionAlert = useCallback(() => {
    Alert.alert("Focus Complete", "Your cosmic focus session is complete.", [
      {
        text: "OK",
        onPress: () => router.replace("/study"),
      },
    ]);
  }, []);

  const loadSession = useCallback(async () => {
    try {
      const stored = await getActiveFocusSession();

      if (!stored) {
        setSession(null);
        setRemaining(0);
        setLoading(false);
        router.replace("/study");
        return;
      }

      if (stored.isCompleted) {
        await clearActiveFocusSession();
        setSession(null);
        setRemaining(0);
        setLoading(false);
        showCompletionAlert();
        return;
      }

      if (!stored.isRunning && stored.remainingSeconds > 0) {
        setSession(stored);
        setRemaining(stored.remainingSeconds);
        setLoading(false);
        return;
      }

      if (stored.isRunning) {
        const seconds = Math.max(0, Math.ceil((stored.endsAt - Date.now()) / 1000));

        if (seconds <= 0) {
          const completed: ActiveFocusSession = {
            ...stored,
            remainingSeconds: 0,
            isRunning: false,
            isCompleted: true,
          };
          await saveActiveFocusSession(completed);
          setSession(null);
          setRemaining(0);
          setLoading(false);
          await clearActiveFocusSession();
          showCompletionAlert();
          return;
        }

        const updated: ActiveFocusSession = {
          ...stored,
          remainingSeconds: seconds,
        };
        await saveActiveFocusSession(updated);
        setSession(updated);
        setRemaining(seconds);
        setLoading(false);
        return;
      }

      await clearActiveFocusSession();
      setSession(null);
      setRemaining(0);
      setLoading(false);
      router.replace("/study");
    } catch (error) {
      console.log("Failed to load focus session:", error);
      setLoading(false);
    }
  }, [showCompletionAlert]);

  useEffect(() => {
    loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!session || !session.isRunning) {
      return;
    }

    const interval = setInterval(async () => {
      const current = await getActiveFocusSession();

      if (!current) {
        setSession(null);
        setRemaining(0);
        clearInterval(interval);
        router.replace("/study");
        return;
      }

      if (!current.isRunning) {
        if (current.remainingSeconds > 0) {
          setSession(current);
          setRemaining(current.remainingSeconds);
        }
        return;
      }

      const seconds = Math.max(0, Math.ceil((current.endsAt - Date.now()) / 1000));

      if (seconds <= 0) {
        const completed: ActiveFocusSession = {
          ...current,
          remainingSeconds: 0,
          isRunning: false,
          isCompleted: true,
        };
        await saveActiveFocusSession(completed);
        clearInterval(interval);
        await clearActiveFocusSession();
        setSession(null);
        setRemaining(0);
        showCompletionAlert();
        return;
      }

      const updated: ActiveFocusSession = {
        ...current,
        remainingSeconds: seconds,
      };
      await saveActiveFocusSession(updated);
      setSession(updated);
      setRemaining(seconds);
    }, 250);

    return () => {
      clearInterval(interval);
    };
  }, [session?.id, session?.isRunning, showCompletionAlert]);

  const handlePause = async () => {
    if (!session || !session.isRunning || changingState) {
      return;
    }

    setChangingState(true);

    try {
      const paused = await pauseActiveFocusSession();

      if (!paused) {
        setSession(null);
        setRemaining(0);
        router.replace("/study");
        return;
      }

      if (paused.isCompleted) {
        await clearActiveFocusSession();
        setSession(null);
        setRemaining(0);
        showCompletionAlert();
        return;
      }

      setSession(paused);
      setRemaining(paused.remainingSeconds);
    } finally {
      setChangingState(false);
    }
  };

  const handleResume = async () => {
    if (!session || session.isRunning || changingState) {
      return;
    }

    setChangingState(true);

    try {
      const resumed = await resumeActiveFocusSession();

      if (!resumed) {
        setSession(null);
        setRemaining(0);
        router.replace("/study");
        return;
      }

      if (resumed.isCompleted) {
        await clearActiveFocusSession();
        setSession(null);
        setRemaining(0);
        showCompletionAlert();
        return;
      }

      setSession(resumed);
      setRemaining(resumed.remainingSeconds);
    } finally {
      setChangingState(false);
    }
  };

  const handleCancel = () => {
    if (changingState) {
      return;
    }

    Alert.alert("Cancel Focus", "Are you sure you want to cancel this focus session?", [
      {
        text: "Keep Focus",
        style: "cancel",
      },
      {
        text: "Cancel Timer",
        style: "destructive",
        onPress: async () => {
          setChangingState(true);
          try {
            await clearActiveFocusSession();
            setSession(null);
            setRemaining(0);
            router.replace("/study");
          } finally {
            setChangingState(false);
          }
        },
      },
    ]);
  };

  const handleBack = () => {
    router.replace("/study");
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient colors={[colors.backgroundTop, colors.backgroundMiddle, colors.backgroundBottom]} locations={[0, 0.55, 1]} style={StyleSheet.absoluteFill} />
        <ActivityIndicator size="large" color={colors.title} />
        <Text style={[styles.loadingText, { color: colors.secondary }]}>Restoring your cosmic focus...</Text>
      </View>
    );
  }

  if (!session) {
    return null;
  }

  const isPaused = !session.isRunning;

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.backgroundTop, colors.backgroundMiddle, colors.backgroundBottom]} locations={[0, 0.52, 1]} style={StyleSheet.absoluteFill} />

      {Array.from({ length: 75 }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.star,
            {
              left: `${(index * 37) % 100}%`,
              top: `${(index * 61) % 100}%`,
              opacity: 0.25 + ((index * 17) % 60) / 100,
              transform: [{ scale: 0.5 + ((index * 13) % 10) / 10 }],
            },
          ]}
        />
      ))}

      <View pointerEvents="none" style={[styles.cosmicGlow, { backgroundColor: isDark ? "rgba(196,181,253,0.08)" : "rgba(128,105,179,0.07)" }]} />

      <View style={styles.content}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleBack}
          style={[styles.backButton, { backgroundColor: isDark ? "rgba(14,25,56,0.45)" : "rgba(255,255,255,0.45)", borderColor: colors.border }]}
        >
          <Ionicons name="chevron-back" size={23} color={colors.title} />
        </TouchableOpacity>

        <View style={[styles.icon, { backgroundColor: colors.iconBackground, borderColor: colors.border }]}>
          <Ionicons name={isPaused ? "pause-outline" : "planet-outline"} size={32} color={colors.icon} />
        </View>

        <Text style={[styles.label, { color: colors.secondary }]}>{isPaused ? "FOCUS PAUSED" : "COSMIC FOCUS"}</Text>

        <Text style={[styles.title, { color: colors.title }]}>{session.name}</Text>

        <View style={[styles.timerCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.timer, { color: colors.text }]}>{formatTime(remaining)}</Text>
          <Text style={[styles.remainingLabel, { color: colors.secondary }]}>TIME REMAINING</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          disabled={changingState}
          onPress={isPaused ? handleResume : handlePause}
          style={[styles.mainButton, { backgroundColor: colors.button, opacity: changingState ? 0.6 : 1 }]}
        >
          <Ionicons name={isPaused ? "play" : "pause"} size={20} color={colors.buttonText} />
          <Text style={[styles.mainButtonText, { color: colors.buttonText }]}>{isPaused ? "Resume Focus" : "Pause Focus"}</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.7} disabled={changingState} onPress={handleCancel} style={styles.cancelButton}>
          <Ionicons name="close-circle-outline" size={17} color={colors.danger} />
          <Text style={[styles.cancelText, { color: colors.danger }]}>Cancel Focus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    fontFamily: "Bitter",
    fontSize: 12,
    marginTop: 12,
  },
  star: {
    position: "absolute",
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: "#FFFFFF",
  },
  cosmicGlow: {
    position: "absolute",
    width: 420,
    height: 420,
    borderRadius: 210,
    alignSelf: "center",
    top: "28%",
    opacity: 0.9,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    zIndex: 2,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 23,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  label: {
    fontFamily: "BitterBold",
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: {
    fontFamily: "BitterBold",
    fontSize: 27,
    textAlign: "center",
    marginBottom: 25,
  },
  timerCard: {
    width: "100%",
    borderRadius: 28,
    borderWidth: 1,
    paddingVertical: 35,
    alignItems: "center",
    marginBottom: 24,
  },
  timer: {
    fontFamily: "BitterBold",
    fontSize: 47,
    letterSpacing: 1,
  },
  remainingLabel: {
    fontFamily: "Bitter",
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 8,
  },
  mainButton: {
    minWidth: 210,
    height: 52,
    borderRadius: 26,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 25,
    gap: 9,
  },
  mainButtonText: {
    fontFamily: "BitterBold",
    fontSize: 13,
  },
  cancelButton: {
    height: 45,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 10,
    paddingHorizontal: 15,
  },
  cancelText: {
    fontFamily: "BitterBold",
    fontSize: 11,
  },
});