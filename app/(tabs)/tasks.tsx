import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const tasks = [
  {
    title: 'Submit Project Proposal',
    due: 'Due in 0 days',
    category: 'School',
    priority: 'High',
  },
  {
    title: 'Review Lecture Notes',
    due: 'Due in 3 days',
    category: 'Study',
    priority: 'Medium',
  },
  {
    title: 'Debug UI Layout',
    due: 'Due in 5 days',
    category: 'Coding',
    priority: 'Low',
  },
  {
    title: 'Refactor Components',
    due: 'Due in 11 days',
    category: 'Coding',
    priority: 'High',
  },
];

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dates = ['19', '20', '21', '22', '23', '24', '25'];

export default function TasksScreen() {
  const [search, setSearch] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <MaterialCommunityIcons
              name="star-four-points"
              size={24}
              color="#c4b5fd"
            />
            <Text style={styles.logoText}>PLANOVA</Text>
          </View>

          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBubble}>
              <Ionicons name="notifications" size={18} color="#ffffff" />
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✦</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBubble}>
              <Ionicons name="person" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.calendarCard}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity>
              <Ionicons name="chevron-back" size={22} color="#ffffff" />
            </TouchableOpacity>

            <Text style={styles.calendarTitle}>July 2026</Text>

            <TouchableOpacity>
              <Ionicons name="chevron-forward" size={22} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarGrid}>
            {days.map((day) => (
              <Text key={day} style={styles.dayLabel}>
                {day}
              </Text>
            ))}

            {dates.map((date) => (
              <View
                key={date}
                style={date === '24' ? styles.activeDate : styles.dateCell}
              >
                <Text
                  style={date === '24' ? styles.activeDateText : styles.dateText}
                >
                  {date}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.constellationLine} />

        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search tasks..."
          placeholderTextColor="rgba(255,255,255,0.45)"
          style={styles.searchInput}
        />

        {tasks.map((task, index) => (
          <View key={index} style={styles.taskCard}>
            <View style={styles.taskHeader}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskDue}>{task.due}</Text>
            </View>

            <Text style={styles.taskMeta}>
              Category: {task.category} • Priority: {task.priority}
            </Text>

            <View style={styles.taskActions}>
              <TouchableOpacity style={styles.completeButton}>
                <Text style={styles.completeButtonText}>Mark Complete</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="pencil" size={16} color="#ffffff" />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add New Task</Text>
        </TouchableOpacity>

        <View style={styles.constellationLine} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  logoText: {
    marginLeft: 8,
    fontSize: 28,
    color: '#e9d5ff',
    fontWeight: '700',
    letterSpacing: 1,
  },

  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },

  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#d8b4fe',
    alignItems: 'center',
    justifyContent: 'center',
  },

  badgeText: {
    fontSize: 9,
    color: '#0e1938',
    fontWeight: '700',
  },

  calendarCard: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.30)',
    padding: 20,
    marginBottom: 20,
  },

  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },

  calendarTitle: {
    fontSize: 18,
    color: '#ffffff',
    fontWeight: '700',
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  dayLabel: {
    width: '14%',
    textAlign: 'center',
    color: '#d8b4fe',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 10,
  },

  dateCell: {
    width: '14%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },

  dateText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
  },

  activeDate: {
    width: '14%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#d8b4fe',
  },

  activeDateText: {
    color: '#0e1938',
    fontSize: 14,
    fontWeight: '700',
  },

  constellationLine: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(196,181,253,0.45)',
    alignSelf: 'center',
    marginBottom: 24,
  },

  searchInput: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.30)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 20,
  },

  taskCard: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.30)',
    padding: 18,
    marginBottom: 16,
  },

  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  taskTitle: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 12,
  },

  taskDue: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
  },

  taskMeta: {
    marginTop: 8,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    lineHeight: 18,
  },

  taskActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },

  completeButton: {
    backgroundColor: 'rgba(168,85,247,0.22)',
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.35)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  completeButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },

  editButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  addButton: {
    alignSelf: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.35)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 28,
  },

  addButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  navWrapper: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 16,
    borderRadius: 999,
    padding: 2,
    backgroundColor: '#8b5cf6',
  },
});