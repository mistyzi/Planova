import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const tasks = [
  { title: 'Submit Project Proposal', remaining: '0 Days Remaining' },
  { title: 'Review Lecture Notes', remaining: '3 Days Remaining' },
  { title: 'Debug UI Layout', remaining: '5 Days Remaining' },
];

export default function HomeScreen() {
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

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome Back, Celestia!</Text>
          <Text style={styles.welcomeSubtitle}>
            Your Starpath awaits, let's make today luminous.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Schedule Overview</Text>

          <Text style={styles.cardText}>
            Your productivity trends indicate a high focus window today from
            <Text style={styles.bold}> 07:30–08:00 AM</Text>.
          </Text>

          <Text style={[styles.cardText, { marginTop: 10 }]}>
            This is the ideal time for deep work and analytical tasks.
          </Text>

          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>✦ Start Working</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>✦ View Schedule</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.alignmentSection}>
          <Text style={styles.alignmentTitle}>.⋆˚✦. DAILY ALIGNMENT .✦˚⋆.</Text>
          <Text style={styles.alignmentText}>
            The universe conspires for your focus today.
            {'\n'}
            Your academic journey is written in the stars.
          </Text>
        </View>

        <View style={styles.constellationLine} />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Starpath Progress</Text>

          <View style={styles.streakBox}>
            <Text style={styles.streakLabel}>✦ Current Streak ✦</Text>
            <Text style={styles.streakValue}>4 Days</Text>
            <Text style={styles.streakHint}>
              Keep shining — consistency builds galaxies.
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View style={styles.progressFill} />
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statText}>Completed: <Text style={styles.bold}>6</Text></Text>
            <Text style={styles.statText}>Remaining: <Text style={styles.bold}>3</Text></Text>
            <Text style={styles.statText}>Goal: <Text style={styles.bold}>10</Text></Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Galaxy Goals</Text>

          <View style={styles.chipRow}>
            <View style={styles.chip}>
              <Text style={styles.chipText}>✦ 1 Due Today</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>✦ 0 Overdue</Text>
            </View>
            <View style={styles.chip}>
              <Text style={styles.chipText}>✦ 4 Upcoming</Text>
            </View>
          </View>

          {tasks.map((task, index) => (
            <View key={index} style={styles.taskItem}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskRemaining}>{task.remaining}</Text>
            </View>
          ))}

          <View style={styles.seeMoreRow}>
            <TouchableOpacity style={styles.seeMoreButton}>
              <Text style={styles.seeMoreText}>See More →</Text>
            </TouchableOpacity>
          </View>
        </View>

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
    marginBottom: 20,
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

  welcomeSection: {
    alignItems: 'center',
    marginBottom: 18,
  },

  welcomeTitle: {
    fontSize: 24,
    color: '#e9d5ff',
    fontWeight: '700',
    textAlign: 'center',
  },

  welcomeSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    lineHeight: 20,
  },

  card: {
    backgroundColor: 'rgba(14,25,56,0.55)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.28)',
    padding: 22,
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 20,
    color: '#e9d5ff',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },

  cardText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 22,
  },

  bold: {
    fontWeight: '700',
    color: '#ffffff',
  },

  primaryButton: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.35)',
    paddingVertical: 12,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },

  alignmentSection: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },

  alignmentTitle: {
    fontSize: 18,
    color: '#e9d5ff',
    fontWeight: '700',
    textAlign: 'center',
  },

  alignmentText: {
    marginTop: 10,
    fontSize: 16,
    color: 'rgba(255,255,255,0.92)',
    textAlign: 'center',
    lineHeight: 24,
  },

  constellationLine: {
    alignSelf: 'center',
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(196,181,253,0.45)',
    marginBottom: 22,
  },

  streakBox: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 260,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.35)',
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 18,
  },

  streakLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
    letterSpacing: 0.5,
  },

  streakValue: {
    marginTop: 8,
    fontSize: 34,
    color: '#e9d5ff',
    fontWeight: '700',
  },

  streakHint: {
    marginTop: 6,
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    textAlign: 'center',
    lineHeight: 18,
  },

  progressTrack: {
    width: '100%',
    height: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.28)',
  },

  progressFill: {
    width: '60%',
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#8b5cf6',
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },

  statText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 14,
  },

  chip: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    marginBottom: 8,
  },

  chipText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.86)',
    fontWeight: '600',
  },

  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.28)',
    padding: 14,
    marginBottom: 12,
  },

  taskTitle: {
    flex: 1,
    fontSize: 15,
    color: '#f5f3ff',
    fontWeight: '600',
    marginRight: 12,
  },

  taskRemaining: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    textAlign: 'right',
  },

  seeMoreRow: {
    alignItems: 'flex-end',
    marginTop: 4,
  },

  seeMoreButton: {
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.35)',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  seeMoreText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
});