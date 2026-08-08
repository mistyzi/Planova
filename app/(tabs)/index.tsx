import React from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useProfileSheet } from '../../components/profilesheetcontext';
import { useTheme } from '../../components/themecontext';

const tasks = [
  {
    title: 'Submit Project Proposal',
    remaining: '0 Days Remaining',
  },
  {
    title: 'Review Lecture Notes',
    remaining: '3 Days Remaining',
  },
  {
    title: 'Debug UI Layout',
    remaining: '5 Days Remaining',
  },
];

export default function HomeScreen() {
  const { openProfile } = useProfileSheet();
  const { isDark } = useTheme();

  const colors = isDark
    ? {
        logo: '#e9d5ff',
        iconBackground: 'rgba(255,255,255,0.12)',
        iconBorder: 'rgba(196,181,253,0.35)',
        badge: '#d8b4fe',
        badgeText: '#0e1938',
        welcomeTitle: '#e9d5ff',
        welcomeSubtitle: 'rgba(255,255,255,0.8)',
        card: 'rgba(14,25,56,0.55)',
        cardBorder: 'rgba(196,181,253,0.28)',
        cardTitle: '#e9d5ff',
        cardText: 'rgba(255,255,255,0.9)',
        bold: '#ffffff',
        button: 'rgba(255,255,255,0.12)',
        buttonBorder: 'rgba(196,181,253,0.35)',
        buttonText: '#ffffff',
        alignmentTitle: '#e9d5ff',
        alignmentText: 'rgba(255,255,255,0.92)',
        constellation: 'rgba(196,181,253,0.45)',
        streakBox: 'rgba(255,255,255,0.10)',
        streakBorder: 'rgba(196,181,253,0.35)',
        streakLabel: 'rgba(255,255,255,0.82)',
        streakValue: '#e9d5ff',
        streakHint: 'rgba(255,255,255,0.65)',
        progressTrack: 'rgba(255,255,255,0.12)',
        progressBorder: 'rgba(196,181,253,0.28)',
        progressFill: '#8b5cf6',
        statText: 'rgba(255,255,255,0.82)',
        chip: 'rgba(255,255,255,0.10)',
        chipBorder: 'rgba(196,181,253,0.35)',
        chipText: 'rgba(255,255,255,0.86)',
        task: 'rgba(255,255,255,0.10)',
        taskBorder: 'rgba(196,181,253,0.28)',
        taskTitle: '#f5f3ff',
        taskRemaining: 'rgba(255,255,255,0.55)',
        seeMore: 'rgba(255,255,255,0.10)',
        seeMoreBorder: 'rgba(196,181,253,0.35)',
        seeMoreText: '#ffffff',
      }
    : {
        logo: '#4F427D',
        iconBackground: 'rgba(70,58,120,0.18)',
        iconBorder: 'rgba(79,66,125,0.40)',
        badge: '#B9A9DF',
        badgeText: '#29233F',
        welcomeTitle: '#403465',
        welcomeSubtitle: 'rgba(48,42,70,0.78)',
        card: 'rgba(255,255,255,0.72)',
        cardBorder: 'rgba(79,66,125,0.30)',
        cardTitle: '#403465',
        cardText: 'rgba(48,42,70,0.88)',
        bold: '#2F274D',
        button: 'rgba(79,66,125,0.14)',
        buttonBorder: 'rgba(79,66,125,0.38)',
        buttonText: '#3D3262',
        alignmentTitle: '#4F427D',
        alignmentText: 'rgba(48,42,70,0.86)',
        constellation: 'rgba(79,66,125,0.40)',
        streakBox: 'rgba(79,66,125,0.10)',
        streakBorder: 'rgba(79,66,125,0.30)',
        streakLabel: 'rgba(48,42,70,0.76)',
        streakValue: '#4F427D',
        streakHint: 'rgba(48,42,70,0.62)',
        progressTrack: 'rgba(79,66,125,0.12)',
        progressBorder: 'rgba(79,66,125,0.28)',
        progressFill: '#8b5cf6',
        statText: 'rgba(48,42,70,0.76)',
        chip: 'rgba(79,66,125,0.10)',
        chipBorder: 'rgba(79,66,125,0.30)',
        chipText: '#403465',
        task: 'rgba(79,66,125,0.08)',
        taskBorder: 'rgba(79,66,125,0.26)',
        taskTitle: '#30284C',
        taskRemaining: 'rgba(48,42,70,0.58)',
        seeMore: 'rgba(79,66,125,0.12)',
        seeMoreBorder: 'rgba(79,66,125,0.32)',
        seeMoreText: '#403465',
      };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <MaterialCommunityIcons name="star-four-points" size={24} color={isDark ? '#c4b5fd' : '#6D5A9F'} />
            <Text style={[styles.logoText, { color: colors.logo }]}>PLANOVA</Text>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity
              style={[styles.iconBubble, { backgroundColor: colors.iconBackground, borderColor: colors.iconBorder }]}
            >
              <Ionicons name="notifications" size={18} color="#ffffff" />
              <View style={[styles.badge, { backgroundColor: colors.badge }]}>
                <Text style={[styles.badgeText, { color: colors.badgeText }]}>✦</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBubble, { backgroundColor: colors.iconBackground, borderColor: colors.iconBorder }]}
              onPress={openProfile}
              activeOpacity={0.8}
            >
              <Ionicons name="person" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.welcomeTitle }]}>Welcome Back, Celestia!</Text>
          <Text style={[styles.welcomeSubtitle, { color: colors.welcomeSubtitle }]}>
            Your Starpath awaits, let's make today luminous.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.cardTitle }]}>Schedule Overview</Text>
          <Text style={[styles.cardText, { color: colors.cardText }]}>
            Your productivity trends indicate a high focus window today from
            <Text style={[styles.bold, { color: colors.bold }]}> 07:30–08:00 AM</Text>.
          </Text>
          <Text style={[styles.cardText, { color: colors.cardText, marginTop: 10 }]}>
            This is the ideal time for deep work and analytical tasks.
          </Text>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.button, borderColor: colors.buttonBorder }]}
          >
            <Text style={[styles.primaryButtonText, { color: colors.buttonText }]}>✦ Start Working</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.button, borderColor: colors.buttonBorder }]}
          >
            <Text style={[styles.primaryButtonText, { color: colors.buttonText }]}>✦ View Schedule</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.alignmentSection}>
          <Text style={[styles.alignmentTitle, { color: colors.alignmentTitle }]}>.⋆˚✦. DAILY ALIGNMENT .✦˚⋆.</Text>
          <Text style={[styles.alignmentText, { color: colors.alignmentText }]}>
            The universe conspires for your focus today.
            {'\n'}Your academic journey is written in the stars.
          </Text>
        </View>

        <View style={[styles.constellationLine, { backgroundColor: colors.constellation }]} />

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.cardTitle }]}>Weekly Starpath Progress</Text>
          <View style={[styles.streakBox, { backgroundColor: colors.streakBox, borderColor: colors.streakBorder }]}>
            <Text style={[styles.streakLabel, { color: colors.streakLabel }]}>✦ Current Streak ✦</Text>
            <Text style={[styles.streakValue, { color: colors.streakValue }]}>4 Days</Text>
            <Text style={[styles.streakHint, { color: colors.streakHint }]}>
              Keep shining — consistency builds galaxies.
            </Text>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: colors.progressTrack, borderColor: colors.progressBorder }]}>
            <View style={[styles.progressFill, { backgroundColor: colors.progressFill }]} />
          </View>
          <View style={styles.statsRow}>
            <Text style={[styles.statText, { color: colors.statText }]}>
              Completed: <Text style={[styles.bold, { color: colors.bold }]}>6</Text>
            </Text>
            <Text style={[styles.statText, { color: colors.statText }]}>
              Remaining: <Text style={[styles.bold, { color: colors.bold }]}>3</Text>
            </Text>
            <Text style={[styles.statText, { color: colors.statText }]}>
              Goal: <Text style={[styles.bold, { color: colors.bold }]}>10</Text>
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Text style={[styles.cardTitle, { color: colors.cardTitle }]}>Weekly Galaxy Goals</Text>
          <View style={styles.chipRow}>
            <View style={[styles.chip, { backgroundColor: colors.chip, borderColor: colors.chipBorder }]}>
              <Text style={[styles.chipText, { color: colors.chipText }]}>✦ 1 Due Today</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: colors.chip, borderColor: colors.chipBorder }]}>
              <Text style={[styles.chipText, { color: colors.chipText }]}>✦ 0 Overdue</Text>
            </View>
            <View style={[styles.chip, { backgroundColor: colors.chip, borderColor: colors.chipBorder }]}>
              <Text style={[styles.chipText, { color: colors.chipText }]}>✦ 4 Upcoming</Text>
            </View>
          </View>
          {tasks.map((task, index) => (
            <View key={index} style={[styles.taskItem, { backgroundColor: colors.task, borderColor: colors.taskBorder }]}>
              <Text style={[styles.taskTitle, { color: colors.taskTitle }]}>{task.title}</Text>
              <Text style={[styles.taskRemaining, { color: colors.taskRemaining }]}>{task.remaining}</Text>
            </View>
          ))}
          <View style={styles.seeMoreRow}>
            <TouchableOpacity
              style={[styles.seeMoreButton, { backgroundColor: colors.seeMore, borderColor: colors.seeMoreBorder }]}
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
    fontFamily: 'MysteryQuest',
    marginLeft: 8,
    fontSize: 28,
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
    borderWidth: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: 'BitterBold',
    fontSize: 9,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 18,
  },
  welcomeTitle: {
    fontFamily: 'BitterBold',
    fontSize: 24,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontFamily: 'Bitter',
    marginTop: 6,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 22,
    marginBottom: 20,
  },
  cardTitle: {
    fontFamily: 'BitterBold',
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 14,
  },
  cardText: {
    fontFamily: 'Bitter',
    fontSize: 15,
    lineHeight: 22,
  },
  bold: {
    fontFamily: 'BitterBold',
  },
  primaryButton: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: 'BitterBold',
    fontSize: 14,
  },
  alignmentSection: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  alignmentTitle: {
    fontFamily: 'BitterBold',
    fontSize: 18,
    textAlign: 'center',
  },
  alignmentText: {
    fontFamily: 'Bitter',
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  constellationLine: {
    alignSelf: 'center',
    width: '60%',
    height: 1,
    marginBottom: 22,
  },
  streakBox: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 260,
    borderRadius: 22,
    borderWidth: 1,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 18,
  },
  streakLabel: {
    fontFamily: 'Bitter',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  streakValue: {
    fontFamily: 'BitterBold',
    marginTop: 8,
    fontSize: 34,
  },
  streakHint: {
    fontFamily: 'Bitter',
    marginTop: 6,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  progressTrack: {
    width: '100%',
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
  },
  progressFill: {
    width: '60%',
    height: '100%',
    borderRadius: 999,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  statText: {
    fontFamily: 'Bitter',
    fontSize: 13,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 14,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 4,
    marginBottom: 8,
  },
  chipText: {
    fontFamily: 'BitterBold',
    fontSize: 12,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  taskTitle: {
    fontFamily: 'BitterBold',
    flex: 1,
    fontSize: 15,
    marginRight: 12,
  },
  taskRemaining: {
    fontFamily: 'Bitter',
    fontSize: 12,
    textAlign: 'right',
  },
  seeMoreRow: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  seeMoreButton: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  seeMoreText: {
    fontFamily: 'BitterBold',
    fontSize: 13,
  },
});