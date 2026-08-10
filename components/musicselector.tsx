import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useTheme } from "../context/themecontext";

type Song = {
  id: string;
  title: string;
  artist: string;
  source: any;
};

const songs: Song[] = [
  {
    id: "1",
    title: "Starlight",
    artist: "Planova Ambient",
    source: require("../assets/music/Cosmic-Night.mp3"),
  },
  {
    id: "2",
    title: "Eternal Stars",
    artist: "Planova Ambient",
    source: require("../assets/music/Eternal-Stars.mp3"),
  },
  {
    id: "3",
    title: "Galaxy Map",
    artist: "Planova Ambient",
    source: require("../assets/music/Galaxy-Map.mp3"),
  },
];

export default function MusicSelector() {
  const { isDark } = useTheme();
  const [selectedSong, setSelectedSong] = useState<Song>(() => {
    const randomIndex = Math.floor(Math.random() * songs.length);
    return songs[randomIndex];
  });
  const [isOpen, setIsOpen] = useState(false);
  const player = useAudioPlayer(selectedSong.source);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "mixWithOthers",
    }).catch(() => {});
  }, []);

  useEffect(() => {
    player.loop = true;
  }, [player]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        player.loop = true;
        player.play();
      } catch {
        // Ignore playback errors.
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [player]);

  const selectSong = (song: Song) => {
    try {
      setSelectedSong(song);
      player.replace(song.source);
      player.loop = true;
      player.play();
    } catch {
      // Ignore playback errors.
    }
  };

  const togglePlayback = () => {
    try {
      if (status.playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch {
      // Ignore playback errors.
    }
  };

  const colors = isDark
    ? {
        card: "#1A1E52",
        dropdown: "#12163D",
        primary: "#F6F3FF",
        secondary: "#A6A5C9",
        muted: "#8585A8",
        iconBackground: "rgba(255,255,255,0.06)",
        songBackground: "rgba(255,255,255,0.035)",
        songIcon: "#242852",
        purple: "#7C5DFF",
        purpleLight: "#B6A8FF",
        activeBackground: "rgba(124,93,255,0.16)",
        border: "rgba(182,168,255,0.18)",
        songBorder: "rgba(255,255,255,0.04)",
      }
    : {
        card: "#FFFFFF",
        dropdown: "#F3F0FF",
        primary: "#211D35",
        secondary: "#716C88",
        muted: "#77738B",
        iconBackground: "rgba(124,93,255,0.08)",
        songBackground: "#FFFFFF",
        songIcon: "#EAE6FA",
        purple: "#7C5DFF",
        purpleLight: "#6658B5",
        activeBackground: "rgba(124,93,255,0.10)",
        border: "rgba(91,76,145,0.12)",
        songBorder: "rgba(124,93,255,0.08)",
      };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={[
          styles.smallCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
        onPress={() => setIsOpen((previous) => !previous)}
      >
        <View style={styles.settingRow}>
          <View
            style={[
              styles.settingIcon,
              {
                backgroundColor: colors.iconBackground,
              },
            ]}
          >
            <Text
              style={[
                styles.musicIcon,
                {
                  color: colors.purpleLight,
                },
              ]}
            >
              ♪
            </Text>
          </View>
          <View style={styles.smallText}>
            <Text
              style={[
                styles.smallTitle,
                {
                  color: colors.primary,
                },
              ]}
            >
              Background Music
            </Text>
            <Text
              style={[
                styles.smallSubtitle,
                {
                  color: colors.secondary,
                },
              ]}
            >
              {selectedSong.title} • {selectedSong.artist}
            </Text>
          </View>
          <Text
            style={[
              styles.chevron,
              {
                color: colors.purpleLight,
              },
            ]}
          >
            {isOpen ? "⌃" : "›"}
          </Text>
        </View>
      </TouchableOpacity>
      {isOpen && (
        <View
          style={[
            styles.dropdown,
            {
              backgroundColor: colors.dropdown,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.dropdownHeader}>
            <View style={styles.dropdownHeaderText}>
              <Text
                style={[
                  styles.dropdownTitle,
                  {
                    color: colors.primary,
                  },
                ]}
              >
                Choose Your Atmosphere
              </Text>
              <Text
                style={[
                  styles.dropdownSubtitle,
                  {
                    color: colors.muted,
                  },
                ]}
              >
                Music will continue while you study.
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.playButton,
                {
                  backgroundColor: colors.purple,
                },
              ]}
              activeOpacity={0.8}
              onPress={togglePlayback}
            >
              <Text style={styles.playButtonText}>
                {status.playing ? "Ⅱ" : "▶"}
              </Text>
            </TouchableOpacity>
          </View>
          {songs.map((song) => {
            const isSelected = selectedSong.id === song.id;

            return (
              <TouchableOpacity
                key={song.id}
                activeOpacity={0.8}
                style={[
                  styles.songOption,
                  {
                    backgroundColor: isSelected
                      ? colors.activeBackground
                      : colors.songBackground,
                    borderColor: isSelected ? colors.border : colors.songBorder,
                  },
                ]}
                onPress={() => selectSong(song)}
              >
                <View
                  style={[
                    styles.songIcon,
                    {
                      backgroundColor: isSelected
                        ? colors.purple
                        : colors.songIcon,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.songIconText,
                      {
                        color: isSelected ? "#FFFFFF" : colors.purpleLight,
                      },
                    ]}
                  >
                    {isSelected ? "♪" : "♫"}
                  </Text>
                </View>
                <View style={styles.songInfo}>
                  <Text
                    style={[
                      styles.songTitle,
                      {
                        color: colors.primary,
                      },
                    ]}
                  >
                    {song.title}
                  </Text>
                  <Text
                    style={[
                      styles.songArtist,
                      {
                        color: colors.muted,
                      },
                    ]}
                  >
                    {song.artist}
                  </Text>
                </View>
                {isSelected && status.playing && (
                  <View
                    style={[
                      styles.nowPlaying,
                      {
                        backgroundColor: colors.activeBackground,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.nowPlayingText,
                        {
                          color: colors.purpleLight,
                        },
                      ]}
                    >
                      PLAYING
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  smallCard: {
    width: "100%",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
  musicIcon: {
    fontFamily: "BitterBold",
    fontSize: 20,
    fontWeight: "700",
  },
  smallText: {
    flex: 1,
    marginLeft: 12,
  },
  smallTitle: {
    fontFamily: "BitterBold",
    fontSize: 17,
  },
  smallSubtitle: {
    fontFamily: "Bitter",
    marginTop: 4,
    fontSize: 13,
  },
  chevron: {
    fontFamily: "BitterBold",
    fontSize: 25,
    marginLeft: 10,
  },
  dropdown: {
    width: "100%",
    borderRadius: 22,
    borderWidth: 1,
    padding: 14,
    marginTop: -6,
    marginBottom: 16,
  },
  dropdownHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  dropdownHeaderText: {
    flex: 1,
    paddingRight: 12,
  },
  dropdownTitle: {
    fontFamily: "BitterBold",
    fontSize: 16,
  },
  dropdownSubtitle: {
    fontFamily: "Bitter",
    fontSize: 12,
    marginTop: 4,
  },
  playButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
  },
  playButtonText: {
    fontFamily: "BitterBold",
    color: "#FFFFFF",
    fontSize: 15,
  },
  songOption: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
  },
  songIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  songIconText: {
    fontFamily: "BitterBold",
    fontSize: 18,
  },
  songInfo: {
    flex: 1,
    marginLeft: 12,
  },
  songTitle: {
    fontFamily: "BitterBold",
    fontSize: 14,
  },
  songArtist: {
    fontFamily: "Bitter",
    fontSize: 12,
    marginTop: 3,
  },
  nowPlaying: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  nowPlayingText: {
    fontFamily: "BitterBold",
    fontSize: 8,
    letterSpacing: 0.6,
  },
});