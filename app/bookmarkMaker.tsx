import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import StarryBackground from "@/components/starrybackground";
import { useTheme } from "@/context/themecontext";
import { addBookmark, createBookmarkId, getBookmarkById, updateBookmark, Bookmark } from "./bookmarkStorage";

export default function BookmarkMakerScreen() {
  const { isDark } = useTheme();
  const params = useLocalSearchParams<{
    id?: string;
    mode?: string;
  }>();
  const bookmarkId = typeof params.id === "string" ? params.id : undefined;
  const isEditing = params.mode === "edit" || !!bookmarkId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
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

  const loadBookmark = useCallback(async () => {
    if (!bookmarkId) {
      setIsLoading(false);
      return;
    }
    try {
      const storedBookmark = await getBookmarkById(bookmarkId);
      if (!storedBookmark) {
        Alert.alert("Bookmark not found", "This bookmark could not be found.", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
        return;
      }
      setTitle(storedBookmark.title);
      setDescription(storedBookmark.description ?? "");
      setUrl(storedBookmark.url);
    } catch (error) {
      console.log("Failed to load bookmark:", error);
    } finally {
      setIsLoading(false);
    }
  }, [bookmarkId]);

  useEffect(() => {
    loadBookmark();
  }, [loadBookmark]);

  const saveBookmark = async () => {
    if (!title.trim()) {
      Alert.alert("Add a title", "Please give your bookmark a title.");
      return;
    }
    if (!url.trim()) {
      Alert.alert("Add a URL", "Please enter the website URL you want to save.");
      return;
    }
    setIsSaving(true);
    try {
      if (isEditing && bookmarkId) {
        const existingBookmark = await getBookmarkById(bookmarkId);
        if (!existingBookmark) {
          Alert.alert("Bookmark not found", "The bookmark could not be updated.");
          return;
        }
        const updatedBookmark: Bookmark = {
          ...existingBookmark,
          title: title.trim(),
          description: description.trim(),
          url: url.trim(),
        };
        await updateBookmark(updatedBookmark);
        router.replace({
          pathname: "/bookmarks",
          params: {
            id: updatedBookmark.id,
          },
        });
        return;
      }
      const newBookmark: Bookmark = {
        id: createBookmarkId(),
        title: title.trim(),
        description: description.trim(),
        url: url.trim(),
        date: "Just now",
      };
      await addBookmark(newBookmark);
      router.replace({
        pathname: "/bookmarks",
        params: {
          id: newBookmark.id,
        },
      });
    } catch (error) {
      console.log("Failed to save bookmark:", error);
      Alert.alert("Save failed", "Your bookmark could not be saved.");
    } finally {
      setIsSaving(false);
    }
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
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={25} color={colors.title} />
          </TouchableOpacity>
          <Text style={[styles.topTitle, { color: colors.title }]}>
            {isEditing ? "Edit Bookmark" : "New Bookmark"}
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
                <Ionicons name="bookmark-outline" size={21} color={colors.icon} />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Bookmark Information</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
                  Save an important resource for later.
                </Text>
              </View>
            </View>
            <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="e.g. Biology Study Resource"
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
            <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>Website URL</Text>
            <TextInput
              value={url}
              onChangeText={setUrl}
              placeholder="https://example.com"
              placeholderTextColor={colors.secondaryText}
              autoCapitalize="none"
              autoCorrect={false}
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
            <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Optional description..."
              placeholderTextColor={colors.secondaryText}
              multiline
              textAlignVertical="top"
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
          <View style={styles.previewHeader}>
            <View>
              <Text style={[styles.previewTitle, { color: colors.title }]}>Preview</Text>
              <Text style={[styles.previewSubtitle, { color: colors.secondaryText }]}>
                This is how your bookmark will appear.
              </Text>
            </View>
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
            <View
              style={[
                styles.previewIcon,
                {
                  backgroundColor: colors.iconBackground,
                },
              ]}
            >
              <Ionicons name="bookmark" size={23} color={colors.icon} />
            </View>
            <View style={styles.previewContent}>
              <Text numberOfLines={2} style={[styles.previewCardTitle, { color: colors.text }]}>
                {title.trim() || "Bookmark Title"}
              </Text>
              <Text numberOfLines={2} style={[styles.previewCardDescription, { color: colors.secondaryText }]}>
                {description.trim() || "Your bookmark description will appear here."}
              </Text>
              <Text numberOfLines={1} style={[styles.previewUrl, { color: colors.secondaryText }]}>
                {url.trim() || "https://example.com"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={saveBookmark}
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
              {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Save Bookmark"}
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
    minHeight: 85,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontFamily: "Bitter",
    fontSize: 11.5,
    textAlignVertical: "top",
  },
  previewHeader: {
    marginBottom: 13,
  },
  previewTitle: {
    fontFamily: "BitterBold",
    fontSize: 19,
  },
  previewSubtitle: {
    fontFamily: "Bitter",
    fontSize: 9.5,
    marginTop: 3,
  },
  previewCard: {
    width: "100%",
    minHeight: 120,
    borderRadius: 20,
    borderWidth: 1,
    padding: 17,
    flexDirection: "row",
    marginBottom: 5,
  },
  previewIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  previewContent: {
    flex: 1,
  },
  previewCardTitle: {
    fontFamily: "BitterBold",
    fontSize: 14,
    marginBottom: 5,
  },
  previewCardDescription: {
    fontFamily: "Bitter",
    fontSize: 10,
    lineHeight: 16,
    marginBottom: 7,
  },
  previewUrl: {
    fontFamily: "Bitter",
    fontSize: 9,
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