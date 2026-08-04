import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const presets = [
  {
    name: 'Mercury',
    time: '20 min',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/4a/Mercury_in_true_color.jpg',
  },
  {
    name: 'Mars',
    time: '40 min',
    image: 'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg',
  },
  {
    name: 'Venus',
    time: '60 min',
    image: 'https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg',
  },
  {
    name: 'Earth',
    time: '80 min',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg',
  },
  {
    name: 'Neptune',
    time: '100 min',
    image: 'https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg',
  },
  {
    name: 'Uranus',
    time: '120 min',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg',
  },
];

const quickTimes = [5, 10, 15, 30, 45, 60];

export default function TimerScreen() {
  const [customMinutes, setCustomMinutes] = useState('');

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

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Choose a Cosmic Focus Preset
          </Text>

          <View style={styles.constellationLine} />

          <View style={styles.grid}>
            {presets.map((preset, index) => (
              <TouchableOpacity key={index} style={styles.planetCard}>
                <View style={styles.planetGlow} />
                <Image source={{ uri: preset.image }} style={styles.planetImage} />
                <Text style={styles.planetText}>
                  {preset.name}
                  {'\n'}
                  ✦ {preset.time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Choose a Custom Cosmic Focus
          </Text>

          <View style={styles.constellationLine} />

          <View style={styles.customCard}>
            <Text style={styles.inputLabel}>
              Enter your study time (minutes)
            </Text>

            <TextInput
              value={customMinutes}
              onChangeText={setCustomMinutes}
              placeholder="e.g., 45"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="numeric"
              style={styles.input}
            />

            <TouchableOpacity style={styles.startButton}>
              <Text style={styles.startButtonText}>Start Timer</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.quickGrid}>
            {quickTimes.map((time) => (
              <TouchableOpacity key={time} style={styles.quickButton}>
                <Text style={styles.quickButtonText}>{time} min</Text>
              </TouchableOpacity>
            ))}
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

  section: {
    marginBottom: 28,
    alignItems: 'center',
  },

  sectionTitle: {
    fontSize: 22,
    color: '#e9d5ff',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },

  constellationLine: {
    width: '60%',
    height: 1,
    backgroundColor: 'rgba(196,181,253,0.45)',
    alignSelf: 'center',
    marginBottom: 20,
  },

  grid: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  planetCard: {
    width: '31%',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.35)',
    paddingVertical: 18,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: 16,
  },

  planetGlow: {
    position: 'absolute',
    top: 12,
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: 2,
    borderColor: 'rgba(196,181,253,0.25)',
  },

  planetImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 12,
  },

  planetText: {
    fontSize: 13,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 18,
  },

  customCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.35)',
    padding: 20,
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
  },

  input: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#ffffff',
    fontSize: 15,
    marginBottom: 16,
  },

  startButton: {
    width: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },

  startButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },

  quickGrid: {
    width: '100%',
    maxWidth: 360,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  quickButton: {
    width: '31%',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(196,181,253,0.35)',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },

  quickButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
});