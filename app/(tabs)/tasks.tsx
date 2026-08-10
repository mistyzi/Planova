import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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

const tasks = [
  {
    title: "Submit Project Proposal",
    due: "Due in 0 days",
    category: "School",
    priority: "High",
  },
  {
    title: "Review Lecture Notes",
    due: "Due in 3 days",
    category: "Study",
    priority: "Medium",
  },
  {
    title: "Debug UI Layout",
    due: "Due in 5 days",
    category: "Coding",
    priority: "Low",
  },
  {
    title: "Refactor Components",
    due: "Due in 11 days",
    category: "Coding",
    priority: "High",
  },
];

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dates = ["19", "20", "21", "22", "23", "24", "25"];

export default function TasksScreen() {
  const [search, setSearch] = useState("");
  const { isDark } = useTheme();

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
        task: "rgba(14,25,56,0.55)",
        taskBorder: "rgba(196,181,253,0.28)",
        taskTitle: "#ffffff",
        taskRemaining: "rgba(255,255,255,0.6)",
        taskMeta: "rgba(255,255,255,0.75)",
        completeButton: "rgba(255,255,255,0.12)",
        completeButtonBorder: "rgba(196,181,253,0.35)",
        completeButtonText: "#ffffff",
        editButton: "rgba(255,255,255,0.10)",
        editButtonBorder: "rgba(196,181,253,0.30)",
        editButtonIcon: "#ffffff",
        addButton: "rgba(14,25,56,0.55)",
        addButtonBorder: "rgba(196,181,253,0.28)",
        addButtonText: "#ffffff",
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
        task: "rgba(255,255,255,0.72)",
        taskBorder: "rgba(79,66,125,0.30)",
        taskTitle: "#30284C",
        taskRemaining: "rgba(48,42,70,0.58)",
        taskMeta: "rgba(48,42,70,0.76)",
        completeButton: "rgba(79,66,125,0.14)",
        completeButtonBorder: "rgba(79,66,125,0.38)",
        completeButtonText: "#3D3262",
        editButton: "rgba(79,66,125,0.10)",
        editButtonBorder: "rgba(79,66,125,0.30)",
        editButtonIcon: "#403465",
        addButton: "rgba(255,255,255,0.72)",
        addButtonBorder: "rgba(79,66,125,0.30)",
        addButtonText: "#403465",
      };

  return (
    <SafeAreaView style={styles.container}>
      <PlanovaHeader />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            <TouchableOpacity activeOpacity={0.8}>
              <Ionicons
                name="chevron-back"
                size={22}
                color={isDark ? "#ffffff" : "#403465"}
              />
            </TouchableOpacity>
            <Text
              style={[styles.calendarTitle, { color: colors.calendarTitle }]}
            >
              July 2026
            </Text>
            <TouchableOpacity activeOpacity={0.8}>
              <Ionicons
                name="chevron-forward"
                size={22}
                color={isDark ? "#ffffff" : "#403465"}
              />
            </TouchableOpacity>
          </View>
          <View style={styles.calendarGrid}>
            {days.map((day) => (
              <Text
                key={day}
                style={[styles.dayLabel, { color: colors.dayLabel }]}
              >
                {day}
              </Text>
            ))}
            {dates.map((date) => (
              <View
                key={date}
                style={
                  date === "24"
                    ? [
                        styles.activeDate,
                        { backgroundColor: colors.activeDate },
                      ]
                    : styles.dateCell
                }
              >
                <Text
                  style={
                    date === "24"
                      ? [
                          styles.activeDateText,
                          { color: colors.activeDateText },
                        ]
                      : [styles.dateText, { color: colors.dateText }]
                  }
                >
                  {date}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <View
          style={[
            styles.constellationLine,
            { backgroundColor: colors.constellation },
          ]}
        />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search tasks..."
          placeholderTextColor={colors.searchPlaceholder}
          style={[
            styles.searchInput,
            {
              backgroundColor: colors.search,
              borderColor: colors.searchBorder,
              color: colors.searchText,
            },
          ]}
        />
        {tasks.map((task, index) => (
          <View
            key={index}
            style={[
              styles.taskCard,
              {
                backgroundColor: colors.task,
                borderColor: colors.taskBorder,
              },
            ]}
          >
            <View style={styles.taskHeader}>
              <Text style={[styles.taskTitle, { color: colors.taskTitle }]}>
                {task.title}
              </Text>
              <Text style={[styles.taskDue, { color: colors.taskRemaining }]}>
                {task.due}
              </Text>
            </View>
            <Text style={[styles.taskMeta, { color: colors.taskMeta }]}>
              Category: {task.category} • Priority: {task.priority}
            </Text>
            <View style={styles.taskActions}>
              <TouchableOpacity
                style={[
                  styles.completeButton,
                  {
                    backgroundColor: colors.completeButton,
                    borderColor: colors.completeButtonBorder,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.completeButtonText,
                    { color: colors.completeButtonText },
                  ]}
                >
                  Mark Complete
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.editButton,
                  {
                    backgroundColor: colors.editButton,
                    borderColor: colors.editButtonBorder,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="pencil"
                  size={16}
                  color={colors.editButtonIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity
          style={[
            styles.addButton,
            {
              backgroundColor: colors.addButton,
              borderColor: colors.addButtonBorder,
            },
          ]}
          activeOpacity={0.8}
        >
          <Text style={[styles.addButtonText, { color: colors.addButtonText }]}>
            + Add New Task
          </Text>
        </TouchableOpacity>
        <View
          style={[
            styles.constellationLine,
            { backgroundColor: colors.constellation },
          ]}
        />
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
  calendarTitle: {
    fontFamily: "BitterBold",
    fontSize: 18,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dayLabel: {
    fontFamily: "BitterBold",
    width: "14%",
    textAlign: "center",
    fontSize: 12,
    marginBottom: 10,
  },
  dateCell: {
    width: "14%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  dateText: {
    fontFamily: "Bitter",
    fontSize: 14,
  },
  activeDate: {
    width: "14%",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeDateText: {
    fontFamily: "BitterBold",
    fontSize: 14,
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
    marginBottom: 20,
  },
  taskCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  taskHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  taskTitle: {
    fontFamily: "BitterBold",
    flex: 1,
    fontSize: 15,
    marginRight: 12,
  },
  taskDue: {
    fontFamily: "Bitter",
    fontSize: 12,
    textAlign: "right",
  },
  taskMeta: {
    fontFamily: "Bitter",
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
  },
  taskActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
  },
  completeButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  completeButtonText: {
    fontFamily: "BitterBold",
    fontSize: 13,
  },
  editButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  addButton: {
    alignSelf: "center",
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 28,
  },
  addButtonText: {
    fontFamily: "BitterBold",
    fontSize: 15,
  },
});
