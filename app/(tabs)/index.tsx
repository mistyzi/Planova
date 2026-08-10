import PlanovaHeader from "@/components/header";
import { useTheme } from "@/context/themecontext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const TASKS_STORAGE_KEY = "@planova_tasks";
const PROFILE_STORAGE_KEYS = [
  "@planova_profile",
  "@planova_user",
  "@planova_user_profile",
  "@planova_profile_data",
];
const STREAK_STORAGE_KEY = "@planova_streak";

type Task = {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  priority: string;
  completed: boolean;
};

type Profile = {
  name?: string;
  username?: string;
  displayName?: string;
  fullName?: string;
};

type StreakData = {
  currentStreak: number;
  lastCheckIn: string | null;
};

const pad = (value: number) => String(value).padStart(2, "0");

const formatDateKey = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const getTodayKey = () => {
  return formatDateKey(new Date());
};

const parseDateSafe = (dateString?: string) => {
  if (!dateString) return new Date();
  const parts = dateString.split("-");
  if (parts.length !== 3) return new Date();
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return new Date();
  }
  return new Date(year, month - 1, day);
};

const getDaysBetween = (earlierDate: string, laterDate: string) => {
  const earlier = parseDateSafe(earlierDate);
  const later = parseDateSafe(laterDate);
  earlier.setHours(0, 0, 0, 0);
  later.setHours(0, 0, 0, 0);
  return Math.round((later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24));
};

const isTaskMissed = (task: Task) => {
  if (task.completed) return false;
  const taskDate = parseDateSafe(task.date);
  const [hours, minutes] = (task.time || "23:59").split(":").map(Number);
  taskDate.setHours(Number.isFinite(hours) ? hours : 23, Number.isFinite(minutes) ? minutes : 59, 0, 0);
  return taskDate.getTime() < Date.now();
};

export default function HomeScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [userName, setUserName] = useState("Celestia");
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    lastCheckIn: null,
  });

  const colors = isDark
    ? {
        logo: "#e9d5ff",
        badge: "#d8b4fe",
        badgeText: "#0e1938",
        welcomeTitle: "#e9d5ff",
        welcomeSubtitle: "rgba(255,255,255,0.8)",
        card: "rgba(14,25,56,0.55)",
        cardBorder: "rgba(196,181,253,0.28)",
        cardTitle: "#e9d5ff",
        cardText: "rgba(255,255,255,0.9)",
        bold: "#ffffff",
        button: "rgba(255,255,255,0.12)",
        buttonBorder: "rgba(196,181,253,0.35)",
        buttonText: "#ffffff",
        alignmentTitle: "#e9d5ff",
        alignmentText: "rgba(255,255,255,0.92)",
        constellation: "rgba(196,181,253,0.45)",
        streakBox: "rgba(255,255,255,0.10)",
        streakBorder: "rgba(196,181,253,0.35)",
        streakLabel: "rgba(255,255,255,0.82)",
        streakValue: "#e9d5ff",
        streakHint: "rgba(255,255,255,0.65)",
        fireDim: "rgba(196,181,253,0.25)",
        fireBright: "#d8b4fe",
        checkIn: "#d8b4fe",
        checkInText: "#0e1938",
        statText: "rgba(255,255,255,0.82)",
        chip: "rgba(255,255,255,0.10)",
        chipBorder: "rgba(196,181,253,0.35)",
        chipText: "rgba(255,255,255,0.86)",
        task: "rgba(255,255,255,0.10)",
        taskBorder: "rgba(196,181,253,0.28)",
        taskTitle: "#f5f3ff",
        taskRemaining: "rgba(255,255,255,0.55)",
        seeMore: "rgba(255,255,255,0.10)",
        seeMoreBorder: "rgba(196,181,253,0.35)",
        seeMoreText: "#ffffff",
      }
    : {
        logo: "#4F427D",
        badge: "#B9A9DF",
        badgeText: "#29233F",
        welcomeTitle: "#403465",
        welcomeSubtitle: "rgba(48,42,70,0.78)",
        card: "rgba(255,255,255,0.72)",
        cardBorder: "rgba(79,66,125,0.30)",
        cardTitle: "#403465",
        cardText: "rgba(48,42,70,0.88)",
        bold: "#2F274D",
        button: "rgba(79,66,125,0.14)",
        buttonBorder: "rgba(79,66,125,0.38)",
        buttonText: "#3D3262",
        alignmentTitle: "#4F427D",
        alignmentText: "rgba(48,42,70,0.86)",
        constellation: "rgba(79,66,125,0.40)",
        streakBox: "rgba(79,66,125,0.10)",
        streakBorder: "rgba(79,66,125,0.30)",
        streakLabel: "rgba(48,42,70,0.76)",
        streakValue: "#4F427D",
        streakHint: "rgba(48,42,70,0.62)",
        fireDim: "rgba(79,66,125,0.22)",
        fireBright: "#B9A9DF",
        checkIn: "#B9A9DF",
        checkInText: "#29233F",
        statText: "rgba(48,42,70,0.76)",
        chip: "rgba(79,66,125,0.10)",
        chipBorder: "rgba(79,66,125,0.30)",
        chipText: "#403465",
        task: "rgba(79,66,125,0.08)",
        taskBorder: "rgba(79,66,125,0.26)",
        taskTitle: "#30284C",
        taskRemaining: "rgba(48,42,70,0.58)",
        seeMore: "rgba(79,66,125,0.12)",
        seeMoreBorder: "rgba(79,66,125,0.32)",
        seeMoreText: "#403465",
      };

  const loadTasks = useCallback(async () => {
    try {
      const storedTasks = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
      if (!storedTasks) {
        setTasks([]);
        return;
      }
      const parsed = JSON.parse(storedTasks);
      if (!Array.isArray(parsed)) {
        setTasks([]);
        return;
      }
      const safeTasks: Task[] = parsed.map((task: any, index: number) => ({
        id: task.id || `${Date.now()}-${index}`,
        title: task.title || "Untitled Task",
        date: task.date || getTodayKey(),
        time: task.time || "12:00",
        category: task.category || "Other",
        priority: task.priority || "Medium",
        completed: Boolean(task.completed),
      }));
      setTasks(safeTasks);
    } catch (error) {
      console.log("Failed to load tasks:", error);
      setTasks([]);
    }
  }, []);

  const loadProfile = useCallback(async () => {
    try {
      for (const key of PROFILE_STORAGE_KEYS) {
        const storedProfile = await AsyncStorage.getItem(key);
        if (!storedProfile) continue;
        try {
          const parsed: Profile = JSON.parse(storedProfile);
          const possibleName = parsed.name || parsed.displayName || parsed.fullName || parsed.username;
          if (typeof possibleName === "string" && possibleName.trim().length > 0) {
            setUserName(possibleName.trim());
            return;
          }
        } catch {
          if (storedProfile.trim().length > 0) {
            setUserName(storedProfile.trim());
            return;
          }
        }
      }
    } catch (error) {
      console.log("Failed to load profile:", error);
    }
  }, []);

  const loadStreak = useCallback(async () => {
    try {
      const storedStreak = await AsyncStorage.getItem(STREAK_STORAGE_KEY);
      if (!storedStreak) {
        setStreak({ currentStreak: 0, lastCheckIn: null });
        return;
      }
      const parsed = JSON.parse(storedStreak);
      if (!parsed) return;
      const today = getTodayKey();
      const currentStreak = Number(parsed.currentStreak) || 0;
      const lastCheckIn = parsed.lastCheckIn || null;
      if (lastCheckIn === today) {
        setStreak({ currentStreak, lastCheckIn: today });
        return;
      }
      if (lastCheckIn && getDaysBetween(lastCheckIn, today) === 1) {
        setStreak({ currentStreak, lastCheckIn });
        return;
      }
      if (lastCheckIn && getDaysBetween(lastCheckIn, today) > 1) {
        const resetStreak: StreakData = { currentStreak: 0, lastCheckIn: null };
        setStreak(resetStreak);
        await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(resetStreak));
        return;
      }
      setStreak({ currentStreak, lastCheckIn });
    } catch (error) {
      console.log("Failed to load streak:", error);
    }
  }, []);

  useEffect(() => {
    loadTasks();
    loadProfile();
    loadStreak();
  }, [loadTasks, loadProfile, loadStreak]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadTasks();
      loadProfile();
      loadStreak();
    }, 3000);
    return () => {
      clearInterval(interval);
    };
  }, [loadTasks, loadProfile, loadStreak]);

  const todayKey = getTodayKey();

  const todayTasks = useMemo(() => {
    return tasks.filter((task) => task.date === todayKey);
  }, [tasks, todayKey]);

  const completedTasks = useMemo(() => {
    return tasks.filter((task) => task.completed);
  }, [tasks]);

  const incompleteTasks = useMemo(() => {
    return tasks.filter((task) => !task.completed);
  }, [tasks]);

  const overdueTasks = useMemo(() => {
    return tasks.filter((task) => isTaskMissed(task));
  }, [tasks]);

  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (task.completed) return false;
        if (task.date < todayKey) return false;
        if (task.date === todayKey && isTaskMissed(task)) return false;
        return true;
      })
      .sort((a, b) => {
        const dateA = `${a.date} ${a.time}`;
        const dateB = `${b.date} ${b.time}`;
        return dateA.localeCompare(dateB);
      });
  }, [tasks, todayKey]);

  const mostUsedCategory = useMemo(() => {
    if (tasks.length === 0) return null;
    const counts: Record<string, number> = {};
    tasks.forEach((task) => {
      const category = task.category || "Other";
      counts[category] = (counts[category] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }, [tasks]);

  const scheduleText = useMemo(() => {
    const dueToday = todayTasks.length;
    const completedToday = todayTasks.filter((task) => task.completed).length;
    const remainingToday = todayTasks.filter((task) => !task.completed).length;

    if (tasks.length === 0) {
      return {
        first: `Your schedule is completely open today, ${userName}, so you have plenty of space to decide what deserves your attention.`,
        second: "Since you don't have anything waiting on your Starpath yet, starting with one small study task could be a great way to build momentum.",
      };
    }

    if (dueToday > 0 && remainingToday === 0) {
      return {
        first: `You've already completed all ${dueToday} task${dueToday === 1 ? "" : "s"} on today's schedule, ${userName}.`,
        second: mostUsedCategory
          ? `You've been putting a lot of energy into ${mostUsedCategory} work, so you've earned some breathing room — or you can use the momentum to get ahead.`
          : "You've cleared everything scheduled for today, so you can either get ahead on upcoming work or give yourself some well-earned time to recharge.",
      };
    }

    if (overdueTasks.length > 0) {
      return {
        first: `${userName}, you have ${overdueTasks.length} overdue task${overdueTasks.length === 1 ? "" : "s"}, so clearing one of those would be a strong place to start.`,
        second: remainingToday > 0
          ? `You still have ${remainingToday} task${remainingToday === 1 ? "" : "s"} planned for today, so finishing an overdue item first could make the rest of your day feel much lighter.`
          : "Once those are cleared, you'll have a much cleaner path through the rest of your week.",
      };
    }

    if (dueToday > 0) {
      return {
        first: `${userName}, you have ${remainingToday} task${remainingToday === 1 ? "" : "s"} left today, and you've already completed ${completedToday}.`,
        second: mostUsedCategory
          ? `A lot of your current workload is centered around ${mostUsedCategory}, so staying focused there could help you make the most of your next study session.`
          : "You've already made progress today, so choosing one remaining task and giving it your full attention could keep that momentum going.",
      };
    }

    if (upcomingTasks.length > 0) {
      const nextTask = upcomingTasks[0];
      return {
        first: `${userName}, nothing is due today, and your next scheduled task is "${nextTask.title}".`,
        second: mostUsedCategory
          ? `You have some breathing room, which makes today a great chance to get ahead on your ${mostUsedCategory} work before the next deadline arrives.`
          : "You have some breathing room today, so getting a head start on that task could make your next study session feel easier.",
      };
    }

    return {
      first: `${userName}, your schedule is looking fairly clear today.`,
      second: "This is a good opportunity to review your upcoming work, spend some focused time studying, or simply take a well-earned break.",
    };
  }, [userName, tasks, todayTasks, overdueTasks, upcomingTasks, mostUsedCategory]);

  const scheduleTasks = useMemo(() => {
    return upcomingTasks.slice(0, 3);
  }, [upcomingTasks]);

  const getRemainingText = (task: Task) => {
    if (task.completed) return "Completed";
    const today = parseDateSafe(todayKey);
    const taskDate = parseDateSafe(task.date);
    today.setHours(0, 0, 0, 0);
    taskDate.setHours(0, 0, 0, 0);
    const difference = Math.round((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (difference < 0) return "Overdue";
    if (difference === 0) return "Due Today";
    if (difference === 1) return "Tomorrow";
    return `${difference} Days Remaining`;
  };

  const checkInToday = async () => {
    try {
      const today = getTodayKey();
      if (streak.lastCheckIn === today) return;
      let newStreak = 1;
      if (streak.lastCheckIn && getDaysBetween(streak.lastCheckIn, today) === 1) {
        newStreak = streak.currentStreak + 1;
      }
      const newStreakData: StreakData = {
        currentStreak: newStreak,
        lastCheckIn: today,
      };
      setStreak(newStreakData);
      await AsyncStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(newStreakData));
    } catch (error) {
      console.log("Failed to check in:", error);
    }
  };

  const goToTasks = () => {
    router.push("/tasks");
  };

  const goToStudy = () => {
    router.push("/study");
  };

  const checkedInToday = streak.lastCheckIn === todayKey;

  return (
    <SafeAreaView style={styles.container}>
      <PlanovaHeader />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.welcomeTitle }]}>
            Welcome Back, {userName}!
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.welcomeSubtitle }]}>
            Your Starpath awaits, let's make today luminous.
          </Text>
        </View>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.cardTitle }]}>Schedule Overview</Text>
          <Text style={[styles.cardText, { color: colors.cardText }]}>{scheduleText.first}</Text>
          <Text style={[styles.cardText, { color: colors.cardText, marginTop: 10 }]}>
            {scheduleText.second}
          </Text>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.button,
                borderColor: colors.buttonBorder,
              },
            ]}
            activeOpacity={0.8}
            onPress={goToStudy}
          >
            <Text style={[styles.primaryButtonText, { color: colors.buttonText }]}>Start Studying</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: colors.button,
                borderColor: colors.buttonBorder,
              },
            ]}
            activeOpacity={0.8}
            onPress={goToTasks}
          >
            <Text style={[styles.primaryButtonText, { color: colors.buttonText }]}>View Schedule</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.alignmentSection}>
          <Text style={[styles.alignmentTitle, { color: colors.alignmentTitle }]}>
            .⋆˚✦. DAILY ALIGNMENT .✦˚⋆.
          </Text>
          <Text style={[styles.alignmentText, { color: colors.alignmentText }]}>
            The universe conspires for your focus today.
            {"\n"}
            Your academic journey is written in the stars.
          </Text>
        </View>
        <View style={[styles.constellationLine, { backgroundColor: colors.constellation }]} />
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.cardTitle }]}>Daily Streak</Text>
          <View
            style={[
              styles.streakBox,
              {
                backgroundColor: colors.streakBox,
                borderColor: colors.streakBorder,
              },
            ]}
          >
            <Text style={[styles.streakLabel, { color: colors.streakLabel }]}>✦ Current Streak ✦</Text>
            <Text style={[styles.streakValue, { color: colors.streakValue }]}>
              {streak.currentStreak} {streak.currentStreak === 1 ? "Day" : "Days"}
            </Text>
            <View
              style={[
                styles.fireContainer,
                {
                  transform: [
                    {
                      scale: checkedInToday ? 1.08 : 1,
                    },
                  ],
                },
              ]}
            >
              <MaterialCommunityIcons
                name="fire"
                size={92}
                color={checkedInToday ? colors.fireBright : colors.fireDim}
              />
            </View>
            <Text style={[styles.streakHint, { color: colors.streakHint }]}>
              {checkedInToday
                ? "You've checked in today. Keep the streak alive!"
                : "Check in today to keep your streak going."}
            </Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={checkInToday}
              disabled={checkedInToday}
              style={[
                styles.checkInButton,
                {
                  backgroundColor: checkedInToday ? colors.button : colors.checkIn,
                  borderColor: colors.streakBorder,
                  opacity: checkedInToday ? 0.75 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.checkInText,
                  {
                    color: checkedInToday ? colors.buttonText : colors.checkInText,
                  },
                ]}
              >
                {checkedInToday ? "Checked In" : "Check In Today"}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.statsRow}>
            <Text style={[styles.statText, { color: colors.statText }]}>
              Completed: <Text style={[styles.bold, { color: colors.bold }]}>{completedTasks.length}</Text>
            </Text>
            <Text style={[styles.statText, { color: colors.statText }]}>
              Remaining: <Text style={[styles.bold, { color: colors.bold }]}>{incompleteTasks.length}</Text>
            </Text>
          </View>
        </View>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.cardTitle }]}>Weekly Galaxy Goals</Text>
          <View style={styles.chipRow}>
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: colors.chip,
                  borderColor: colors.chipBorder,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: colors.chipText }]}>
                ✦ {todayTasks.filter((task) => !task.completed).length} Due Today
              </Text>
            </View>
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: colors.chip,
                  borderColor: colors.chipBorder,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: colors.chipText }]}>
                ✦ {overdueTasks.length} Overdue
              </Text>
            </View>
            <View
              style={[
                styles.chip,
                {
                  backgroundColor: colors.chip,
                  borderColor: colors.chipBorder,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: colors.chipText }]}>
                ✦ {upcomingTasks.length} Upcoming
              </Text>
            </View>
          </View>
          {scheduleTasks.length === 0 ? (
            <View
              style={[
                styles.noTasksBox,
                {
                  backgroundColor: colors.task,
                  borderColor: colors.taskBorder,
                },
              ]}
            >
              <Text style={[styles.taskRemaining, { color: colors.taskRemaining }]}>
                Your schedule is clear. Add a task when you're ready.
              </Text>
            </View>
          ) : (
            scheduleTasks.map((task) => (
              <View
                key={task.id}
                style={[
                  styles.taskItem,
                  {
                    backgroundColor: colors.task,
                    borderColor: colors.taskBorder,
                  },
                ]}
              >
                <Text style={[styles.taskTitle, { color: colors.taskTitle }]} numberOfLines={2}>
                  {task.title}
                </Text>
                <Text style={[styles.taskRemaining, { color: colors.taskRemaining }]}>
                  {getRemainingText(task)}
                </Text>
              </View>
            ))
          )}
          <View style={styles.seeMoreRow}>
            <TouchableOpacity
              style={[
                styles.seeMoreButton,
                {
                  backgroundColor: colors.seeMore,
                  borderColor: colors.seeMoreBorder,
                },
              ]}
              activeOpacity={0.8}
              onPress={goToTasks}
            >
              <Text style={[styles.seeMoreText, { color: colors.seeMoreText }]}>See More →</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={[styles.constellationLine, { backgroundColor: colors.constellation }]} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 120,
  },
  welcomeSection: {
    alignItems: "center",
    marginBottom: 18,
  },
  welcomeTitle: {
    fontFamily: "BitterBold",
    fontSize: 24,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontFamily: "Bitter",
    marginTop: 6,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: "BitterBold",
    fontSize: 20,
    textAlign: "center",
    marginBottom: 14,
  },
  cardText: {
    fontFamily: "Bitter",
    fontSize: 15,
    lineHeight: 22,
  },
  bold: {
    fontFamily: "BitterBold",
  },
  primaryButton: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    fontFamily: "BitterBold",
    fontSize: 14,
  },
  alignmentSection: {
    alignItems: "center",
    paddingVertical: 8,
    marginBottom: 8,
  },
  alignmentTitle: {
    fontFamily: "BitterBold",
    fontSize: 18,
    textAlign: "center",
  },
  alignmentText: {
    fontFamily: "Bitter",
    marginTop: 10,
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  constellationLine: {
    alignSelf: "center",
    width: "60%",
    height: 1,
    marginBottom: 22,
  },
  streakBox: {
    alignSelf: "center",
    width: "100%",
    maxWidth: 300,
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: "center",
    marginBottom: 8,
  },
  streakLabel: {
    fontFamily: "Bitter",
    fontSize: 13,
    letterSpacing: 0.5,
  },
  streakValue: {
    fontFamily: "BitterBold",
    marginTop: 8,
    fontSize: 34,
  },
  fireContainer: {
    height: 110,
    width: 110,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    marginBottom: 2,
  },
  streakHint: {
    fontFamily: "Bitter",
    marginTop: 4,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  checkInButton: {
    marginTop: 14,
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  checkInText: {
    fontFamily: "BitterBold",
    fontSize: 13,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  statText: {
    fontFamily: "Bitter",
    fontSize: 13,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 14,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 3,
    marginBottom: 8,
  },
  chipText: {
    fontFamily: "BitterBold",
    fontSize: 10,
  },
  taskItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  taskTitle: {
    fontFamily: "BitterBold",
    flex: 1,
    fontSize: 15,
    marginRight: 12,
  },
  taskRemaining: {
    fontFamily: "Bitter",
    fontSize: 12,
    textAlign: "right",
  },
  noTasksBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  seeMoreRow: {
    alignItems: "flex-end",
    marginTop: 4,
  },
  seeMoreButton: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  seeMoreText: {
    fontFamily: "BitterBold",
    fontSize: 13,
  },
});