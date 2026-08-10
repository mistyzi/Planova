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
    addReference,
    createReferenceId,
    getReferenceById,
    Reference,
    ReferenceType,
    updateReference,
} from "../storage/referenceStorage";

const referenceTypes: ReferenceType[] = [
  "Book",
  "Article",
  "Website",
  "Journal",
  "Video",
  "Other",
];

export default function ReferenceMakerScreen() {
  const { isDark } = useTheme();
  const params = useLocalSearchParams<{
    id?: string;
    mode?: string;
  }>();
  const referenceId = typeof params.id === "string" ? params.id : undefined;
  const isEditing = params.mode === "edit" || !!referenceId;

  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [publication, setPublication] = useState("");
  const [year, setYear] = useState("");
  const [type, setType] = useState<ReferenceType>("Book");
  const [url, setUrl] = useState("");
  const [notes, setNotes] = useState("");
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
        selected: "rgba(196,181,253,0.20)",
        selectedBorder: "rgba(196,181,253,0.45)",
        primary: "#8064B5",
        divider: "rgba(196,181,253,0.40)",
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
        selected: "rgba(185,169,223,0.25)",
        selectedBorder: "rgba(79,66,125,0.35)",
        primary: "#8069B3",
        divider: "rgba(79,66,125,0.40)",
      };

  const loadReference = useCallback(async () => {
    if (!referenceId) {
      setIsLoading(false);
      return;
    }
    try {
      const storedReference = await getReferenceById(referenceId);
      if (!storedReference) {
        Alert.alert(
          "Reference not found",
          "This reference could not be found.",
          [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ],
        );
        return;
      }
      setAuthor(storedReference.author);
      setTitle(storedReference.title);
      setPublication(storedReference.publication);
      setYear(storedReference.year);
      setType(storedReference.type);
      setUrl(storedReference.url);
      setNotes(storedReference.notes);
    } catch (error) {
      console.log("Failed to load reference:", error);
    } finally {
      setIsLoading(false);
    }
  }, [referenceId]);

  useEffect(() => {
    loadReference();
  }, [loadReference]);

  const saveReference = async () => {
    if (!author.trim()) {
      Alert.alert(
        "Add an author",
        "Please enter the author or creator of this reference.",
      );
      return;
    }
    if (!title.trim()) {
      Alert.alert("Add a title", "Please enter the title of this reference.");
      return;
    }
    setIsSaving(true);
    try {
      if (isEditing && referenceId) {
        const existingReference = await getReferenceById(referenceId);
        if (!existingReference) {
          Alert.alert(
            "Reference not found",
            "The reference could not be updated.",
          );
          return;
        }
        const updatedReference: Reference = {
          ...existingReference,
          author: author.trim(),
          title: title.trim(),
          publication: publication.trim(),
          year: year.trim(),
          type,
          url: url.trim(),
          notes: notes.trim(),
        };
        await updateReference(updatedReference);
        router.replace({
          pathname: "/referenceLibrary",
          params: {
            id: updatedReference.id,
          },
        });
        return;
      }
      const newReference: Reference = {
        id: createReferenceId(),
        author: author.trim(),
        title: title.trim(),
        publication: publication.trim(),
        year: year.trim(),
        type,
        url: url.trim(),
        notes: notes.trim(),
        date: "Just now",
      };
      await addReference(newReference);
      router.replace({
        pathname: "/referenceLibrary",
        params: {
          id: newReference.id,
        },
      });
    } catch (error) {
      console.log("Failed to save reference:", error);
      Alert.alert("Save failed", "Your reference could not be saved.");
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
            style={styles.headerButton}
          >
            <Ionicons name="arrow-back" size={25} color={colors.title} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: colors.title }]}>
            {isEditing ? "Edit Reference" : "New Reference"}
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
              styles.introCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View
              style={[
                styles.introIcon,
                {
                  backgroundColor: colors.iconBackground,
                },
              ]}
            >
              <Ionicons name="library-outline" size={25} color={colors.icon} />
            </View>
            <View style={styles.introText}>
              <Text style={[styles.introTitle, { color: colors.text }]}>
                Reference Details
              </Text>
              <Text
                style={[
                  styles.introDescription,
                  { color: colors.secondaryText },
                ]}
              >
                Record this source like a bibliography entry.
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.formCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Text style={[styles.label, { color: colors.secondaryText }]}>
              Author / Creator
            </Text>
            <TextInput
              value={author}
              onChangeText={setAuthor}
              placeholder="e.g. Jane Smith"
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
            <Text style={[styles.label, { color: colors.secondaryText }]}>
              Title
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Introduction to Biology"
              placeholderTextColor={colors.secondaryText}
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                  fontFamily: "BitterBold",
                },
              ]}
            />
            <Text style={[styles.label, { color: colors.secondaryText }]}>
              Publication / Website
            </Text>
            <TextInput
              value={publication}
              onChangeText={setPublication}
              placeholder="e.g. Pearson"
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
            <Text style={[styles.label, { color: colors.secondaryText }]}>
              Year
            </Text>
            <TextInput
              value={year}
              onChangeText={setYear}
              placeholder="e.g. 2026"
              placeholderTextColor={colors.secondaryText}
              keyboardType="numeric"
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
            />
            <Text style={[styles.label, { color: colors.secondaryText }]}>
              Reference Type
            </Text>
            <View style={styles.typeGrid}>
              {referenceTypes.map((referenceType) => {
                const selected = type === referenceType;
                return (
                  <TouchableOpacity
                    key={referenceType}
                    activeOpacity={0.8}
                    onPress={() => setType(referenceType)}
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor: selected
                          ? colors.selected
                          : colors.input,
                        borderColor: selected
                          ? colors.selectedBorder
                          : colors.inputBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.typeText,
                        {
                          color: selected ? colors.icon : colors.secondaryText,
                        },
                      ]}
                    >
                      {referenceType}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={[styles.label, { color: colors.secondaryText }]}>
              Link
            </Text>
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder="https://..."
              placeholderTextColor={colors.secondaryText}
              autoCapitalize="none"
              keyboardType="url"
              style={[
                styles.input,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
            />
            <Text style={[styles.label, { color: colors.secondaryText }]}>
              Notes
            </Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any useful notes..."
              placeholderTextColor={colors.secondaryText}
              multiline
              textAlignVertical="top"
              style={[
                styles.notesInput,
                {
                  backgroundColor: colors.input,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
              ]}
            />
          </View>
          <View
            style={[
              styles.previewCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Text
              style={[styles.previewLabel, { color: colors.secondaryText }]}
            >
              CITATION PREVIEW
            </Text>
            <Text style={[styles.citation, { color: colors.text }]}>
              {author.trim() || "Author"} {author.trim() ? ". " : ""}
              <Text style={styles.citationTitle}>
                {title.trim() || "Reference title"}
              </Text>
              {publication.trim() ? `. ${publication.trim()}` : ""}
              {year.trim() ? `, ${year.trim()}` : ""}.
            </Text>
            {!!url.trim() && (
              <Text
                style={[styles.previewUrl, { color: colors.secondaryText }]}
              >
                {url.trim()}
              </Text>
            )}
          </View>
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={saveReference}
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
                  : "Save Reference"}
            </Text>
          </TouchableOpacity>
          <View
            style={[
              styles.divider,
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
  headerButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  headerSpacer: {
    width: 42,
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
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 15,
    paddingBottom: 60,
  },
  introCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  introIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  introText: {
    flex: 1,
  },
  introTitle: {
    fontFamily: "BitterBold",
    fontSize: 14,
    marginBottom: 4,
  },
  introDescription: {
    fontFamily: "Bitter",
    fontSize: 9.5,
    lineHeight: 15,
  },
  formCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 17,
  },
  label: {
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
  notesInput: {
    width: "100%",
    minHeight: 95,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontFamily: "Bitter",
    fontSize: 11.5,
    textAlignVertical: "top",
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  typeButton: {
    minHeight: 38,
    paddingHorizontal: 13,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  typeText: {
    fontFamily: "BitterBold",
    fontSize: 9.5,
  },
  previewCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    marginTop: 18,
  },
  previewLabel: {
    fontFamily: "BitterBold",
    fontSize: 8.5,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  citation: {
    fontFamily: "Bitter",
    fontSize: 11.5,
    lineHeight: 20,
  },
  citationTitle: {
    fontFamily: "BitterBold",
  },
  previewUrl: {
    fontFamily: "Bitter",
    fontSize: 9.5,
    lineHeight: 15,
    marginTop: 9,
  },
  saveButton: {
    minHeight: 55,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
  },
  saveButtonText: {
    color: "#ffffff",
    fontFamily: "BitterBold",
    fontSize: 12,
    marginLeft: 8,
  },
  divider: {
    width: "60%",
    height: 1,
    alignSelf: "center",
    marginTop: 35,
  },
});
