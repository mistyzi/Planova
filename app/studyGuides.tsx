import StarryBackground from "@/components/starrybackground";
import { useTheme } from "@/context/themecontext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import {
    deleteStudyGuide,
    getStudyGuides,
    StudyGuide,
} from "../storage/studyGuideStorage";

export default function StudyGuidesScreen() {
  const { isDark } = useTheme();
  const [guides, setGuides] = useState<StudyGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const backgroundColors: [string, string] = isDark
    ? ["#0e1938", "#6b41bf"]
    : ["#EEF3FF", "#DCCFF5"];

  const colors = isDark
    ? {
        title: "#e9d5ff",
        text: "#ffffff",
        secondaryText: "#c4b5fd",
        card: "rgba(14,25,56,0.70)",
        cardBorder: "rgba(196,181,253,0.28)",
        iconBackground: "rgba(196,181,253,0.14)",
        icon: "#c4b5fd",
        primary: "#8064B5",
        divider: "rgba(196,181,253,0.40)",
      }
    : {
        title: "#4F427D",
        text: "#30284C",
        secondaryText: "#6D5A9F",
        card: "rgba(255,255,255,0.72)",
        cardBorder: "rgba(79,66,125,0.25)",
        iconBackground: "rgba(79,66,125,0.10)",
        icon: "#4F427D",
        primary: "#8069B3",
        divider: "rgba(79,66,125,0.40)",
      };

  const loadGuides = useCallback(async () => {
    try {
      const storedGuides = await getStudyGuides();
      setGuides(storedGuides);
    } catch (error) {
      console.log("Failed to load study guides:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGuides();
    }, [loadGuides]),
  );

  const handleDelete = (guide: StudyGuide) => {
    Alert.alert(
      "Delete Study Guide",
      `Are you sure you want to delete "${guide.title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteStudyGuide(guide.id);
              await loadGuides();
            } catch (error) {
              console.log("Failed to delete study guide:", error);
              Alert.alert(
                "Delete failed",
                "The study guide could not be deleted.",
              );
            }
          },
        },
      ],
    );
  };

  const openGuide = (guide: StudyGuide) => {
    router.push({
      pathname: "/studyGuide",
      params: {
        id: guide.id,
      },
    });
  };

  const createGuide = () => {
    router.push("/studyGuideMaker");
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={backgroundColors}
          style={StyleSheet.absoluteFillObject}
        />
        <View pointerEvents="none" style={styles.stars}>
          <StarryBackground />
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.icon} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={backgroundColors}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
      <View pointerEvents="none" style={styles.stars}>
        <StarryBackground />
      </View>
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={25} color={colors.title} />
        </TouchableOpacity>
        <Text style={[styles.topTitle, { color: colors.title }]}>
          Study Guides
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={createGuide}
          style={[
            styles.headerButton,
            {
              backgroundColor: colors.iconBackground,
            },
          ]}
        >
          <Ionicons name="add" size={24} color={colors.icon} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.intro}>
          <View
            style={[
              styles.introIcon,
              {
                backgroundColor: colors.iconBackground,
              },
            ]}
          >
            <Ionicons name="book-outline" size={28} color={colors.icon} />
          </View>
          <Text style={[styles.pageTitle, { color: colors.title }]}>
            Your Study Guides
          </Text>
          <Text style={[styles.pageSubtitle, { color: colors.secondaryText }]}>
            Create organized study guides to review your course material.
          </Text>
        </View>
        {guides.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIcon,
                {
                  backgroundColor: colors.iconBackground,
                },
              ]}
            >
              <Ionicons name="book-outline" size={30} color={colors.icon} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Study Guides Yet
            </Text>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              Create your first study guide and start organizing your notes.
            </Text>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={createGuide}
              style={[
                styles.createButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.createButtonText}>Create Study Guide</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.listHeader}>
              <Text style={[styles.listTitle, { color: colors.title }]}>
                Saved Guides
              </Text>
              <Text style={[styles.listCount, { color: colors.secondaryText }]}>
                {guides.length} {guides.length === 1 ? "guide" : "guides"}
              </Text>
            </View>
            <View style={styles.guideList}>
              {guides.map((guide) => (
                <TouchableOpacity
                  key={guide.id}
                  activeOpacity={0.82}
                  onPress={() => openGuide(guide)}
                  style={[
                    styles.guideCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.guideIcon,
                      {
                        backgroundColor: colors.iconBackground,
                      },
                    ]}
                  >
                    <Ionicons
                      name="book-outline"
                      size={23}
                      color={colors.icon}
                    />
                  </View>
                  <View style={styles.guideInfo}>
                    <Text
                      numberOfLines={1}
                      style={[styles.guideTitle, { color: colors.text }]}
                    >
                      {guide.title}
                    </Text>
                    {guide.description ? (
                      <Text
                        numberOfLines={2}
                        style={[
                          styles.guideDescription,
                          { color: colors.secondaryText },
                        ]}
                      >
                        {guide.description}
                      </Text>
                    ) : null}
                    <View style={styles.guideMeta}>
                      <Ionicons
                        name="layers-outline"
                        size={13}
                        color={colors.secondaryText}
                      />
                      <Text
                        style={[
                          styles.metaText,
                          { color: colors.secondaryText },
                        ]}
                      >
                        {guide.sections.length}{" "}
                        {guide.sections.length === 1 ? "section" : "sections"}
                      </Text>
                      <Text
                        style={[
                          styles.metaDot,
                          { color: colors.secondaryText },
                        ]}
                      >
                        •
                      </Text>
                      <Text
                        style={[
                          styles.metaText,
                          { color: colors.secondaryText },
                        ]}
                      >
                        {guide.date}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleDelete(guide)}
                    style={styles.deleteButton}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={18}
                      color={colors.secondaryText}
                    />
                  </TouchableOpacity>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colors.secondaryText}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={createGuide}
              style={[
                styles.createButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Ionicons name="add" size={20} color="#ffffff" />
              <Text style={styles.createButtonText}>Create Study Guide</Text>
            </TouchableOpacity>
          </>
        )}
        <View
          style={[
            styles.finalDivider,
            {
              backgroundColor: colors.divider,
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
  stars: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  topBar: {
    height: 65,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  topTitle: {
    flex: 1,
    fontFamily: "BitterBold",
    fontSize: 17,
    textAlign: "center",
    marginHorizontal: 10,
  },
  scroll: {
    flex: 1,
    zIndex: 2,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 60,
  },
  intro: {
    alignItems: "center",
    marginBottom: 28,
  },
  introIcon: {
    width: 58,
    height: 58,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },
  pageTitle: {
    fontFamily: "BitterBold",
    fontSize: 25,
    textAlign: "center",
  },
  pageSubtitle: {
    fontFamily: "Bitter",
    fontSize: 10.5,
    lineHeight: 17,
    textAlign: "center",
    maxWidth: 300,
    marginTop: 7,
  },
  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  listTitle: {
    fontFamily: "BitterBold",
    fontSize: 19,
  },
  listCount: {
    fontFamily: "Bitter",
    fontSize: 10,
  },
  guideList: {
    gap: 13,
  },
  guideCard: {
    width: "100%",
    minHeight: 105,
    borderRadius: 20,
    borderWidth: 1,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
  },
  guideIcon: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  guideInfo: {
    flex: 1,
    marginRight: 8,
  },
  guideTitle: {
    fontFamily: "BitterBold",
    fontSize: 14,
    marginBottom: 4,
  },
  guideDescription: {
    fontFamily: "Bitter",
    fontSize: 9.5,
    lineHeight: 15,
    marginBottom: 7,
  },
  guideMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontFamily: "Bitter",
    fontSize: 8.5,
    marginLeft: 4,
  },
  metaDot: {
    fontSize: 9,
    marginHorizontal: 6,
  },
  deleteButton: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 3,
  },
  emptyCard: {
    width: "100%",
    borderRadius: 22,
    borderWidth: 1,
    padding: 25,
    alignItems: "center",
  },
  emptyIcon: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  emptyTitle: {
    fontFamily: "BitterBold",
    fontSize: 17,
    marginBottom: 7,
  },
  emptyText: {
    fontFamily: "Bitter",
    fontSize: 10.5,
    lineHeight: 17,
    textAlign: "center",
    maxWidth: 280,
    marginBottom: 20,
  },
  createButton: {
    minHeight: 51,
    borderRadius: 16,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  createButtonText: {
    color: "#ffffff",
    fontFamily: "BitterBold",
    fontSize: 10.5,
    marginLeft: 7,
  },
  finalDivider: {
    width: "60%",
    height: 1,
    alignSelf: "center",
    marginTop: 35,
  },
});
