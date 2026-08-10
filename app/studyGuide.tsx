import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import StarryBackground from "@/components/starrybackground";
import { useTheme } from "@/context/themecontext";
import { deleteStudyGuide, getStudyGuideById, StudyGuide } from "../storage/studyGuideStorage";

export default function StudyGuideScreen() {
  const { isDark } = useTheme();
  const params = useLocalSearchParams<{
    id?: string;
  }>();
  const guideId = typeof params.id === "string" ? params.id : undefined;
  const [guide, setGuide] = useState<StudyGuide | null>(null);
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

  const loadGuide = useCallback(async () => {
    if (!guideId) {
      setIsLoading(false);
      return;
    }
    try {
      const storedGuide = await getStudyGuideById(guideId);
      setGuide(storedGuide);
    } catch (error) {
      console.log("Failed to load study guide:", error);
    } finally {
      setIsLoading(false);
    }
  }, [guideId]);

  useEffect(() => {
    loadGuide();
  }, [loadGuide]);

  const handleEdit = () => {
    if (!guide) return;
    router.push({
      pathname: "/studyGuideMaker",
      params: {
        id: guide.id,
        mode: "edit",
      },
    });
  };

  const handleDelete = () => {
    if (!guide) return;
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
              router.replace("/studyGuides");
            } catch (error) {
              console.log("Failed to delete study guide:", error);
              Alert.alert("Delete failed", "The study guide could not be deleted.");
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={backgroundColors} style={StyleSheet.absoluteFillObject} />
        <View pointerEvents="none" style={styles.stars}>
          <StarryBackground />
        </View>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.icon} />
        </View>
      </SafeAreaView>
    );
  }

  if (!guide) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={backgroundColors} style={StyleSheet.absoluteFillObject} />
        <View pointerEvents="none" style={styles.stars}>
          <StarryBackground />
        </View>
        <View style={styles.notFound}>
          <View
            style={[
              styles.notFoundIcon,
              {
                backgroundColor: colors.iconBackground,
              },
            ]}
          >
            <Ionicons name="book-outline" size={30} color={colors.icon} />
          </View>
          <Text style={[styles.notFoundTitle, { color: colors.title }]}>Study Guide Not Found</Text>
          <Text style={[styles.notFoundText, { color: colors.secondaryText }]}>
            This study guide may have been deleted or does not exist.
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.replace("/studyGuides")}
            style={[
              styles.backHomeButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
          >
            <Text style={styles.backHomeText}>Back to Study Guides</Text>
          </TouchableOpacity>
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
        <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="arrow-back" size={25} color={colors.title} />
        </TouchableOpacity>
        <Text numberOfLines={1} style={[styles.topTitle, { color: colors.title }]}>
          Study Guide
        </Text>
        <TouchableOpacity activeOpacity={0.7} onPress={handleEdit} style={styles.headerButton}>
          <Ionicons name="create-outline" size={21} color={colors.title} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.titleCard,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <View
            style={[
              styles.titleIcon,
              {
                backgroundColor: colors.iconBackground,
              },
            ]}
          >
            <Ionicons name="book" size={26} color={colors.icon} />
          </View>
          <Text style={[styles.guideTitle, { color: colors.title }]}>{guide.title}</Text>
          {guide.description ? (
            <Text style={[styles.description, { color: colors.secondaryText }]}>{guide.description}</Text>
          ) : null}
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="layers-outline" size={14} color={colors.icon} />
              <Text style={[styles.metaText, { color: colors.secondaryText }]}>
                {guide.sections.length} {guide.sections.length === 1 ? "section" : "sections"}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Ionicons name="time-outline" size={14} color={colors.icon} />
              <Text style={[styles.metaText, { color: colors.secondaryText }]}>{guide.date}</Text>
            </View>
          </View>
        </View>
        <View style={styles.sectionsHeader}>
          <Text style={[styles.sectionsTitle, { color: colors.title }]}>Study Material</Text>
          <View
            style={[
              styles.sectionCount,
              {
                backgroundColor: colors.iconBackground,
              },
            ]}
          >
            <Text style={[styles.sectionCountText, { color: colors.icon }]}>{guide.sections.length}</Text>
          </View>
        </View>
        <View style={styles.sectionList}>
          {guide.sections.map((section, index) => (
            <View
              key={section.id}
              style={[
                styles.studySection,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View style={styles.sectionHeading}>
                <View
                  style={[
                    styles.sectionNumber,
                    {
                      backgroundColor: colors.iconBackground,
                    },
                  ]}
                >
                  <Text style={[styles.sectionNumberText, { color: colors.icon }]}>{index + 1}</Text>
                </View>
                <Text style={[styles.sectionName, { color: colors.text }]}>{section.title}</Text>
              </View>
              <View
                style={[
                  styles.sectionDivider,
                  {
                    backgroundColor: colors.divider,
                  },
                ]}
              />
              <Text style={[styles.sectionContent, { color: colors.text }]}>{section.content}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={handleDelete}
          style={[
            styles.deleteButton,
            {
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Ionicons name="trash-outline" size={18} color={colors.secondaryText} />
          <Text style={[styles.deleteText, { color: colors.secondaryText }]}>Delete Study Guide</Text>
        </TouchableOpacity>
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
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
    zIndex: 2,
  },
  notFoundIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 15,
  },
  notFoundTitle: {
    fontFamily: "BitterBold",
    fontSize: 18,
    marginBottom: 8,
  },
  notFoundText: {
    fontFamily: "Bitter",
    fontSize: 10.5,
    lineHeight: 17,
    textAlign: "center",
    maxWidth: 280,
    marginBottom: 20,
  },
  backHomeButton: {
    minHeight: 48,
    paddingHorizontal: 25,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  backHomeText: {
    color: "#ffffff",
    fontFamily: "BitterBold",
    fontSize: 10.5,
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
    backgroundColor: "transparent",
    zIndex: 2,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 60,
  },
  titleCard: {
    width: "100%",
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    alignItems: "center",
    marginBottom: 25,
  },
  titleIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  guideTitle: {
    fontFamily: "BitterBold",
    fontSize: 22,
    textAlign: "center",
  },
  description: {
    fontFamily: "Bitter",
    fontSize: 10.5,
    lineHeight: 17,
    textAlign: "center",
    marginTop: 8,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
    gap: 18,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontFamily: "Bitter",
    fontSize: 9,
    marginLeft: 5,
  },
  sectionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  sectionsTitle: {
    fontFamily: "BitterBold",
    fontSize: 19,
  },
  sectionCount: {
    minWidth: 31,
    height: 28,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionCountText: {
    fontFamily: "BitterBold",
    fontSize: 10,
  },
  sectionList: {
    gap: 13,
  },
  studySection: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionNumber: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  sectionNumberText: {
    fontFamily: "BitterBold",
    fontSize: 11,
  },
  sectionName: {
    flex: 1,
    fontFamily: "BitterBold",
    fontSize: 14,
  },
  sectionDivider: {
    width: "100%",
    height: 1,
    marginVertical: 14,
    opacity: 0.5,
  },
  sectionContent: {
    fontFamily: "Bitter",
    fontSize: 11.5,
    lineHeight: 20,
  },
  deleteButton: {
    minHeight: 48,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  deleteText: {
    fontFamily: "BitterBold",
    fontSize: 10,
    marginLeft: 7,
  },
  finalDivider: {
    width: "60%",
    height: 1,
    alignSelf: "center",
    marginTop: 35,
  },
});