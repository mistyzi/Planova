import React from 'react';
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, Image, StyleSheet, Pressable } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useProfileSheet } from '../../components/profilesheetcontext';
import { useTheme } from '../../components/themecontext';

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

const customPresets = [
  {
    name: 'Andromeda',
    time: '15 min',
    image: 'https://upload.wikimedia.org/wikipedia/commons/9/98/Andromeda_Galaxy_%28with_h-alpha%29.jpg',
  },
  {
    name: 'Orion',
    time: '25 min',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Orion_Nebula_-_Hubble_2006.jpg',
  },
  {
    name: 'Pleiades',
    time: '35 min',
    image: 'https://upload.wikimedia.org/wikipedia/commons/8/8b/Pleiades_large.jpg',
  },
];

export default function TimerScreen() {
  const { openProfile } = useProfileSheet();
  const { isDark } = useTheme();

  const colors = isDark
    ? {
        logo: '#e9d5ff',
        starLogo: '#c4b5fd',
        iconBackground: 'rgba(255,255,255,0.12)',
        iconBorder: 'rgba(196,181,253,0.35)',
        badge: '#d8b4fe',
        badgeText: '#0e1938',
        sectionTitle: '#e9d5ff',
        constellation: 'rgba(196,181,253,0.45)',
        planetCard: 'rgba(14,25,56,0.55)',
        planetBorder: 'rgba(196,181,253,0.28)',
        planetGlow: 'rgba(196,181,253,0.25)',
        planetText: '#ffffff',
        customButtonText: '#ffffff',
      }
    : {
        logo: '#4F427D',
        starLogo: '#6D5A9F',
        iconBackground: 'rgba(70,58,120,0.18)',
        iconBorder: 'rgba(79,66,125,0.40)',
        badge: '#B9A9DF',
        badgeText: '#29233F',
        sectionTitle: '#4F427D',
        constellation: 'rgba(79,66,125,0.40)',
        planetCard: 'rgba(255,255,255,0.72)',
        planetBorder: 'rgba(79,66,125,0.30)',
        planetGlow: 'rgba(79,66,125,0.20)',
        planetText: '#30284C',
        customButtonText: '#ffffff',
      };

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
            <MaterialCommunityIcons name="star-four-points" size={24} color={colors.starLogo} />
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

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>Choose a Cosmic Focus Preset</Text>
          <View style={[styles.constellationLine, { backgroundColor: colors.constellation }]} />
          <View style={styles.grid}>
            {presets.map((preset, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.planetCard,
                  { backgroundColor: colors.planetCard, borderColor: colors.planetBorder },
                  pressed && styles.planetCardPressed,
                ]}
              >
                <View style={[styles.planetGlow, { borderColor: colors.planetGlow }]} />
                <Image source={{ uri: preset.image }} style={styles.planetImage} />
                <Text style={[styles.planetText, { color: colors.planetText }]}>
                  {preset.name}
                  {'\n'}
                  ✦ {preset.time}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.sectionTitle }]}>Create a Custom Cosmic Focus</Text>
          <View style={[styles.constellationLine, { backgroundColor: colors.constellation }]} />
          <View style={styles.grid}>
            {customPresets.map((preset, index) => (
              <Pressable
                key={index}
                style={({ pressed }) => [
                  styles.planetCard,
                  { backgroundColor: colors.planetCard, borderColor: colors.planetBorder },
                  pressed && styles.planetCardPressed,
                ]}
              >
                <View style={[styles.planetGlow, { borderColor: colors.planetGlow }]} />
                <Image source={{ uri: preset.image }} style={styles.planetImage} />
                <Text style={[styles.planetText, { color: colors.planetText }]}>
                  {preset.name}
                  {'\n'}
                  ✦ {preset.time}
                </Text>
              </Pressable>
            ))}
          </View>
          <TouchableOpacity activeOpacity={0.9} style={styles.customFocusWrapper}>
            <LinearGradient
              colors={['#c084fc', '#6366f1']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.customFocusButton}
            >
              <Text style={[styles.customFocusButtonText, { color: colors.customButtonText }]}>
                ＋ Create Custom Cosmic Focus
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={[styles.constellationLine, { backgroundColor: colors.constellation }]} />
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
    height: 0,
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
  section: {
    marginBottom: 28,
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: 'BitterBold',
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 16,
  },
  constellationLine: {
    width: '60%',
    height: 1,
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
    borderRadius: 22,
    borderWidth: 1,
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
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 8,
  },
  customFocusButtonText: {
    fontFamily: 'Bitter',
    fontSize: 16,
  },
});