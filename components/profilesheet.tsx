import React, { forwardRef, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Switch } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const ProfileSheet = forwardRef<BottomSheet>((props, ref) => {
  const snapPoints = useMemo(() => ['95%'], []);
  const [studyReminders, setStudyReminders] = useState(true);

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose={true}
      enableContentPanningGesture={true}
      enableHandlePanningGesture={true}
      enableDynamicSizing={false}
      backgroundStyle={styles.sheetBackground}
      handleIndicatorStyle={styles.handle}
      backdropComponent={(backdropProps) => (
        <BottomSheetBackdrop
          {...backdropProps}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.3}
          pressBehavior="none"
        />
      )}
    >
      <BottomSheetScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
        bounces={true}
        overScrollMode="always"
      >
        <LinearGradient colors={['#121A45', '#06070D']} style={styles.gradient}>
          <Image
            source={{
              uri: 'https://i.pinimg.com/736x/e9/46/55/e94655294e897527f56c15e51580661a.jpg',
            }}
            style={styles.avatar}
          />

          <Text style={styles.name}>Hokazono Iroha</Text>
          <Text style={styles.subtitle}>SAIT • Software Development</Text>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>1240</Text>
              <Text style={styles.statLabel}>Tasks Completed</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Planets</Text>
            </View>

            <View style={styles.stat}>
              <Text style={styles.statNumber}>158</Text>
              <Text style={styles.statLabel}>Hours</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>EDIT PROFILE</Text>
          </TouchableOpacity>

          <Text style={styles.heading}>Settings</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingTopRow}>
              <View style={styles.settingIcon}>
                <Ionicons name="time-outline" size={18} color="#E5D7FF" />
              </View>

              <Switch
                value={studyReminders}
                onValueChange={setStudyReminders}
                thumbColor="#D9C4FF"
                trackColor={{
                  false: '#3B3B55',
                  true: '#6E5EFF',
                }}
              />
            </View>

            <Text style={styles.settingTitle}>Study Reminders</Text>
            <Text style={styles.settingDescription}>
              Receive cosmic nudges for your planned focus sessions.
            </Text>

            <View style={styles.tagRow}>
              <TouchableOpacity style={styles.tag}>
                <Text style={styles.tagText}>Every 45m</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.tag}>
                <Text style={styles.tagText}>Zen Mode</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Ionicons name="color-palette-outline" size={18} color="#E5D7FF" />
              </View>
            </View>

            <Text style={styles.settingTitle}>System Theme</Text>
            <Text style={styles.settingDescription}>
              Select the atmosphere that aligns with your focus cycles.
            </Text>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.activeOption}>
                <Text style={styles.activeOptionText}>☉ Stellar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.option}>
                <Text style={styles.optionText}>☾ Lunar</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Ionicons name="planet-outline" size={18} color="#F3E7A5" />
              </View>

              <View style={styles.astralText}>
                <Text style={styles.settingTitle}>Astral Progress Tracking</Text>
                <Text style={styles.settingDescription}>
                  Detailed mapping of your intellectual expansion. Visualize subject mastery as
                  expanding nebulae.
                </Text>
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.option}>
                <Text style={styles.optionText}>Configure Map</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.goldButton}>
                <Text style={styles.goldButtonText}>View Universe</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.smallCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Ionicons name="shield-outline" size={18} color="#E5D7FF" />
              </View>

              <View style={styles.smallText}>
                <Text style={styles.smallTitle}>Privacy & Sanctuary</Text>
                <Text style={styles.smallSubtitle}>Manage your study visibility</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#B6A8FF" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingIcon}>
                <Ionicons name="git-network-outline" size={18} color="#E5D7FF" />
              </View>

              <View style={styles.smallText}>
                <Text style={styles.smallTitle}>Connected Orbits</Text>
                <Text style={styles.smallSubtitle}>Manage external data streams</Text>
              </View>

              <Ionicons name="chevron-forward" size={18} color="#B6A8FF" />
            </View>
          </TouchableOpacity>

          <View style={styles.deleteCard}>
            <View style={styles.deleteText}>
              <Text style={styles.deleteTitle}>End Expedition</Text>
              <Text style={styles.deleteDescription}>
                Permanently delete your account and all study nebulae.
              </Text>
            </View>

            <TouchableOpacity style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Delete{'\n'}Data</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

ProfileSheet.displayName = 'ProfileSheet';

export default ProfileSheet;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#0A1024',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },

  handle: {
    backgroundColor: '#7C5DFF',
    width: 60,
    height: 4,
    borderRadius: 2,
  },

  gradient: {
    width: '100%',
    minHeight: '100%',
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 50,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 0,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 18,
  },

  name: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
  },

  subtitle: {
    color: '#A8B2FF',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 24,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },

  stat: {
    alignItems: 'center',
    flex: 1,
  },

  statNumber: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 18,
  },

  statLabel: {
    color: '#9097B5',
    marginTop: 4,
  },

  button: {
    backgroundColor: '#7C5DFF',
    padding: 14,
    borderRadius: 15,
    marginBottom: 30,
  },

  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '700',
  },

  heading: {
    color: '#FFFFFF',
    fontSize: 28,
    marginBottom: 18,
  },

  settingCard: {
    width: '100%',
    backgroundColor: '#1A1E52',
    borderRadius: 22,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  smallCard: {
    width: '100%',
    backgroundColor: '#1A1E52',
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  deleteCard: {
    width: '100%',
    backgroundColor: '#1B1D36',
    borderRadius: 22,
    padding: 18,
    marginTop: 8,
    marginBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  settingTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  settingTitle: {
    color: '#F6F3FF',
    fontSize: 22,
    marginTop: 14,
    marginBottom: 8,
  },

  settingDescription: {
    color: '#B7B6D8',
    lineHeight: 22,
    fontSize: 15,
  },

  tagRow: {
    flexDirection: 'row',
    marginTop: 18,
  },

  tag: {
    backgroundColor: '#282C5D',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 10,
  },

  tagText: {
    color: '#F0F0FF',
    fontSize: 12,
  },

  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 22,
  },

  activeOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#B6A8FF',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginRight: 8,
  },

  option: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#2E3160',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginLeft: 8,
  },

  activeOptionText: {
    color: '#F6F3FF',
  },

  optionText: {
    color: '#D3D2F2',
  },

  goldButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: '#E7DDB2',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },

  goldButtonText: {
    color: '#323246',
  },

  smallText: {
    flex: 1,
    marginLeft: 12,
  },

  smallTitle: {
    color: '#F6F3FF',
    fontSize: 17,
  },

  smallSubtitle: {
    color: '#A6A5C9',
    marginTop: 4,
    fontSize: 13,
  },

  astralText: {
    flex: 1,
    marginLeft: 14,
  },

  deleteText: {
    flex: 1,
    marginRight: 12,
  },

  deleteTitle: {
    color: '#D68A8A',
    fontSize: 18,
  },

  deleteDescription: {
    color: '#AFAFC7',
    marginTop: 6,
    lineHeight: 20,
  },

  deleteButton: {
    borderWidth: 1,
    borderColor: '#7C5A66',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },

  deleteButtonText: {
    color: '#F2C8D0',
    textAlign: 'center',
  },
});