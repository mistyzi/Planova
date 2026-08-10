import { useTheme } from "@/context/themecontext";
import {
    ActiveFocusSession,
    clearActiveFocusSession,
    getActiveFocusSession,
    pauseActiveFocusSession,
    resumeActiveFocusSession,
} from "@/storage/focusTimerStorage";
import { Ionicons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { PanResponder, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function FocusTimerOverlay() {
  const { isDark } = useTheme();
  const pathname = usePathname();
  const [session, setSession] = useState<ActiveFocusSession | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [changingState, setChangingState] = useState(false);

  const position = useRef({
    x: 18,
    y: 125,
  });
  const [displayPosition, setDisplayPosition] = useState({
    x: 18,
    y: 125,
  });
  const dragStart = useRef({
    x: 0,
    y: 0,
  });

  const colors = isDark
    ? {
        background: "#151d3d",
        border: "rgba(196,181,253,0.38)",
        text: "#ffffff",
        secondary: "#c4b5fd",
        danger: "#f87171",
      }
    : {
        background: "#ffffff",
        border: "rgba(79,66,125,0.28)",
        text: "#30284C",
        secondary: "#6D5A9F",
        danger: "#dc2626",
      };

  const loadSession = useCallback(async () => {
    try {
      const stored = await getActiveFocusSession();
      if (!stored) {
        setSession(null);
        setRemaining(0);
        return;
      }
      if (stored.isCompleted) {
        await clearActiveFocusSession();
        setSession(null);
        setRemaining(0);
        return;
      }
      if (!stored.isRunning && stored.remainingSeconds > 0) {
        setSession(stored);
        setRemaining(stored.remainingSeconds);
        return;
      }
      if (stored.isRunning) {
        const seconds = Math.max(0, Math.ceil((stored.endsAt - Date.now()) / 1000));
        if (seconds <= 0) {
          await clearActiveFocusSession();
          setSession(null);
          setRemaining(0);
          return;
        }
        setSession(stored);
        setRemaining(seconds);
        return;
      }
      await clearActiveFocusSession();
      setSession(null);
      setRemaining(0);
    } catch (error) {
      console.log("Failed to load overlay session:", error);
    }
  }, []);

  useEffect(() => {
    loadSession();
    const interval = setInterval(() => {
      loadSession();
    }, 500);
    return () => {
      clearInterval(interval);
    };
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
        await clearActiveFocusSession();
        setSession(null);
        setRemaining(0);
        return;
      }
      setSession(current);
      setRemaining(seconds);
    }, 250);
    return () => {
      clearInterval(interval);
    };
  }, [session?.id, session?.isRunning]);

  const cancelTimer = async () => {
    if (changingState) return;
    setChangingState(true);
    try {
      await clearActiveFocusSession();
      setSession(null);
      setRemaining(0);
    } finally {
      setChangingState(false);
    }
  };

  const pauseTimer = async () => {
    if (changingState || !session || !session.isRunning) return;
    setChangingState(true);
    try {
      const paused = await pauseActiveFocusSession();
      if (!paused) {
        setSession(null);
        setRemaining(0);
        return;
      }
      setSession(paused);
      setRemaining(paused.remainingSeconds);
    } finally {
      setChangingState(false);
    }
  };

  const resumeTimer = async () => {
    if (changingState || !session || session.isRunning) return;
    setChangingState(true);
    try {
      const resumed = await resumeActiveFocusSession();
      if (!resumed) {
        setSession(null);
        setRemaining(0);
        return;
      }
      setSession(resumed);
      setRemaining(resumed.remainingSeconds);
    } finally {
      setChangingState(false);
    }
  };

  const openSession = () => {
    if (!session || changingState) return;
    router.push("/focusSession");
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5,
      onPanResponderGrant: () => {
        dragStart.current = {
          x: position.current.x,
          y: position.current.y,
        };
      },
      onPanResponderMove: (_, gesture) => {
        const newX = dragStart.current.x + gesture.dx;
        const newY = dragStart.current.y + gesture.dy;
        const clampedX = Math.max(5, Math.min(newX, 330));
        const clampedY = Math.max(55, Math.min(newY, 760));
        position.current = {
          x: clampedX,
          y: clampedY,
        };
        setDisplayPosition({
          x: clampedX,
          y: clampedY,
        });
      },
    })
  ).current;

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    }
    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const isCountdownPage = pathname === "/focusSession";
  if (!session || remaining <= 0 || isCountdownPage) {
    return null;
  }

  const isPaused = !session.isRunning;

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        styles.floating,
        {
          left: displayPosition.x,
          top: displayPosition.y,
          backgroundColor: colors.background,
          borderColor: colors.border,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={openSession}
        disabled={changingState}
        style={styles.timerTouchable}
      >
        <View
          style={[
            styles.icon,
            {
              backgroundColor: colors.secondary,
            },
          ]}
        >
          <Ionicons
            name={isPaused ? "pause" : "timer-outline"}
            size={17}
            color={isDark ? "#151d3d" : "#ffffff"}
          />
        </View>
        <View style={styles.textContainer}>
          <Text
            numberOfLines={1}
            style={[
              styles.name,
              {
                color: colors.text,
              },
            ]}
          >
            {session.name}
          </Text>
          <Text
            style={[
              styles.time,
              {
                color: colors.secondary,
              },
            ]}
          >
            {isPaused ? `${formatTime(remaining)} PAUSED` : formatTime(remaining)}
          </Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={isPaused ? resumeTimer : pauseTimer}
        disabled={changingState}
        style={styles.controlButton}
        hitSlop={{
          top: 6,
          bottom: 6,
          left: 6,
          right: 6,
        }}
      >
        <Ionicons name={isPaused ? "play" : "pause"} size={15} color={colors.secondary} />
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={cancelTimer}
        disabled={changingState}
        style={styles.cancelButton}
        hitSlop={{
          top: 8,
          bottom: 8,
          left: 8,
          right: 8,
        }}
      >
        <Ionicons name="close" size={15} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  floating: {
    position: "absolute",
    width: 205,
    minHeight: 55,
    borderRadius: 18,
    borderWidth: 1,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 9999,
  },
  timerTouchable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 9,
    paddingRight: 3,
    paddingVertical: 8,
    minWidth: 0,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontFamily: "BitterBold",
    fontSize: 8.5,
    marginBottom: 3,
  },
  time: {
    fontFamily: "BitterBold",
    fontSize: 11.5,
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 2,
  },
  cancelButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 5,
  },
});