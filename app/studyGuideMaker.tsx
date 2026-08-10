import StarryBackground from "@/components/starrybackground";
import { useTheme } from "@/context/themecontext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    addStudyGuide,
    createStudyGuideId,
    getStudyGuideById,
    StudyGuide,
    StudyGuideSection,
    updateStudyGuide,
} from "../storage/studyGuideStorage";

type SectionDraft = {
  id: string;
  title: string;
  content: string;
};

export default function StudyGuideMakerScreen() {
  const { isDark } = useTheme();
  const params = useLocalSearchParams<{
    id?: string;
    mode?: string;
  }>();
  const guideId = typeof params.id === "string" ? params.id : undefined;
  const isEditing = params.mode === "edit" || !!guideId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sections, setSections] = useState<SectionDraft[]>([
    {
      id: createStudyGuideId(),
      title: "",
      content: "",
    },
  ]);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

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
        input: "rgba(14,25,56,0.70)",
        inputBorder: "rgba(196,181,253,0.28)",
        iconBackground: "rgba(196,181,253,0.14)",
        icon: "#c4b5fd",
        divider: "rgba(196,181,253,0.40)",
        primary: "#8064B5",
      }
    : {
        title: "#4F427D",
        text: "#30284C",
        secondaryText: "#6D5A9F",
        card: "rgba(255,255,255,0.72)",
        cardBorder: "rgba(79,66,125,0.25)",
        input: "rgba(255,255,255,0.72)",
        inputBorder: "rgba(79,66,125,0.22)",
        iconBackground: "rgba(79,66,125,0.10)",
        icon: "#4F427D",
        divider: "rgba(79,66,125,0.40)",
        primary: "#8069B3",
      };

  const loadGuide = useCallback(async () => {
    if (!guideId) {
      setIsLoading(false);
      return;
    }
    try {
      const storedGuide = await getStudyGuideById(guideId);
      if (!storedGuide) {
        Alert.alert(
          "Study guide not found",
          "This study guide could not be found.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ],
        );
        return;
      }
      setTitle(storedGuide.title);
      setDescription(storedGuide.description);
      setSections(
        storedGuide.sections.length > 0
          ? storedGuide.sections.map((section) => ({
              id: section.id,
              title: section.title,
              content: section.content,
            }))
          : [
              {
                id: createStudyGuideId(),
                title: "",
                content: "",
              },
            ],
      );
    } catch (error) {
      console.log("Failed to load study guide:", error);
    } finally {
      setIsLoading(false);
    }
  }, [guideId]);

  useEffect(() => {
    loadGuide();
  }, [loadGuide]);

  const updateSection = (
    sectionId: string,
    field: "title" | "content",
    value: string,
  ) => {
    setSections((currentSections) =>
      currentSections.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section,
      ),
    );
  };

  const addSection = () => {
    setSections((currentSections) => [
      ...currentSections,
      {
        id: createStudyGuideId(),
        title: "",
        content: "",
      },
    ]);
  };

  const removeSection = (sectionId: string) => {
    if (sections.length === 1) {
      Alert.alert(
        "Keep at least one section",
        "A study guide needs at least one section.",
      );
      return;
    }
    Alert.alert(
      "Remove Section",
      "Are you sure you want to remove this section?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => {
            setSections((currentSections) =>
              currentSections.filter((section) => section.id !== sectionId),
            );
          },
        },
      ],
    );
  };

  const saveGuide = async () => {
    if (!title.trim()) {
      Alert.alert("Add a title", "Please give your study guide a title.");
      return;
    }
    const invalidSection = sections.find(
      (section) => !section.title.trim() || !section.content.trim(),
    );
    if (invalidSection) {
      Alert.alert(
        "Incomplete Section",
        "Please fill in both the section title and content for every section.",
      );
      return;
    }
    setIsSaving(true);
    try {
      const storedSections: StudyGuideSection[] = sections.map((section) => ({
        id: section.id,
        title: section.title.trim(),
        content: section.content.trim(),
      }));
      if (isEditing && guideId) {
        const existingGuide = await getStudyGuideById(guideId);
        if (!existingGuide) {
          Alert.alert(
            "Study guide not found",
            "The study guide could not be updated.",
          );
          return;
        }
        const updatedGuide: StudyGuide = {
          ...existingGuide,
          title: title.trim(),
          description: description.trim(),
          sections: storedSections,
        };
        await updateStudyGuide(updatedGuide);
        router.replace({
          pathname: "/studyGuide",
          params: {
            id: updatedGuide.id,
          },
        });
        return;
      }
      const newGuide: StudyGuide = {
        id: createStudyGuideId(),
        title: title.trim(),
        description: description.trim(),
        sections: storedSections,
        date: "Just now",
      };
      await addStudyGuide(newGuide);
      router.replace({
        pathname: "/studyGuide",
        params: {
          id: newGuide.id,
        },
      });
    } catch (error) {
      console.log("Failed to save study guide:", error);
      Alert.alert("Save failed", "Your study guide could not be saved.");
    } finally {
      setIsSaving(false);
    }
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
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={25} color={colors.title} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: colors.title }]}>
            {isEditing ? "Edit Study Guide" : "New Study Guide"}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.sectionHeader}>
              <View
                style={[
                  styles.sectionIcon,
                  {
                    backgroundColor: colors.iconBackground,
                  },
                ]}
              >
                <Ionicons name="book-outline" size={21} color={colors.icon} />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  Guide Information
                </Text>
                <Text
                  style={[
                    styles.sectionSubtitle,
                    { color: colors.secondaryText },
                  ]}
                >
                  Give your study guide a name.
                </Text>
              </View>
            </View>
            <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>
              Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Biology Chapter 1"
              placeholderTextColor={colors.secondaryText}
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
            />
            <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>
              Description
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description..."
              placeholderTextColor={colors.secondaryText}
              multiline
              style={[
                styles.descriptionInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
            />
          </View>
          <View style={styles.cardsHeader}>
            <View>
              <Text style={[styles.cardsTitle, { color: colors.title }]}>
                Guide Sections
              </Text>
              <Text
                style={[styles.cardsSubtitle, { color: colors.secondaryText }]}
              >
                {sections.length}{" "}
                {sections.length === 1 ? "section" : "sections"}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={addSection}
              style={[
                styles.addCardButton,
                {
                  backgroundColor: colors.iconBackground,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Ionicons name="add" size={18} color={colors.icon} />
              <Text style={[styles.addCardText, { color: colors.icon }]}>
                Add Section
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardList}>
            {sections.map((section, index) => (
              <View
                key={section.id}
                style={[
                  styles.flashcardEditor,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardNumber}>
                    <Text
                      style={[
                        styles.cardNumberText,
                        { color: colors.secondaryText },
                      ]}
                    >
                      SECTION {index + 1}
                    </Text>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => removeSection(section.id)}
                  >
                    <Ionicons
                      name="trash-outline"
                      size={19}
                      color={colors.secondaryText}
                    />
                  </TouchableOpacity>
                </View>
                <Text
                  style={[styles.inputLabel, { color: colors.secondaryText }]}
                >
                  Section Title
                </Text>
                <TextInput
                  value={section.title}
                  onChangeText={(value) =>
                    updateSection(section.id, "title", value)
                  }
                  placeholder="e.g. Key Concepts"
                  placeholderTextColor={colors.secondaryText}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                />
                <Text
                  style={[styles.inputLabel, { color: colors.secondaryText }]}
                >
                  Content
                </Text>
                <TextInput
                  value={section.content}
                  onChangeText={(value) =>
                    updateSection(section.id, "content", value)
                  }
                  placeholder="Write your study notes here..."
                  placeholderTextColor={colors.secondaryText}
                  multiline
                  textAlignVertical="top"
                  style={[
                    styles.contentInput,
                    {
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={saveGuide}
            disabled={isSaving}
            style={[
              styles.saveButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
          >
            <Ionicons name="checkmark" size={21} color="#ffffff" />
            <Text style={styles.saveButtonText}>
              {isSaving
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Save Study Guide"}
            </Text>
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  keyboard: {
    flex: 1,
    zIndex: 2,
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
  backButton: {
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
  headerSpacer: {
    width: 42,
  },
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 60,
  },
  sectionCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 17,
    marginBottom: 27,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 19,
  },
  sectionIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: "BitterBold",
    fontSize: 14,
    marginBottom: 3,
  },
  sectionSubtitle: {
    fontFamily: "Bitter",
    fontSize: 9.5,
  },
  inputLabel: {
    fontFamily: "BitterBold",
    fontSize: 9.5,
    marginBottom: 7,
  },
  input: {
    width: "100%",
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 13,
    fontFamily: "Bitter",
    fontSize: 11.5,
    marginBottom: 15,
  },
  descriptionInput: {
    width: "100%",
    minHeight: 75,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontFamily: "Bitter",
    fontSize: 11.5,
    textAlignVertical: "top",
  },
  cardsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  cardsTitle: {
    fontFamily: "BitterBold",
    fontSize: 19,
  },
  cardsSubtitle: {
    fontFamily: "Bitter",
    fontSize: 9.5,
    marginTop: 3,
  },
  addCardButton: {
    minHeight: 39,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addCardText: {
    fontFamily: "BitterBold",
    fontSize: 9.5,
    marginLeft: 4,
  },
  cardList: {
    gap: 13,
  },
  flashcardEditor: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 17,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 17,
  },
  cardNumber: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 9,
  },
  cardNumberText: {
    fontFamily: "BitterBold",
    fontSize: 8.5,
  },
  contentInput: {
    width: "100%",
    minHeight: 170,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontFamily: "Bitter",
    fontSize: 11.5,
    lineHeight: 18,
    textAlignVertical: "top",
    marginBottom: 2,
  },
  saveButton: {
    minHeight: 55,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
  },
  saveButtonText: {
    color: "#ffffff",
    fontFamily: "BitterBold",
    fontSize: 12,
    marginLeft: 8,
  },
  finalDivider: {
    width: "60%",
    height: 1,
    alignSelf: "center",
    marginTop: 35,
  },
});
