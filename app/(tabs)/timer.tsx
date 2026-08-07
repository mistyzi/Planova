import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
} from 'react-native';
import {
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfileSheet } from '../../components/profilesheetcontext';

const presets = [
  {
    name: 'Mercury',
    time: '20 min',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/4/4a/Mercury_in_true_color.jpg',
  },
  {
    name: 'Mars',
    time: '40 min',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/0/02/OSIRIS_Mars_true_color.jpg',
  },
  {
    name: 'Venus',
    time: '60 min',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/e/e5/Venus-real_color.jpg',
  },
  {
    name: 'Earth',
    time: '80 min',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/9/97/The_Earth_seen_from_Apollo_17.jpg',
  },
  {
    name: 'Neptune',
    time: '100 min',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/5/56/Neptune_Full.jpg',
  },
  {
    name: 'Uranus',
    time: '120 min',
    image:
      'https://upload.wikimedia.org/wikipedia/commons/3/3d/Uranus2.jpg',
  },
];

export default function TimerScreen() {
  const { openProfile } = useProfileSheet();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
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

            <TouchableOpacity
              style={styles.iconBubble}
              onPress={openProfile}
              activeOpacity={0.8}
            >
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
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.planetCard,
                  pressed && styles.planetCardPressed,
                ]}
              >
                <View style={styles.planetGlow} />

                <Image
                  source={{
                    uri: preset.image,
                  }}
                  style={styles.planetImage}
                />

                <Text style={styles.planetText}>
                  {preset.name}
                  {'\n'}
                  ✦ {preset.time}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Create a Custom Cosmic Focus
          </Text>

          <View style={styles.constellationLine} />

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.customFocusWrapper}
          >
            <LinearGradient
              colors={['#c084fc', '#6366f1']}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 0,
              }}
              style={styles.customFocusButton}
            >
              <Text style={styles.customFocusButtonText}>
                ＋ Create Custom Cosmic Focus
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={styles.constellationLine} />
        <View style={styles.pageBottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  pageScroll: {
    flex: 1,
  },

  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },

  pageBottomSpacer: {
    height: 120,
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
    fontFamily: 'MysteryQuest',
    marginLeft: 8,
    fontSize: 28,
    color: '#e9d5ff',
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
    fontFamily: 'BitterBold',
    fontSize: 22,
    color: '#e9d5ff',
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

  planetCardPressed: {
    backgroundColor: 'rgba(255,255,255,0.18)',
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
    fontFamily: 'Bitter',
    fontSize: 13,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 18,
  },

  customFocusWrapper: {
    width: '100%',
  },

  customFocusButton: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#b478ff',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },

  customFocusButtonText: {
    fontFamily: 'Bitter',
    color: '#ffffff',
    fontSize: 16,
  },
});