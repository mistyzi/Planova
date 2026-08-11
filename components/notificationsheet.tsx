import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Modal, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "@/context/themecontext";

const TASKS_STORAGE_KEY = "@planova_tasks";
const STREAK_STORAGE_KEY = "@planova_streak";
const NOTIFICATIONS_STORAGE_KEY = "@planova_notifications";
const DISMISSED_NOTIFICATIONS_STORAGE_KEY = "@planova_dismissed_notifications";
const TASK_SNAPSHOT_STORAGE_KEY = "@planova_task_snapshot";
const LAST_ACTIVE_STORAGE_KEY = "@planova_last_active";
const RETURN_REMINDER_STORAGE_KEY = "@planova_return_reminder";

type Task = {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  priority: string;
  completed: boolean;
};

type StreakData = {
  currentStreak: number;
  lastCheckIn: string | null;
};

type NotificationType = "completed" | "upcoming" | "missed" | "streak" | "return";

type PlanovaNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: number;
  taskId?: string;
  read?: boolean;
};

type TaskSnapshot = Record<string, { completed: boolean }>;

const pad = (value: number) => String(value).padStart(2, "0");

const formatDateKey = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const parseDateTime = (task: Task) => {
  const parts = task.date.split("-");
  if (parts.length !== 3) {
    return new Date();
  }
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  const [hoursString, minutesString] = (task.time || "23:59").split(":");
  const hours = Number(hoursString);
  const minutes = Number(minutesString);
  return new Date(
    year,
    month - 1,
    day,
    Number.isFinite(hours) ? hours : 23,
    Number.isFinite(minutes) ? minutes : 59,
    0,
    0
  );
};

const getDaysBetween = (earlierDate: string, laterDate: string) => {
  const earlier = new Date(`${earlierDate}T00:00:00`);
  const later = new Date(`${laterDate}T00:00:00`);
  return Math.round((later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24));
};

const createNotificationId = (type: NotificationType, taskId?: string, extra?: string) => {
  return `${type}-${taskId || "general"}-${extra || ""}`;
};

export default function NotificationPopup() {
  const { isDark } = useTheme();
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState<PlanovaNotification[]>([]);

  const colors = isDark
    ? {
        overlay: "rgba(5,10,28,0.78)",
        card: "#0e1938",
        cardBorder: "rgba(196,181,253,0.35)",
        title: "#e9d5ff",
        text: "rgba(255,255,255,0.88)",
        secondary: "rgba(255,255,255,0.58)",
        iconBackground: "rgba(255,255,255,0.10)",
        iconBorder: "rgba(196,181,253,0.30)",
        closeBackground: "rgba(255,255,255,0.10)",
        completed: "#d8b4fe",
        upcoming: "#c4b5fd",
        missed: "#b9a9df",
        streak: "#e9d5ff",
        returnColor: "#d8b4fe",
        empty: "rgba(255,255,255,0.06)",
      }
    : {
        overlay: "rgba(35,28,62,0.48)",
        card: "#EEF3FF",
        cardBorder: "rgba(79,66,125,0.28)",
        title: "#403465",
        text: "rgba(48,42,70,0.88)",
        secondary: "rgba(48,42,70,0.58)",
        iconBackground: "rgba(79,66,125,0.10)",
        iconBorder: "rgba(79,66,125,0.25)",
        closeBackground: "rgba(79,66,125,0.10)",
        completed: "#6D5A9F",
        upcoming: "#7A68A8",
        missed: "#6A5A9E",
        streak: "#4F427D",
        returnColor: "#6D5A9F",
        empty: "rgba(79,66,125,0.06)",
      };

  const loadNotifications = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (!stored) {
        setNotifications([]);
        return;
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        setNotifications([]);
        return;
      }
      setNotifications(parsed);
    } catch (error) {
      console.log("Failed to load notifications:", error);
    }
  }, []);

  const loadDismissedNotificationIds = async (): Promise<Set<string>> => {
    try {
      const stored = await AsyncStorage.getItem(DISMISSED_NOTIFICATIONS_STORAGE_KEY);
      if (!stored) {
        return new Set();
      }
      const parsed = JSON.parse(stored);
      if (!Array.isArray(parsed)) {
        return new Set();
      }
      return new Set(parsed.filter((id): id is string => typeof id === "string"));
    } catch (error) {
      console.log("Failed to load dismissed notifications:", error);
      return new Set();
    }
  };

  const isNotificationDismissed = async (notificationId: string) => {
    const dismissed = await loadDismissedNotificationIds();
    return dismissed.has(notificationId);
  };

  const addNotification = async (notification: PlanovaNotification) => {
    try {
      const dismissed = await loadDismissedNotificationIds();
      if (dismissed.has(notification.id)) {
        return;
      }
      const stored = await AsyncStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      const existing: PlanovaNotification[] = stored ? JSON.parse(stored) : [];
      const alreadyExists = existing.some((item) => item.id === notification.id);
      if (alreadyExists) {
        return;
      }
      const updated = [notification, ...existing].slice(0, 50);
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
      setNotifications(updated);
    } catch (error) {
      console.log("Failed to add notification:", error);
    }
  };

  const checkCompletedTasks = async (tasks: Task[]) => {
    try {
      const storedSnapshot = await AsyncStorage.getItem(TASK_SNAPSHOT_STORAGE_KEY);
      let previousSnapshot: TaskSnapshot = {};
      if (storedSnapshot) {
        try {
          previousSnapshot = JSON.parse(storedSnapshot);
        } catch {
          previousSnapshot = {};
        }
      }
      const currentSnapshot: TaskSnapshot = {};
      for (const task of tasks) {
        currentSnapshot[task.id] = { completed: task.completed };
        const previous = previousSnapshot[task.id];
        if (previous && !previous.completed && task.completed) {
          await addNotification({
            id: createNotificationId("completed", task.id),
            type: "completed",
            title: "Task Complete ✦",
            message: `Congratulations on completing "${task.title}"! Your Starpath is shining a little brighter.`,
            createdAt: Date.now(),
            taskId: task.id,
            read: false,
          });
        }
      }
      await AsyncStorage.setItem(TASK_SNAPSHOT_STORAGE_KEY, JSON.stringify(currentSnapshot));
    } catch (error) {
      console.log("Failed to check completed tasks:", error);
    }
  };

  const checkUpcomingTasks = async (tasks: Task[]) => {
    const now = Date.now();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
    for (const task of tasks) {
      if (task.completed) {
        continue;
      }
      const deadline = parseDateTime(task).getTime();
      const timeUntilDeadline = deadline - now;
      const isWithin24Hours = timeUntilDeadline > 0 && timeUntilDeadline <= TWENTY_FOUR_HOURS;
      if (!isWithin24Hours) {
        continue;
      }
      const notificationId = createNotificationId("upcoming", task.id);
      await addNotification({
        id: notificationId,
        type: "upcoming",
        title: "Coming Up ✦",
        message: `"${task.title}" is due within the next 24 hours.`,
        createdAt: Date.now(),
        taskId: task.id,
        read: false,
      });
    }
  };

  const checkMissedTasks = async (tasks: Task[]) => {
    const now = Date.now();
    const ONE_MINUTE = 60 * 1000;
    for (const task of tasks) {
      if (task.completed) {
        continue;
      }
      const deadline = parseDateTime(task).getTime();
      const timeSinceDeadline = now - deadline;
      if (timeSinceDeadline >= ONE_MINUTE) {
        const notificationId = createNotificationId("missed", task.id);
        await addNotification({
          id: notificationId,
          type: "missed",
          title: "Task Missed",
          message: `You have missed the deadline for "${task.title}".`,
          createdAt: Date.now(),
          taskId: task.id,
          read: false,
        });
      }
    }
  };

  const checkStreakReminder = async () => {
    try {
      const storedStreak = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
      if (!storedStreak) {
        return;
      }
      const streak: StreakData = JSON.parse(storedStreak);
      const now = new Date();
      if (now.getHours() < 23) {
        return;
      }
      const todayKey = formatDateKey(now);
      if (streak.lastCheckIn === todayKey) {
        return;
      }
      const notificationId = createNotificationId("streak", undefined, todayKey);
      await addNotification({
        id: notificationId,
        type: "streak",
        title: "Don't Lose Your Streak ✦",
        message: "You haven't checked in today. Take a moment to log in and keep your streak alive!",
        createdAt: Date.now(),
        read: false,
      });
    } catch (error) {
      console.log("Failed to check streak reminder:", error);
    }
  };

  const checkReturnReminder = async () => {
    try {
      const storedLastActive = await AsyncStorage.getItem(LAST_ACTIVE_STORAGE_KEY);
      const now = Date.now();
      if (storedLastActive) {
        const lastActive = Number(storedLastActive);
        const twoWeeks = 14 * 24 * 60 * 60 * 1000;
        if (Number.isFinite(lastActive) && now - lastActive >= twoWeeks) {
          const lastReminder = await AsyncStorage.getItem(RETURN_REMINDER_STORAGE_KEY);
          if (!lastReminder || Number(lastReminder) < lastActive) {
            await addNotification({
              id: createNotificationId("return", undefined, String(lastActive)),
              type: "return",
              title: "Your Starpath Misses You ✦",
              message: "It's been a while. Come back and study with us — your next step is waiting.",
              createdAt: now,
              read: false,
            });
            await AsyncStorage.setItem(RETURN_REMINDER_STORAGE_KEY, String(lastActive));
          }
        }
      }
      await AsyncStorage.setItem(LAST_ACTIVE_STORAGE_KEY, String(now));
    } catch (error) {
      console.log("Failed to check return reminder:", error);
    }
  };

  const checkNotifications = useCallback(async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      let tasks: Task[] = [];
      if (storedTasks) {
        const parsed = JSON.parse(storedTasks);
        if (Array.isArray(parsed)) {
          tasks = parsed.map((task: any, index: number) => ({
            id: task.id || `${Date.now()}-${index}`,
            title: task.title || "Untitled Task",
            date: task.date || formatDateKey(new Date()),
            time: task.time || "23:59",
            category: task.category || "Other",
            priority: task.priority || "Medium",
            completed: Boolean(task.completed),
          }));
        }
      }
      await checkCompletedTasks(tasks);
      await checkUpcomingTasks(tasks);
      await checkMissedTasks(tasks);
      await checkStreakReminder();
    } catch (error) {
      console.log("Failed to check notifications:", error);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    checkReturnReminder();
    checkNotifications();
  }, [loadNotifications, checkNotifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      checkNotifications();
    }, 1000);
    return () => {
      clearInterval(interval);
    };
  }, [checkNotifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !notification.read).length;
  }, [notifications]);

  const openNotifications = async () => {
    setVisible(true);
    const updated = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    setNotifications(updated);
    try {
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.log("Failed to mark notifications as read:", error);
    }
  };

  const closeNotifications = () => {
    setVisible(false);
  };

  const clearNotifications = async () => {
    try {
      const dismissed = await loadDismissedNotificationIds();
      notifications.forEach((notification) => {
        dismissed.add(notification.id);
      });
      await AsyncStorage.setItem(DISMISSED_NOTIFICATIONS_STORAGE_KEY, JSON.stringify(Array.from(dismissed)));
      await AsyncStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify([]));
      setNotifications([]);
    } catch (error) {
      console.log("Failed to permanently clear notifications:", error);
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "completed":
        return <MaterialCommunityIcons name="check-circle" size={22} color={colors.completed} />;
      case "upcoming":
        return <MaterialCommunityIcons name="clock-alert" size={22} color={colors.upcoming} />;
      case "missed":
        return <MaterialCommunityIcons name="alert-circle" size={22} color={colors.missed} />;
      case "streak":
        return <MaterialCommunityIcons name="fire" size={22} color={colors.streak} />;
      case "return":
        return <MaterialCommunityIcons name="star-four-points" size={22} color={colors.returnColor} />;
      default:
        return <Ionicons name="notifications" size={22} color={colors.title} />;
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.iconBubble, { backgroundColor: colors.iconBackground, borderColor: colors.iconBorder }]}
        onPress={openNotifications}
        activeOpacity={0.8}
      >
        <Ionicons name="notifications" size={18} color="#ffffff" />
        {unreadCount > 0 ? (
          <View style={[styles.badge, { backgroundColor: colors.completed }]}>
            <Text style={[styles.badgeText, { color: isDark ? "#0e1938" : "#29233F" }]}>
              {unreadCount > 9 ? "9+" : unreadCount}
            </Text>
          </View>
        ) : (
          <View style={[styles.badge, { backgroundColor: colors.iconBackground, borderWidth: 1, borderColor: colors.iconBorder }]}>
            <Text style={[styles.badgeText, { color: isDark ? "#d8b4fe" : "#6D5A9F" }]}>✦</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={visible}
        transparent={true}
        animationType="fade"
        statusBarTranslucent={true}
        navigationBarTranslucent={true}
        onRequestClose={closeNotifications}
      >
        <View style={[styles.modalRoot, { backgroundColor: colors.overlay }]}>
          <View style={[styles.notificationCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.notificationHeader}>
              <View>
                <Text style={[styles.notificationTitle, { color: colors.title }]}>Notifications</Text>
                <Text style={[styles.notificationSubtitle, { color: colors.secondary }]}>Your Starpath updates</Text>
              </View>
              <TouchableOpacity
                onPress={closeNotifications}
                activeOpacity={0.8}
                style={[styles.closeButton, { backgroundColor: colors.closeBackground, borderColor: colors.iconBorder }]}
              >
                <Ionicons name="close" size={20} color={colors.title} />
              </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: colors.empty, borderColor: colors.cardBorder }]}>
                <MaterialCommunityIcons name="star-four-points" size={34} color={colors.title} />
                <Text style={[styles.emptyTitle, { color: colors.title }]}>All caught up</Text>
                <Text style={[styles.emptyText, { color: colors.secondary }]}>
                  Nothing needs your attention right now. Keep following your Starpath.
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.notificationList}
                contentContainerStyle={styles.notificationListContent}
              >
                {notifications.map((notification) => (
                  <View
                    key={notification.id}
                    style={[styles.notificationItem, { backgroundColor: colors.empty, borderColor: colors.cardBorder }]}
                  >
                    <View style={[styles.notificationIcon, { backgroundColor: colors.iconBackground, borderColor: colors.iconBorder }]}>
                      {getNotificationIcon(notification.type)}
                    </View>
                    <View style={styles.notificationContent}>
                      <Text style={[styles.itemTitle, { color: colors.title }]}>{notification.title}</Text>
                      <Text style={[styles.itemMessage, { color: colors.text }]}>{notification.message}</Text>
                      <Text style={[styles.itemTime, { color: colors.secondary }]}>
                        {new Date(notification.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}

            {notifications.length > 0 && (
              <TouchableOpacity onPress={clearNotifications} activeOpacity={0.8} style={[styles.clearButton, { borderColor: colors.cardBorder }]}>
                <Text style={[styles.clearButtonText, { color: colors.secondary }]}>Clear Notifications</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: "BitterBold",
    fontSize: 8,
  },
  modalRoot: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 22,
  },
  notificationCard: {
    width: "100%",
    maxWidth: 420,
    maxHeight: "78%",
    borderRadius: 26,
    borderWidth: 1,
    padding: 20,
    elevation: 20,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  notificationTitle: {
    fontFamily: "BitterBold",
    fontSize: 23,
  },
  notificationSubtitle: {
    fontFamily: "Bitter",
    fontSize: 12,
    marginTop: 3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationList: {
    maxHeight: 430,
  },
  notificationListContent: {
    paddingBottom: 4,
  },
  notificationItem: {
    flexDirection: "row",
    borderRadius: 17,
    borderWidth: 1,
    padding: 13,
    marginBottom: 10,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  notificationContent: {
    flex: 1,
  },
  itemTitle: {
    fontFamily: "BitterBold",
    fontSize: 14,
    marginBottom: 4,
  },
  itemMessage: {
    fontFamily: "Bitter",
    fontSize: 12,
    lineHeight: 18,
  },
  itemTime: {
    fontFamily: "Bitter",
    fontSize: 10,
    marginTop: 6,
  },
  emptyContainer: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 28,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 8,
  },
  emptyTitle: {
    fontFamily: "BitterBold",
    fontSize: 17,
    marginTop: 10,
  },
  emptyText: {
    fontFamily: "Bitter",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 6,
  },
  clearButton: {
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 14,
    alignItems: "center",
  },
  clearButtonText: {
    fontFamily: "BitterBold",
    fontSize: 12,
  },
});