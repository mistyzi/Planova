import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import PlanovaHeader from "../../components/header";
import { useTheme } from "../../context/themecontext";

const TASKS_STORAGE_KEY = "@planova_tasks";
const CATEGORIES_STORAGE_KEY = "@planova_categories";

type Task = {
  id: string;
  title: string;
  date: string;
  time: string;
  category: string;
  priority: string;
  completed: boolean;
};

type FilterType = "All" | "Complete" | "Ongoing" | "Missed";

const DEFAULT_CATEGORIES = [
  "School",
  "Study",
  "Coding",
  "Work",
  "Personal",
  "Other",
];

const PRIORITIES = ["Low", "Medium", "High"];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const pad = (value: number) => String(value).padStart(2, "0");

/* ============================================================
   DATE HELPERS
   ============================================================ */

const formatDateKey = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}`;
};

const getTodayKey = () => {
  return formatDateKey(new Date());
};

/*
 * IMPORTANT:
 * This parses YYYY-MM-DD as a LOCAL date.
 *
 * We deliberately do NOT use:
 * new Date("2026-08-10")
 *
 * because JavaScript treats ISO date-only strings as UTC,
 * which can shift the date depending on timezone.
 */
const parseDateSafe = (dateString?: string) => {
  if (!dateString) {
    return new Date();
  }

  const parts = dateString.trim().split("-");

  if (parts.length !== 3) {
    return new Date();
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day)
  ) {
    return new Date();
  }

  return new Date(year, month - 1, day);
};

/*
 * Convert the task's time into 24-hour values.
 *
 * Supports:
 * 12:00
 * 09:30
 * 9:30
 * 9:30 AM
 * 9:30 PM
 * 12:00 AM
 * 12:00 PM
 */
const parseTaskTime = (timeString?: string) => {
  const rawTime = String(timeString || "23:59").trim();

  /*
   * 12-hour format:
   * 9:30 AM
   * 9:30 PM
   */
  const twelveHourMatch = rawTime.match(
    /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i
  );

  if (twelveHourMatch) {
    let hours = Number(twelveHourMatch[1]);
    const minutes = Number(twelveHourMatch[2]);
    const meridiem = twelveHourMatch[3].toUpperCase();

    if (
      !Number.isFinite(hours) ||
      !Number.isFinite(minutes) ||
      hours < 1 ||
      hours > 12 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return { hours: 23, minutes: 59 };
    }

    if (meridiem === "AM" && hours === 12) {
      hours = 0;
    }

    if (meridiem === "PM" && hours !== 12) {
      hours += 12;
    }

    return {
      hours,
      minutes,
    };
  }

  /*
   * 24-hour format:
   * 9:30
   * 09:30
   * 23:45
   */
  const twentyFourHourMatch = rawTime.match(/^(\d{1,2}):(\d{2})$/);

  if (twentyFourHourMatch) {
    const hours = Number(twentyFourHourMatch[1]);
    const minutes = Number(twentyFourHourMatch[2]);

    if (
      !Number.isFinite(hours) ||
      !Number.isFinite(minutes) ||
      hours < 0 ||
      hours > 23 ||
      minutes < 0 ||
      minutes > 59
    ) {
      return { hours: 23, minutes: 59 };
    }

    return {
      hours,
      minutes,
    };
  }

  return {
    hours: 23,
    minutes: 59,
  };
};

/*
 * Creates the exact local Date/time at which a task is due.
 */
const getTaskDueTimestamp = (task: Task) => {
  const taskDate = parseDateSafe(task.date);

  const { hours, minutes } = parseTaskTime(task.time);

  taskDate.setHours(hours, minutes, 0, 0);

  return taskDate.getTime();
};

/*
 * THE IMPORTANT STATUS FUNCTION
 *
 * Completed:
 *   always completed
 *
 * Missed:
 *   incomplete AND current time is after due time
 *
 * Ongoing:
 *   incomplete AND due time is still in the future
 */
const isTaskMissed = (task: Task, now = Date.now()) => {
  if (task.completed) {
    return false;
  }

  const dueTimestamp = getTaskDueTimestamp(task);

  return dueTimestamp < now;
};

/*
 * Returns the complete status used everywhere on this screen.
 */
const getTaskStatusValue = (
  task: Task,
  now: number
): "Completed" | "Missed" | "Ongoing" => {
  if (task.completed) {
    return "Completed";
  }

  if (isTaskMissed(task, now)) {
    return "Missed";
  }

  return "Ongoing";
};

/* ============================================================
   CALENDAR HELPERS
   ============================================================ */

const getWeekDates = (date: Date) => {
  const start = new Date(date);

  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());

  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(start);

    current.setDate(start.getDate() + index);

    return current;
  });
};

const getMonthDates = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const leadingEmptyDays = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const dates: (Date | null)[] = [];

  for (let i = 0; i < leadingEmptyDays; i++) {
    dates.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    dates.push(new Date(year, month, day));
  }

  return dates;
};

/* ============================================================
   SCREEN
   ============================================================ */

export default function TasksScreen() {
  const { isDark } = useTheme();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<string[]>(
    DEFAULT_CATEGORIES
  );

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("All");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isMonthExpanded, setIsMonthExpanded] = useState(false);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDate, setTaskDate] = useState(getTodayKey());
  const [taskTime, setTaskTime] = useState("12:00");
  const [taskCategory, setTaskCategory] = useState("Study");
  const [taskPriority, setTaskPriority] = useState("Medium");

  const [showCustomCategoryInput, setShowCustomCategoryInput] =
    useState(false);

  const [customCategory, setCustomCategory] = useState("");

  /*
   * CURRENT TIME
   *
   * This updates every second so a task can automatically move
   * from Ongoing -> Missed without requiring the app to restart.
   */
  const [currentTime, setCurrentTime] = useState(Date.now());

  /*
   * IMPORTANT:
   * Prevents the save effects from overwriting AsyncStorage
   * while the initial data is still loading.
   */
  const [dataLoaded, setDataLoaded] = useState(false);

  /* ============================================================
     COLORS
     ============================================================ */

  const colors = isDark
    ? {
        logo: "#e9d5ff",
        starLogo: "#c4b5fd",
        iconBackground: "rgba(255,255,255,0.12)",
        iconBorder: "rgba(196,181,253,0.35)",
        badge: "#d8b4fe",
        badgeText: "#0e1938",

        calendar: "rgba(14,25,56,0.55)",
        calendarBorder: "rgba(196,181,253,0.28)",
        calendarTitle: "#ffffff",
        dayLabel: "#d8b4fe",
        dateText: "rgba(255,255,255,0.75)",
        activeDate: "#d8b4fe",
        activeDateText: "#0e1938",
        constellation: "rgba(196,181,253,0.45)",

        search: "rgba(14,25,56,0.55)",
        searchBorder: "rgba(196,181,253,0.28)",
        searchText: "#ffffff",
        searchPlaceholder: "rgba(255,255,255,0.45)",

        categoryBackground: "rgba(255,255,255,0.08)",
        categoryBorder: "rgba(196,181,253,0.28)",
        categoryText: "rgba(255,255,255,0.75)",
        categoryActive: "#d8b4fe",
        categoryActiveText: "#0e1938",

        task: "rgba(14,25,56,0.55)",
        taskBorder: "rgba(196,181,253,0.28)",
        taskTitle: "#ffffff",
        taskRemaining: "rgba(255,255,255,0.6)",
        taskMeta: "rgba(255,255,255,0.75)",

        editButton: "rgba(255,255,255,0.10)",
        editButtonBorder: "rgba(196,181,253,0.30)",
        editButtonIcon: "#ffffff",

        deleteButton: "rgba(248,113,113,0.10)",
        deleteButtonBorder: "rgba(248,113,113,0.30)",
        deleteButtonIcon: "#f87171",

        addButton: "rgba(14,25,56,0.55)",
        addButtonBorder: "rgba(196,181,253,0.28)",
        addButtonText: "#ffffff",

        modal: "#151d3d",
        modalBorder: "rgba(196,181,253,0.30)",

        input: "rgba(255,255,255,0.08)",
        inputBorder: "rgba(196,181,253,0.28)",
        inputText: "#ffffff",
        placeholder: "rgba(255,255,255,0.4)",

        cancelText: "#c4b5fd",
        saveButton: "#8064B5",
        saveButtonText: "#ffffff",

        missed: "#f87171",
        completed: "#86efac",
      }
    : {
        logo: "#4F427D",
        starLogo: "#6D5A9F",

        iconBackground: "rgba(70,58,120,0.18)",
        iconBorder: "rgba(79,66,125,0.40)",

        badge: "#B9A9DF",
        badgeText: "#29233F",

        calendar: "rgba(255,255,255,0.72)",
        calendarBorder: "rgba(79,66,125,0.30)",
        calendarTitle: "#403465",
        dayLabel: "#4F427D",
        dateText: "rgba(48,42,70,0.72)",
        activeDate: "#B9A9DF",
        activeDateText: "#29233F",
        constellation: "rgba(79,66,125,0.40)",

        search: "rgba(255,255,255,0.72)",
        searchBorder: "rgba(79,66,125,0.30)",
        searchText: "#30284C",
        searchPlaceholder: "rgba(48,42,70,0.48)",

        categoryBackground: "rgba(79,66,125,0.08)",
        categoryBorder: "rgba(79,66,125,0.25)",
        categoryText: "rgba(48,42,70,0.70)",
        categoryActive: "#B9A9DF",
        categoryActiveText: "#29233F",

        task: "rgba(255,255,255,0.72)",
        taskBorder: "rgba(79,66,125,0.30)",
        taskTitle: "#30284C",
        taskRemaining: "rgba(48,42,70,0.58)",
        taskMeta: "rgba(48,42,70,0.76)",

        editButton: "rgba(79,66,125,0.10)",
        editButtonBorder: "rgba(79,66,125,0.30)",
        editButtonIcon: "#403465",

        deleteButton: "rgba(220,38,38,0.08)",
        deleteButtonBorder: "rgba(220,38,38,0.25)",
        deleteButtonIcon: "#dc2626",

        addButton: "rgba(255,255,255,0.72)",
        addButtonBorder: "rgba(79,66,125,0.30)",
        addButtonText: "#403465",

        modal: "#f8f6ff",
        modalBorder: "rgba(79,66,125,0.25)",

        input: "rgba(79,66,125,0.07)",
        inputBorder: "rgba(79,66,125,0.25)",
        inputText: "#30284C",
        placeholder: "rgba(48,42,70,0.4)",

        cancelText: "#6D5A9F",
        saveButton: "#8069B3",
        saveButtonText: "#ffffff",

        missed: "#dc2626",
        completed: "#16a34a",
      };

  /* ============================================================
     LIVE CLOCK
     ============================================================ */

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  /* ============================================================
     LOAD DATA
     ============================================================ */

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [storedTasks, storedCategories] = await Promise.all([
          AsyncStorage.getItem(TASKS_STORAGE_KEY),
          AsyncStorage.getItem(CATEGORIES_STORAGE_KEY),
        ]);

        if (!mounted) {
          return;
        }

        /*
         * Load tasks first.
         */
        if (storedTasks) {
          try {
            const parsed = JSON.parse(storedTasks);

            if (Array.isArray(parsed)) {
              const safeTasks: Task[] = parsed.map((task: any) => ({
                id:
                  task?.id ||
                  `${Date.now()}-${Math.random()}`,

                title:
                  typeof task?.title === "string"
                    ? task.title
                    : "Untitled Task",

                date:
                  typeof task?.date === "string" && task.date
                    ? task.date
                    : getTodayKey(),

                time:
                  typeof task?.time === "string" && task.time
                    ? task.time
                    : "12:00",

                category:
                  typeof task?.category === "string" && task.category
                    ? task.category
                    : "Other",

                priority:
                  typeof task?.priority === "string" && task.priority
                    ? task.priority
                    : "Medium",

                completed: Boolean(task?.completed),
              }));

              setTasks(safeTasks);
            }
          } catch (taskError) {
            console.log("Failed to parse stored tasks:", taskError);
          }
        }

        /*
         * Load categories.
         */
        if (storedCategories) {
          try {
            const parsedCategories = JSON.parse(storedCategories);

            if (
              Array.isArray(parsedCategories) &&
              parsedCategories.length > 0
            ) {
              setCategories(parsedCategories);
            }
          } catch (categoryError) {
            console.log(
              "Failed to parse stored categories:",
              categoryError
            );
          }
        }
      } catch (error) {
        console.log("Failed to load Planova data:", error);
      } finally {
        /*
         * VERY IMPORTANT:
         * Saving is not allowed until loading is finished.
         */
        if (mounted) {
          setDataLoaded(true);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  /* ============================================================
     SAVE TASKS
     ============================================================ */

  useEffect(() => {
    /*
     * DO NOT save before the initial load has completed.
     *
     * Without this check, the initial [] state can overwrite
     * the user's existing AsyncStorage data.
     */
    if (!dataLoaded) {
      return;
    }

    AsyncStorage.setItem(
      TASKS_STORAGE_KEY,
      JSON.stringify(tasks)
    ).catch((error) =>
      console.log("Failed to save tasks:", error)
    );
  }, [tasks, dataLoaded]);

  /* ============================================================
     SAVE CATEGORIES
     ============================================================ */

  useEffect(() => {
    if (!dataLoaded) {
      return;
    }

    AsyncStorage.setItem(
      CATEGORIES_STORAGE_KEY,
      JSON.stringify(categories)
    ).catch((error) =>
      console.log("Failed to save categories:", error)
    );
  }, [categories, dataLoaded]);

  /* ============================================================
     CALENDAR DATA
     ============================================================ */

  const weekDates = useMemo(
    () => getWeekDates(selectedDate),
    [selectedDate]
  );

  const monthDates = useMemo(
    () => getMonthDates(selectedDate),
    [selectedDate]
  );

  const selectedDateKey = formatDateKey(selectedDate);

  const hasTasksOnDate = (date: Date) => {
    const dateKey = formatDateKey(date);

    return tasks.some((task) => task.date === dateKey);
  };

  const changeWeek = (direction: number) => {
    const next = new Date(selectedDate);

    next.setDate(next.getDate() + direction * 7);

    setSelectedDate(next);
  };

  const changeMonth = (direction: number) => {
    const next = new Date(selectedDate);

    next.setMonth(next.getMonth() + direction);

    setSelectedDate(next);
  };

  const selectCalendarDate = (date: Date) => {
    const cleanDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );

    setSelectedDate(cleanDate);
  };

  /* ============================================================
     FILTERED TASKS
     ============================================================ */

  const filteredTasks = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return tasks.filter((task) => {
      /*
       * Only show tasks belonging to the selected calendar date.
       */
      const matchesDate = task.date === selectedDateKey;

      if (!matchesDate) {
        return false;
      }

      const matchesSearch =
        !searchValue ||
        task.title.toLowerCase().includes(searchValue) ||
        task.category.toLowerCase().includes(searchValue) ||
        task.priority.toLowerCase().includes(searchValue);

      if (!matchesSearch) {
        return false;
      }

      /*
       * COMPLETE
       */
      if (filter === "Complete") {
        return task.completed;
      }

      /*
       * ONGOING
       *
       * Incomplete AND due time has not passed.
       */
      if (filter === "Ongoing") {
        return (
          !task.completed &&
          !isTaskMissed(task, currentTime)
        );
      }

      /*
       * MISSED
       *
       * Incomplete AND due time has passed.
       */
      if (filter === "Missed") {
        return isTaskMissed(task, currentTime);
      }

      /*
       * ALL
       */
      return true;
    });
  }, [
    tasks,
    search,
    filter,
    selectedDateKey,
    currentTime,
  ]);

  /* ============================================================
     TASK MODAL
     ============================================================ */

  const openAddTask = () => {
    setEditingTask(null);

    setTaskTitle("");
    setTaskDate(formatDateKey(selectedDate));
    setTaskTime("12:00");
    setTaskCategory("Study");
    setTaskPriority("Medium");

    setShowCustomCategoryInput(false);
    setCustomCategory("");

    setShowTaskModal(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);

    setTaskTitle(task.title);
    setTaskDate(task.date || getTodayKey());
    setTaskTime(task.time || "12:00");
    setTaskCategory(task.category || "Other");
    setTaskPriority(task.priority || "Medium");

    setShowCustomCategoryInput(false);
    setCustomCategory("");

    setShowTaskModal(true);
  };

  const addCustomCategory = () => {
    const trimmed = customCategory.trim();

    if (!trimmed) {
      return;
    }

    const alreadyExists = categories.some(
      (category) =>
        category.toLowerCase() === trimmed.toLowerCase()
    );

    if (alreadyExists) {
      setTaskCategory(
        categories.find(
          (category) =>
            category.toLowerCase() === trimmed.toLowerCase()
        ) || trimmed
      );

      setCustomCategory("");
      setShowCustomCategoryInput(false);

      return;
    }

    setCategories((current) => [
      ...current,
      trimmed,
    ]);

    setTaskCategory(trimmed);
    setCustomCategory("");
    setShowCustomCategoryInput(false);
  };

  /* ============================================================
     SAVE TASK
     ============================================================ */

  const saveTask = () => {
    const trimmedTitle = taskTitle.trim();

    if (!trimmedTitle) {
      Alert.alert(
        "Missing Task",
        "Please give your task a name."
      );

      return;
    }

    /*
     * Only accept valid YYYY-MM-DD dates.
     */
    const safeDate =
      /^\d{4}-\d{2}-\d{2}$/.test(taskDate.trim())
        ? taskDate.trim()
        : getTodayKey();

    /*
     * Accept both:
     * 14:30
     * 2:30 PM
     */
    const valid24Hour =
      /^\d{1,2}:\d{2}$/.test(taskTime.trim());

    const valid12Hour =
      /^\d{1,2}:\d{2}\s*(AM|PM)$/i.test(
        taskTime.trim()
      );

    const safeTime =
      valid24Hour || valid12Hour
        ? taskTime.trim()
        : "12:00";

    if (editingTask) {
      setTasks((current) =>
        current.map((task) =>
          task.id === editingTask.id
            ? {
                ...task,
                title: trimmedTitle,
                date: safeDate,
                time: safeTime,
                category: taskCategory,
                priority: taskPriority,
              }
            : task
        )
      );
    } else {
      const newTask: Task = {
        id: `${Date.now()}-${Math.random()}`,
        title: trimmedTitle,
        date: safeDate,
        time: safeTime,
        category: taskCategory,
        priority: taskPriority,
        completed: false,
      };

      setTasks((current) => [
        ...current,
        newTask,
      ]);
    }

    /*
     * Move calendar to the task's date.
     */
    const savedDate = parseDateSafe(safeDate);

    setSelectedDate(
      new Date(
        savedDate.getFullYear(),
        savedDate.getMonth(),
        savedDate.getDate()
      )
    );

    setShowTaskModal(false);
  };

  /* ============================================================
     TOGGLE TASK
     ============================================================ */

  const toggleTask = (id: string) => {
    setTasks((current) =>
      current.map((task) =>
        task.id === id
          ? {
              ...task,
              completed: !task.completed,
            }
          : task
      )
    );
  };

  /* ============================================================
     DELETE TASK
     ============================================================ */

  const deleteTask = (id: string) => {
    Alert.alert(
      "Delete Task",
      "Are you sure you want to delete this task?",
      [
        {
          text: "Keep",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            setTasks((current) =>
              current.filter(
                (task) => task.id !== id
              )
            );
          },
        },
      ]
    );
  };

  /* ============================================================
     TASK STATUS
     ============================================================ */

  const getTaskStatus = (task: Task) => {
    return getTaskStatusValue(
      task,
      currentTime
    );
  };

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <SafeAreaView style={styles.container}>
      <PlanovaHeader />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ======================================================
            CALENDAR
            ====================================================== */}

        <View
          style={[
            styles.calendarCard,
            {
              backgroundColor: colors.calendar,
              borderColor: colors.calendarBorder,
            },
          ]}
        >
          <View style={styles.calendarHeader}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (isMonthExpanded) {
                  changeMonth(-1);
                } else {
                  changeWeek(-1);
                }
              }}
              style={styles.calendarArrow}
            >
              <Ionicons
                name="chevron-back"
                size={22}
                color={
                  isDark
                    ? "#ffffff"
                    : "#403465"
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() =>
                setIsMonthExpanded(
                  (current) => !current
                )
              }
              style={
                styles.calendarTitleContainer
              }
            >
              <Text
                style={[
                  styles.calendarTitle,
                  {
                    color:
                      colors.calendarTitle,
                  },
                ]}
              >
                {MONTHS[
                  selectedDate.getMonth()
                ]}{" "}
                {selectedDate.getFullYear()}
              </Text>

              <Text
                style={[
                  styles.calendarHint,
                  {
                    color: colors.dayLabel,
                  },
                ]}
              >
                {isMonthExpanded
                  ? "Tap to show week"
                  : "Tap to expand"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (isMonthExpanded) {
                  changeMonth(1);
                } else {
                  changeWeek(1);
                }
              }}
              style={styles.calendarArrow}
            >
              <Ionicons
                name="chevron-forward"
                size={22}
                color={
                  isDark
                    ? "#ffffff"
                    : "#403465"
                }
              />
            </TouchableOpacity>
          </View>

          {/* WEEK VIEW */}

          {!isMonthExpanded && (
            <View style={styles.calendarGrid}>
              {weekDates.map((date) => {
                const dateKey =
                  formatDateKey(date);

                const selected =
                  dateKey ===
                  selectedDateKey;

                const today =
                  dateKey ===
                  getTodayKey();

                const hasTasks =
                  hasTasksOnDate(date);

                return (
                  <TouchableOpacity
                    key={dateKey}
                    activeOpacity={0.8}
                    onPress={() =>
                      selectCalendarDate(
                        date
                      )
                    }
                    style={styles.weekDay}
                  >
                    <Text
                      style={[
                        styles.dayLabel,
                        {
                          color:
                            colors.dayLabel,
                        },
                      ]}
                    >
                      {DAYS[
                        date.getDay()
                      ]}
                    </Text>

                    <View
                      style={[
                        styles.dateCircle,
                        selected && {
                          backgroundColor:
                            colors.activeDate,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.dateText,
                          {
                            color: selected
                              ? colors.activeDateText
                              : colors.dateText,
                          },
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                    </View>

                    {hasTasks && (
                      <View
                        style={[
                          styles.taskDot,
                          {
                            backgroundColor:
                              colors.activeDate,
                          },
                        ]}
                      />
                    )}

                    {today &&
                      !hasTasks && (
                        <View
                          style={[
                            styles.todayDot,
                            {
                              backgroundColor:
                                colors.activeDate,
                            },
                          ]}
                        />
                      )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* MONTH VIEW */}

          {isMonthExpanded && (
            <View>
              <View
                style={styles.monthDayLabels}
              >
                {DAYS.map((day) => (
                  <Text
                    key={day}
                    style={[
                      styles.monthDayLabel,
                      {
                        color:
                          colors.dayLabel,
                      },
                    ]}
                  >
                    {day}
                  </Text>
                ))}
              </View>

              <View
                style={styles.monthGrid}
              >
                {monthDates.map(
                  (date, index) => {
                    if (!date) {
                      return (
                        <View
                          key={`empty-${index}`}
                          style={
                            styles.monthDateCell
                          }
                        />
                      );
                    }

                    const dateKey =
                      formatDateKey(date);

                    const selected =
                      dateKey ===
                      selectedDateKey;

                    const today =
                      dateKey ===
                      getTodayKey();

                    const hasTasks =
                      hasTasksOnDate(date);

                    return (
                      <TouchableOpacity
                        key={dateKey}
                        activeOpacity={0.8}
                        onPress={() =>
                          selectCalendarDate(
                            date
                          )
                        }
                        style={
                          styles.monthDateCell
                        }
                      >
                        <View
                          style={[
                            styles.monthDateCircle,
                            selected && {
                              backgroundColor:
                                colors.activeDate,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.monthDateText,
                              {
                                color: selected
                                  ? colors.activeDateText
                                  : colors.dateText,
                              },
                            ]}
                          >
                            {date.getDate()}
                          </Text>
                        </View>

                        {hasTasks && (
                          <View
                            style={[
                              styles.taskDot,
                              {
                                backgroundColor:
                                  colors.activeDate,
                              },
                            ]}
                          />
                        )}

                        {today &&
                          !hasTasks && (
                            <View
                              style={[
                                styles.todayDot,
                                {
                                  backgroundColor:
                                    colors.activeDate,
                                },
                              ]}
                            />
                          )}
                      </TouchableOpacity>
                    );
                  }
                )}
              </View>
            </View>
          )}
        </View>

        {/* ======================================================
            SEARCH
            ====================================================== */}

        <View
          style={[
            styles.constellationLine,
            {
              backgroundColor:
                colors.constellation,
            },
          ]}
        />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search tasks..."
          placeholderTextColor={
            colors.searchPlaceholder
          }
          style={[
            styles.searchInput,
            {
              backgroundColor:
                colors.search,
              borderColor:
                colors.searchBorder,
              color:
                colors.searchText,
            },
          ]}
        />

        {/* ======================================================
            FILTERS
            ====================================================== */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.filterContainer
          }
        >
          {(
            [
              "All",
              "Complete",
              "Ongoing",
              "Missed",
            ] as FilterType[]
          ).map((item) => {
            const active =
              filter === item;

            return (
              <TouchableOpacity
                key={item}
                activeOpacity={0.8}
                onPress={() =>
                  setFilter(item)
                }
                style={[
                  styles.filterButton,
                  {
                    backgroundColor:
                      active
                        ? colors.categoryActive
                        : colors.categoryBackground,

                    borderColor:
                      active
                        ? colors.categoryActive
                        : colors.categoryBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: active
                        ? colors.categoryActiveText
                        : colors.categoryText,
                    },
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* ======================================================
            TASK LIST
            ====================================================== */}

        {filteredTasks.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor:
                  colors.task,
                borderColor:
                  colors.taskBorder,
              },
            ]}
          >
            <Ionicons
              name="planet-outline"
              size={32}
              color={colors.starLogo}
            />

            <Text
              style={[
                styles.emptyTitle,
                {
                  color:
                    colors.taskTitle,
                },
              ]}
            >
              No tasks here yet
            </Text>

            <Text
              style={[
                styles.emptyText,
                {
                  color:
                    colors.taskMeta,
                },
              ]}
            >
              Add something to your cosmic
              to-do list.
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => {
            const status =
              getTaskStatus(task);

            return (
              <View
                key={task.id}
                style={[
                  styles.taskCard,
                  {
                    backgroundColor:
                      colors.task,
                    borderColor:
                      colors.taskBorder,
                  },
                ]}
              >
                <View
                  style={
                    styles.taskTopRow
                  }
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      toggleTask(task.id)
                    }
                    style={[
                      styles.checkbox,
                      {
                        borderColor:
                          task.completed
                            ? colors.completed
                            : colors.taskBorder,

                        backgroundColor:
                          task.completed
                            ? colors.completed
                            : "transparent",
                      },
                    ]}
                  >
                    {task.completed && (
                      <Ionicons
                        name="checkmark"
                        size={16}
                        color={
                          isDark
                            ? "#0e1938"
                            : "#ffffff"
                        }
                      />
                    )}
                  </TouchableOpacity>

                  <View
                    style={
                      styles.taskTitleContainer
                    }
                  >
                    <Text
                      style={[
                        styles.taskTitle,
                        {
                          color:
                            colors.taskTitle,

                          textDecorationLine:
                            task.completed
                              ? "line-through"
                              : "none",

                          opacity:
                            task.completed
                              ? 0.55
                              : 1,
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {task.title}
                    </Text>

                    <Text
                      style={[
                        styles.taskDue,
                        {
                          color:
                            status ===
                            "Missed"
                              ? colors.missed
                              : status ===
                                "Completed"
                              ? colors.completed
                              : colors.taskRemaining,
                        },
                      ]}
                    >
                      {task.date} •{" "}
                      {task.time} •{" "}
                      {status}
                    </Text>
                  </View>

                  <View
                    style={
                      styles.taskActions
                    }
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        openEditTask(task)
                      }
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor:
                            colors.editButton,
                          borderColor:
                            colors.editButtonBorder,
                        },
                      ]}
                    >
                      <Ionicons
                        name="pencil"
                        size={15}
                        color={
                          colors.editButtonIcon
                        }
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        deleteTask(task.id)
                      }
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor:
                            colors.deleteButton,
                          borderColor:
                            colors.deleteButtonBorder,
                        },
                      ]}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={15}
                        color={
                          colors.deleteButtonIcon
                        }
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text
                  style={[
                    styles.taskMeta,
                    {
                      color:
                        colors.taskMeta,
                    },
                  ]}
                >
                  Category:{" "}
                  {task.category} • Priority:{" "}
                  {task.priority}
                </Text>
              </View>
            );
          })
        )}

        {/* ======================================================
            ADD TASK
            ====================================================== */}

        <TouchableOpacity
          activeOpacity={0.8}
          onPress={openAddTask}
          style={[
            styles.addButton,
            {
              backgroundColor:
                colors.addButton,
              borderColor:
                colors.addButtonBorder,
            },
          ]}
        >
          <Ionicons
            name="add"
            size={20}
            color={
              colors.addButtonText
            }
          />

          <Text
            style={[
              styles.addButtonText,
              {
                color:
                  colors.addButtonText,
              },
            ]}
          >
            Add New Task
          </Text>
        </TouchableOpacity>

        <View
          style={[
            styles.constellationLine,
            {
              backgroundColor:
                colors.constellation,
            },
          ]}
        />
      </ScrollView>

      {/* ========================================================
          TASK MODAL
          ======================================================== */}

      <Modal
        visible={showTaskModal}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setShowTaskModal(false)
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor:
                  colors.modal,
                borderColor:
                  colors.modalBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                {
                  color:
                    colors.taskTitle,
                },
              ]}
            >
              {editingTask
                ? "Edit Task"
                : "New Task"}
            </Text>

            <TextInput
              value={taskTitle}
              onChangeText={setTaskTitle}
              placeholder="Task name"
              placeholderTextColor={
                colors.placeholder
              }
              style={[
                styles.modalInput,
                {
                  backgroundColor:
                    colors.input,
                  borderColor:
                    colors.inputBorder,
                  color:
                    colors.inputText,
                },
              ]}
            />

            <TextInput
              value={taskDate}
              onChangeText={setTaskDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={
                colors.placeholder
              }
              style={[
                styles.modalInput,
                {
                  backgroundColor:
                    colors.input,
                  borderColor:
                    colors.inputBorder,
                  color:
                    colors.inputText,
                },
              ]}
            />

            <TextInput
              value={taskTime}
              onChangeText={setTaskTime}
              placeholder="Time e.g. 14:30"
              placeholderTextColor={
                colors.placeholder
              }
              keyboardType="numbers-and-punctuation"
              style={[
                styles.modalInput,
                {
                  backgroundColor:
                    colors.input,
                  borderColor:
                    colors.inputBorder,
                  color:
                    colors.inputText,
                },
              ]}
            />

            <Text
              style={[
                styles.modalLabel,
                {
                  color:
                    colors.taskMeta,
                },
              ]}
            >
              Category
            </Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={
                false
              }
              contentContainerStyle={
                styles.modalOptions
              }
            >
              {categories.map(
                (category) => {
                  const active =
                    taskCategory ===
                    category;

                  return (
                    <TouchableOpacity
                      key={category}
                      activeOpacity={0.8}
                      onPress={() =>
                        setTaskCategory(
                          category
                        )
                      }
                      style={[
                        styles.optionButton,
                        {
                          backgroundColor:
                            active
                              ? colors.categoryActive
                              : colors.categoryBackground,

                          borderColor:
                            active
                              ? colors.categoryActive
                              : colors.categoryBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color: active
                              ? colors.categoryActiveText
                              : colors.categoryText,
                          },
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setShowCustomCategoryInput(
                    true
                  );
                  setCustomCategory("");
                }}
                style={[
                  styles.categoryPlusButton,
                  {
                    backgroundColor:
                      colors.categoryBackground,
                    borderColor:
                      colors.categoryBorder,
                  },
                ]}
              >
                <Ionicons
                  name="add"
                  size={18}
                  color={
                    colors.categoryText
                  }
                />
              </TouchableOpacity>
            </ScrollView>

            {showCustomCategoryInput && (
              <View
                style={
                  styles.customCategoryContainer
                }
              >
                <TextInput
                  autoFocus
                  value={customCategory}
                  onChangeText={
                    setCustomCategory
                  }
                  placeholder="New category..."
                  placeholderTextColor={
                    colors.placeholder
                  }
                  onSubmitEditing={
                    addCustomCategory
                  }
                  returnKeyType="done"
                  style={[
                    styles.customCategoryInput,
                    {
                      backgroundColor:
                        colors.input,
                      borderColor:
                        colors.inputBorder,
                      color:
                        colors.inputText,
                    },
                  ]}
                />

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={
                    addCustomCategory
                  }
                  style={[
                    styles.customCategorySave,
                    {
                      backgroundColor:
                        colors.categoryActive,
                    },
                  ]}
                >
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={
                      colors.categoryActiveText
                    }
                  />
                </TouchableOpacity>
              </View>
            )}

            <Text
              style={[
                styles.modalLabel,
                {
                  color:
                    colors.taskMeta,
                },
              ]}
            >
              Priority
            </Text>

            <View
              style={
                styles.priorityRow
              }
            >
              {PRIORITIES.map(
                (priority) => {
                  const active =
                    taskPriority ===
                    priority;

                  return (
                    <TouchableOpacity
                      key={priority}
                      activeOpacity={0.8}
                      onPress={() =>
                        setTaskPriority(
                          priority
                        )
                      }
                      style={[
                        styles.optionButton,
                        {
                          flex: 1,

                          backgroundColor:
                            active
                              ? colors.categoryActive
                              : colors.categoryBackground,

                          borderColor:
                            active
                              ? colors.categoryActive
                              : colors.categoryBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          {
                            color: active
                              ? colors.categoryActiveText
                              : colors.categoryText,
                          },
                        ]}
                      >
                        {priority}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>

            <View
              style={
                styles.modalActions
              }
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  setShowTaskModal(false)
                }
                style={
                  styles.cancelModalButton
                }
              >
                <Text
                  style={[
                    styles.cancelModalText,
                    {
                      color:
                        colors.cancelText,
                    },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={saveTask}
                style={[
                  styles.saveButton,
                  {
                    backgroundColor:
                      colors.saveButton,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.saveButtonText,
                    {
                      color:
                        colors.saveButtonText,
                    },
                  ]}
                >
                  {editingTask
                    ? "Save Changes"
                    : "Add Task"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ==============================================================
   STYLES
   ============================================================== */

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

  calendarCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
  },

  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  calendarArrow: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },

  calendarTitleContainer: {
    alignItems: "center",
    justifyContent: "center",
  },

  calendarTitle: {
    fontFamily: "BitterBold",
    fontSize: 18,
  },

  calendarHint: {
    fontFamily: "Bitter",
    fontSize: 9,
    marginTop: 3,
    opacity: 0.8,
  },

  calendarGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  weekDay: {
    width: "13%",
    alignItems: "center",
  },

  dayLabel: {
    fontFamily: "BitterBold",
    textAlign: "center",
    fontSize: 11,
    marginBottom: 8,
  },

  dateCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  dateText: {
    fontFamily: "Bitter",
    fontSize: 14,
  },

  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },

  taskDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 3,
  },

  monthDayLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  monthDayLabel: {
    width: "14.28%",
    textAlign: "center",
    fontFamily: "BitterBold",
    fontSize: 10,
  },

  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  monthDateCell: {
    width: "14.28%",
    height: 52,
    alignItems: "center",
    justifyContent: "flex-start",
  },

  monthDateCircle: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  monthDateText: {
    fontFamily: "Bitter",
    fontSize: 13,
  },

  constellationLine: {
    width: "60%",
    height: 1,
    alignSelf: "center",
    marginBottom: 24,
  },

  searchInput: {
    fontFamily: "Bitter",
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 12,
  },

  filterContainer: {
    gap: 8,
    paddingBottom: 20,
  },

  filterButton: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },

  filterText: {
    fontFamily: "BitterBold",
    fontSize: 12,
  },

  taskCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },

  taskTopRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    flexShrink: 0,
  },

  taskTitleContainer: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
  },

  taskTitle: {
    fontFamily: "BitterBold",
    fontSize: 15,
  },

  taskDue: {
    fontFamily: "Bitter",
    fontSize: 11,
    marginTop: 4,
  },

  taskActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexShrink: 0,
  },

  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  taskMeta: {
    fontFamily: "Bitter",
    marginTop: 10,
    fontSize: 12,
    lineHeight: 18,
  },

  emptyCard: {
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  emptyTitle: {
    fontFamily: "BitterBold",
    fontSize: 16,
    marginTop: 10,
  },

  emptyText: {
    fontFamily: "Bitter",
    fontSize: 12,
    marginTop: 5,
    textAlign: "center",
  },

  addButton: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 22,
    paddingVertical: 13,
    marginTop: 8,
    marginBottom: 28,
  },

  addButtonText: {
    fontFamily: "BitterBold",
    fontSize: 15,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 430,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },

  modalTitle: {
    fontFamily: "BitterBold",
    fontSize: 22,
    marginBottom: 18,
  },

  modalInput: {
    fontFamily: "Bitter",
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    marginBottom: 10,
  },

  modalLabel: {
    fontFamily: "BitterBold",
    fontSize: 12,
    marginTop: 5,
    marginBottom: 8,
  },

  modalOptions: {
    gap: 7,
    paddingBottom: 4,
    paddingRight: 4,
  },

  optionButton: {
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  optionText: {
    fontFamily: "BitterBold",
    fontSize: 11,
  },

  categoryPlusButton: {
    width: 34,
    height: 34,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  customCategoryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginTop: 8,
  },

  customCategoryInput: {
    flex: 1,
    fontFamily: "Bitter",
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
  },

  customCategorySave: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },

  priorityRow: {
    flexDirection: "row",
    gap: 7,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },

  cancelModalButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  cancelModalText: {
    fontFamily: "BitterBold",
    fontSize: 13,
  },

  saveButton: {
    borderRadius: 13,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },

  saveButtonText: {
    fontFamily: "BitterBold",
    fontSize: 13,
  },
});