import Header from "@/components/header";
import { useTheme } from "@/context/themecontext";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ACTIVE_FOCUS_SESSION_KEY = "@planova_active_focus_session";

type ActiveFocusSession = {
  id: string;
  name: string;
  durationSeconds: number;
  startedAt: number;
  endsAt: number;
  remainingSeconds: number;
  isRunning: boolean;
  isCompleted: boolean;
};

export default function StudyScreen() {
  const { isDark } = useTheme();
  const router = useRouter();
  const [checkingTimer, setCheckingTimer] = useState(false);

  const colors = isDark
    ? {
        title: "#e9d5ff",
        text: "#ffffff",
        secondaryText: "#c4b5fd",
        card: "rgba(14,25,56,0.55)",
        cardBorder: "rgba(196,181,253,0.28)",
        iconBackground: "rgba(196,181,253,0.14)",
        icon: "#c4b5fd",
        constellation: "rgba(196,181,253,0.45)",
        featuredCard: "rgba(196,181,253,0.12)",
        featuredBorder: "rgba(196,181,253,0.38)",
      }
    : {
        title: "#4F427D",
        text: "#30284C",
        secondaryText: "#6D5A9F",
        card: "rgba(255,255,255,0.72)",
        cardBorder: "rgba(79,66,125,0.30)",
        iconBackground: "rgba(79,66,125,0.10)",
        icon: "#4F427D",
        constellation: "rgba(79,66,125,0.40)",
        featuredCard: "rgba(185,169,223,0.22)",
        featuredBorder: "rgba(79,66,125,0.32)",
      };

  const studyTools = [
    {
      title: "Flashcards",
      description: "Review & memorize",
      icon: "albums-outline" as const,
    },
    {
      title: "Study Guides",
      description: "Create quick reviews",
      icon: "reader-outline" as const,
    },
    {
      title: "Bookmarks",
      description: "Save useful resources",
      icon: "bookmark-outline" as const,
    },
    {
      title: "Reference Library",
      description: "Keep important material",
      icon: "library-outline" as const,
    },
  ];

  const getValidFocusSession =
    async (): Promise<ActiveFocusSession | null> => {
      try {
        const stored = await AsyncStorage.getItem(
          ACTIVE_FOCUS_SESSION_KEY
        );

        if (!stored) return null;

        const session = JSON.parse(
          stored
        ) as ActiveFocusSession;

        if (!session) {
          await AsyncStorage.removeItem(
            ACTIVE_FOCUS_SESSION_KEY
          );
          return null;
        }

        if (session.isCompleted) {
          await AsyncStorage.removeItem(
            ACTIVE_FOCUS_SESSION_KEY
          );
          return null;
        }

        if (
          session.isRunning === false &&
          session.remainingSeconds > 0
        ) {
          return session;
        }

        if (
          session.isRunning === true &&
          session.endsAt > Date.now()
        ) {
          return session;
        }

        if (
          session.isRunning === true &&
          session.endsAt <= Date.now()
        ) {
          await AsyncStorage.removeItem(
            ACTIVE_FOCUS_SESSION_KEY
          );
          return null;
        }

        await AsyncStorage.removeItem(
          ACTIVE_FOCUS_SESSION_KEY
        );

        return null;
      } catch (error) {
        console.log(
          "Failed to check active focus session:",
          error
        );

        return null;
      }
    };

  const handleFocusTimerPress = async () => {
    if (checkingTimer) return;

    setCheckingTimer(true);

    try {
      const session = await getValidFocusSession();

      if (session) {
        router.push("/focusSession");
        return;
      }

      router.push("/focusTimer");
    } catch (error) {
      console.log(
        "Failed to open focus timer:",
        error
      );

      router.push("/focusTimer");
    } finally {
      setCheckingTimer(false);
    }
  };

  useEffect(() => {
    const checkTimer = async () => {
      await getValidFocusSession();
    };

    checkTimer();
  }, []);

  const handleStudyToolPress = (title: string) => {
    if (title === "Flashcards") {
      router.push("/flashcards");
      return;
    }

    if (title === "Study Guides") {
      router.push("/studyGuides");
      return;
    }

    if (title === "Bookmarks") {
      router.push("/bookmarks");
      return;
    }

    if (title === "Reference Library") {
      router.push("/referenceLibrary");
      return;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <ScrollView
        style={styles.pageScroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {}
        {}
        {}

        <View style={styles.titleSection}>
          <Text
            style={[
              styles.pageTitle,
              { color: colors.title },
            ]}
          >
            Study
          </Text>

          <View
            style={[
              styles.constellationLine,
              {
                backgroundColor:
                  colors.constellation,
              },
            ]}
          />

          <Text
            style={[
              styles.pageSubtitle,
              {
                color: colors.secondaryText,
              },
            ]}
          >
            Tools and resources to help you study
            smarter.
          </Text>
        </View>

        {}
        {}
        {}

        <View style={styles.featuredRow}>
          {}

          <TouchableOpacity
            activeOpacity={0.82}
            onPress={() => router.push("/notes")}
            style={[
              styles.featuredCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View
              style={[
                styles.featuredIcon,
                {
                  backgroundColor:
                    colors.iconBackground,
                },
              ]}
            >
              <Ionicons
                name="document-text-outline"
                size={29}
                color={colors.icon}
              />
            </View>

            <Text
              style={[
                styles.featuredTitle,
                { color: colors.text },
              ]}
            >
              Notes
            </Text>

            <Text
              style={[
                styles.featuredDescription,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              Organize your notes and class materials.
            </Text>

            <View style={styles.featuredArrow}>
              <Ionicons
                name="arrow-forward-outline"
                size={18}
                color={colors.secondaryText}
              />
            </View>
          </TouchableOpacity>

          {}

          <TouchableOpacity
            activeOpacity={0.82}
            disabled={checkingTimer}
            onPress={handleFocusTimerPress}
            style={[
              styles.featuredCard,
              {
                backgroundColor:
                  colors.featuredCard,
                borderColor:
                  colors.featuredBorder,
                opacity: checkingTimer ? 0.7 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.featuredIcon,
                {
                  backgroundColor:
                    colors.iconBackground,
                },
              ]}
            >
              {checkingTimer ? (
                <ActivityIndicator
                  size="small"
                  color={colors.icon}
                />
              ) : (
                <Ionicons
                  name="timer-outline"
                  size={29}
                  color={colors.icon}
                />
              )}
            </View>

            <Text
              style={[
                styles.featuredTitle,
                { color: colors.text },
              ]}
            >
              Focus Timer
            </Text>

            <Text
              style={[
                styles.featuredDescription,
                {
                  color: colors.secondaryText,
                },
              ]}
            >
              Set a session and focus on your work.
            </Text>

            <View style={styles.featuredArrow}>
              <Ionicons
                name="arrow-forward-outline"
                size={18}
                color={colors.secondaryText}
              />
            </View>
          </TouchableOpacity>
        </View>

        {}
        {}
        {}

        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.title },
            ]}
          >
            Study Tools
          </Text>

          <View
            style={[
              styles.constellationLine,
              {
                backgroundColor:
                  colors.constellation,
              },
            ]}
          />

          <View style={styles.toolsGrid}>
            {studyTools.map((tool) => (
              <TouchableOpacity
                key={tool.title}
                activeOpacity={0.82}
                onPress={() =>
                  handleStudyToolPress(tool.title)
                }
                style={[
                  styles.toolCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.toolIcon,
                    {
                      backgroundColor:
                        colors.iconBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name={tool.icon}
                    size={23}
                    color={colors.icon}
                  />
                </View>

                <Text
                  style={[
                    styles.toolTitle,
                    { color: colors.text },
                  ]}
                >
                  {tool.title}
                </Text>

                <Text
                  style={[
                    styles.toolDescription,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  {tool.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {}
        {}
        {}

        <View
          style={[
            styles.bottomDivider,
            {
              backgroundColor:
                colors.constellation,
            },
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

  pageScroll: {
    flex: 1,
    backgroundColor: "transparent",
  },

  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 100,
    paddingBottom: 120,
  },

  titleSection: {
    alignItems: "center",
    marginBottom: 30,
  },

  pageTitle: {
    fontFamily: "BitterBold",
    fontSize: 30,
    textAlign: "center",
    marginBottom: 15,
  },

  pageSubtitle: {
    fontFamily: "Bitter",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    maxWidth: 310,
  },

  constellationLine: {
    width: "60%",
    height: 1,
    alignSelf: "center",
    marginBottom: 20,
  },

  featuredRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 36,
  },

  featuredCard: {
    width: "48%",
    minHeight: 215,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },

  featuredIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 17,
  },

  featuredTitle: {
    fontFamily: "BitterBold",
    fontSize: 17,
    marginBottom: 8,
  },

  featuredDescription: {
    fontFamily: "Bitter",
    fontSize: 10.5,
    lineHeight: 17,
  },

  featuredArrow: {
    marginTop: "auto",
    alignSelf: "flex-end",
  },

  section: {
    width: "100%",
    alignItems: "center",
    marginBottom: 34,
  },

  sectionTitle: {
    fontFamily: "BitterBold",
    fontSize: 21,
    textAlign: "center",
    marginBottom: 15,
  },

  toolsGrid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  toolCard: {
    width: "48%",
    minHeight: 145,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },

  toolIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  toolTitle: {
    fontFamily: "BitterBold",
    fontSize: 14,
    marginBottom: 5,
  },

  toolDescription: {
    fontFamily: "Bitter",
    fontSize: 10.5,
    lineHeight: 16,
  },

  bottomDivider: {
    width: "60%",
    height: 1,
    alignSelf: "center",
    marginTop: 0,
    marginBottom: 24,
  },
});