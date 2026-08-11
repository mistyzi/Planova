import StarryBackground from "@/components/starrybackground";
import { useTheme } from "@/context/themecontext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import {
  addNote,
  deleteNote,
  getNoteById,
  StoredNote,
  updateNote,
} from "../storage/noteStorage";

export default function NoteScreen() {
  const { isDark } = useTheme();

  const params = useLocalSearchParams<{
    id?: string;
    mode?: string;
    type?: string;
  }>();

  const noteId =
    typeof params.id === "string"
      ? params.id
      : undefined;

  const isCreating =
    params.mode === "create";

  const [note, setNote] =
    useState<StoredNote | null>(null);

  const [text, setText] =
    useState("");

  const [title, setTitle] =
    useState("");

  const [isLoading, setIsLoading] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [isSpeaking, setIsSpeaking] =
    useState(false);

  const backgroundColors: [
    string,
    string
  ] = isDark
    ? [
        "#0e1938",
        "#6b41bf",
      ]
    : [
        "#EEF3FF",
        "#DCCFF5",
      ];

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

  
  
  

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        if (isCreating) {
          if (!mounted) return;

          setTitle("");
          setText("");
          setNote(null);
          setIsLoading(false);

          return;
        }

        if (!noteId) {
          setIsLoading(false);
          return;
        }

        console.log(
          "OPENING NOTE:",
          noteId
        );

        const stored =
          await getNoteById(noteId);

        if (!mounted) {
          return;
        }

        if (!stored) {
          Alert.alert(
            "Note not found",
            "This note could not be found.",
            [
              {
                text: "OK",
                onPress: () =>
                  router.back(),
              },
            ]
          );

          return;
        }

        console.log(
          "NOTE TYPE:",
          stored.type
        );

        console.log(
          "NOTE IMAGE COUNT:",
          stored.images?.length ?? 0
        );

        console.log(
          "NOTE OCR LENGTH:",
          stored.extractedText?.length ?? 0
        );

        console.log(
          "NOTE OCR TEXT:",
          stored.extractedText ||
            "[EMPTY]"
        );

        setNote(stored);
        setTitle(stored.title);
        setText(stored.text ?? "");
        setIsLoading(false);
      } catch (error) {
        console.log(
          "LOAD NOTE ERROR:",
          error
        );

        setIsLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [noteId, isCreating]);

  
  
  

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const readAloud = async () => {
    const speechText =
      note?.type === "Images"
        ? note.extractedText ?? ""
        : text;

    if (!speechText.trim()) {
      Alert.alert(
        "Nothing to read",
        "There isn't any text available to read aloud."
      );

      return;
    }

    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);

    Speech.speak(
      speechText,
      {
        rate: 0.9,
        pitch: 1,
        onDone: () =>
          setIsSpeaking(false),
        onStopped: () =>
          setIsSpeaking(false),
        onError: () =>
          setIsSpeaking(false),
      }
    );
  };

  
  
  

  const saveTextNote = async () => {
    if (!title.trim()) {
      Alert.alert(
        "Add a title",
        "Please give your note a title."
      );

      return;
    }

    setIsSaving(true);

    try {
      if (isCreating) {
        const newNote: StoredNote = {
          id: `${Date.now()}-${Math.random()
            .toString(36)
            .slice(2)}`,

          title: title.trim(),

          type: "Text",

          preview:
            text.trim().slice(
              0,
              120
            ) ||
            "Empty note",

          date: "Just now",

          text,
        };

        await addNote(newNote);

        setNote(newNote);

        router.replace({
          pathname: "/note",
          params: {
            id: newNote.id,
          },
        });

        return;
      }

      if (!note) {
        return;
      }

      const updatedNote: StoredNote = {
        ...note,

        title: title.trim(),

        preview:
          text.trim().slice(
            0,
            120
          ) ||
          "Empty note",

        text,
      };

      await updateNote(updatedNote);

      setNote(updatedNote);

      Alert.alert(
        "Saved",
        "Your note has been saved."
      );
    } catch (error) {
      console.log(
        "Save error:",
        error
      );

      Alert.alert(
        "Save failed",
        "Your note could not be saved."
      );
    } finally {
      setIsSaving(false);
    }
  };

  
  
  

  const handleDelete = () => {
    if (!noteId || isCreating) {
      return;
    }

    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note? This cannot be undone.",
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
              await Speech.stop();
              setIsSpeaking(false);

              await deleteNote(noteId);

              router.back();
            } catch (error) {
              console.log(
                "Delete note error:",
                error
              );

              Alert.alert(
                "Delete failed",
                "Your note could not be deleted."
              );
            }
          },
        },
      ]
    );
  };

  
  
  

  if (isLoading) {
    return (
      <SafeAreaView
        style={styles.container}
      >
        <LinearGradient
          colors={backgroundColors}
          style={
            StyleSheet.absoluteFillObject
          }
        />

        <View
          pointerEvents="none"
          style={styles.stars}
        >
          <StarryBackground />
        </View>

        <View
          style={styles.loading}
        >
          <ActivityIndicator
            size="large"
            color={colors.icon}
          />
        </View>
      </SafeAreaView>
    );
  }

  const isImageNote =
    note?.type === "Images";

  return (
    <SafeAreaView
      style={styles.container}
    >
      <LinearGradient
        colors={backgroundColors}
        start={{
          x: 0.5,
          y: 0,
        }}
        end={{
          x: 0.5,
          y: 1,
        }}
        style={
          StyleSheet.absoluteFillObject
        }
      />

      <View
        pointerEvents="none"
        style={styles.stars}
      >
        <StarryBackground />
      </View>

      {}
      {}
      {}

      <View
        style={styles.topBar}
      >
        <TouchableOpacity
          onPress={() =>
            router.back()
          }
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={25}
            color={colors.title}
          />
        </TouchableOpacity>

        <View
          style={styles.headerSpacer}
        />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        {}
        {}
        {}

        {isImageNote && note ? (
          <>
            <View
              style={
                styles.titleSection
              }
            >
              <TextInput
                value={title}
                onChangeText={
                  setTitle
                }
                style={[
                  styles.imageNoteTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
                placeholder="Note title"
                placeholderTextColor={
                  colors.secondaryText
                }
              />

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor:
                      colors.divider,
                  },
                ]}
              />

              <Text
                style={[
                  styles.pageInfo,
                  {
                    color:
                      colors.secondaryText,
                  },
                ]}
              >
                {note.images?.length ??
                  0}{" "}
                {note.images?.length ===
                1
                  ? "page"
                  : "pages"}
              </Text>
            </View>

            {}
            {}
            {}

            <View
              style={
                styles.imagePages
              }
            >
              {note.images?.map(
                (
                  image,
                  index
                ) => (
                  <View
                    key={`${image}-${index}`}
                    style={[
                      styles.imagePageCard,
                      {
                        backgroundColor:
                          colors.card,
                        borderColor:
                          colors.cardBorder,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pageNumberText,
                        {
                          color:
                            colors.secondaryText,
                        },
                      ]}
                    >
                      Page{" "}
                      {index + 1}
                    </Text>

                    <Image
                      source={{
                        uri: image,
                      }}
                      style={
                        styles.fullNoteImage
                      }
                      resizeMode="contain"
                    />
                  </View>
                )
              )}
            </View>

            {}
            {}
            {}

            <TouchableOpacity
              activeOpacity={0.82}
              onPress={
                readAloud
              }
              style={[
                styles.readButton,
                {
                  backgroundColor:
                    colors.primary,
                },
              ]}
            >
              <Ionicons
                name={
                  isSpeaking
                    ? "stop-circle-outline"
                    : "volume-high-outline"
                }
                size={22}
                color="#ffffff"
              />

              <Text
                style={
                  styles.readButtonText
                }
              >
                {isSpeaking
                  ? "Stop Reading"
                  : "Read Aloud"}
              </Text>
            </TouchableOpacity>

            {}
            {}
            {}

            <View
              style={[
                styles.extractedCard,
                {
                  backgroundColor:
                    colors.card,
                  borderColor:
                    colors.cardBorder,
                },
              ]}
            >
              <View
                style={
                  styles.extractedHeader
                }
              >
                <View
                  style={[
                    styles.extractedIcon,
                    {
                      backgroundColor:
                        colors.iconBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name="scan-outline"
                    size={21}
                    color={
                      colors.icon
                    }
                  />
                </View>

                <View
                  style={
                    styles.extractedHeaderText
                  }
                >
                  <Text
                    style={[
                      styles.extractedTitle,
                      {
                        color:
                          colors.text,
                      },
                    ]}
                  >
                    Scanned Text
                  </Text>

                  <Text
                    style={[
                      styles.extractedSubtitle,
                      {
                        color:
                          colors.secondaryText,
                      },
                    ]}
                  >
                    Text recognized from
                    every imported page.
                  </Text>
                </View>
              </View>

              {note.extractedText?.trim() ? (
                <Text
                  selectable
                  style={[
                    styles.extractedText,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {
                    note.extractedText
                  }
                </Text>
              ) : (
                <Text
                  style={[
                    styles.noText,
                    {
                      color:
                        colors.secondaryText,
                    },
                  ]}
                >
                  No text could be
                  recognized from
                  these images.
                </Text>
              )}
            </View>
          </>
        ) : (
          
          
          

          <>
            <View
              style={
                styles.titleSection
              }
            >
              <TextInput
                value={title}
                onChangeText={
                  setTitle
                }
                placeholder="Note title"
                placeholderTextColor={
                  colors.secondaryText
                }
                style={[
                  styles.textNoteTitle,
                  {
                    color:
                      colors.text,
                  },
                ]}
              />

              <View
                style={[
                  styles.divider,
                  {
                    backgroundColor:
                      colors.divider,
                  },
                ]}
              />
            </View>

            <View
              style={[
                styles.textEditor,
                {
                  backgroundColor:
                    colors.card,
                  borderColor:
                    colors.cardBorder,
                },
              ]}
            >
              <TextInput
                value={text}
                onChangeText={
                  setText
                }
                multiline
                textAlignVertical="top"
                placeholder="Start writing your notes..."
                placeholderTextColor={
                  colors.secondaryText
                }
                style={[
                  styles.textInput,
                  {
                    color:
                      colors.text,
                  },
                ]}
              />
            </View>

            <View
              style={
                styles.noteActions
              }
            >
              <TouchableOpacity
                onPress={
                  readAloud
                }
                style={[
                  styles.secondaryButton,
                  {
                    backgroundColor:
                      colors.card,
                    borderColor:
                      colors.cardBorder,
                  },
                ]}
              >
                <Ionicons
                  name={
                    isSpeaking
                      ? "stop-circle-outline"
                      : "volume-high-outline"
                  }
                  size={20}
                  color={
                    colors.icon
                  }
                />

                <Text
                  style={[
                    styles.secondaryButtonText,
                    {
                      color:
                        colors.text,
                    },
                  ]}
                >
                  {isSpeaking
                    ? "Stop"
                    : "Read Aloud"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={
                  saveTextNote
                }
                disabled={
                  isSaving
                }
                style={[
                  styles.saveButton,
                  {
                    backgroundColor:
                      colors.primary,
                  },
                ]}
              >
                <Ionicons
                  name="checkmark"
                  size={20}
                  color="#ffffff"
                />

                <Text
                  style={
                    styles.saveButtonText
                  }
                >
                  {isSaving
                    ? "Saving..."
                    : "Save Note"}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {}
        {}
        {}

        {!isCreating && note && (
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={
              handleDelete
            }
            style={[
              styles.deleteButton,
              {
                backgroundColor:
                  colors.card,
                borderColor:
                  colors.cardBorder,
              },
            ]}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color="#D95C6A"
            />

            <Text
              style={[
                styles.deleteButtonText,
                {
                  color:
                    "#D95C6A",
                },
              ]}
            >
              Delete Note
            </Text>
          </TouchableOpacity>
        )}

        <View
          style={[
            styles.finalDivider,
            {
              backgroundColor:
                colors.divider,
            },
          ]}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor:
        "transparent",
    },

    stars: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 1,
    },

    loading: {
      flex: 1,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    topBar: {
      height: 65,
      paddingHorizontal: 20,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "space-between",
      zIndex: 10,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    headerSpacer: {
      width: 42,
    },

    scroll: {
      flex: 1,
      backgroundColor:
        "transparent",
      zIndex: 2,
    },

    content: {
      paddingHorizontal: 24,
      paddingTop: 15,
      paddingBottom: 60,
    },

    titleSection: {
      alignItems:
        "center",
      marginBottom: 24,
    },

    textNoteTitle: {
      width: "100%",
      fontFamily:
        "BitterBold",
      fontSize: 24,
      textAlign:
        "center",
      marginBottom: 15,
    },

    imageNoteTitle: {
      width: "100%",
      fontFamily:
        "BitterBold",
      fontSize: 24,
      textAlign:
        "center",
      marginBottom: 15,
    },

    divider: {
      width: "60%",
      height: 1,
      marginBottom: 12,
    },

    pageInfo: {
      fontFamily:
        "Bitter",
      fontSize: 10.5,
    },

    imagePages: {
      gap: 15,
    },

    imagePageCard: {
      width: "100%",
      borderRadius: 20,
      borderWidth: 1,
      padding: 10,
    },

    pageNumberText: {
      fontFamily:
        "BitterBold",
      fontSize: 9.5,
      marginHorizontal: 6,
      marginBottom: 8,
    },

    fullNoteImage: {
      width: "100%",
      height: 450,
      borderRadius: 13,
    },

    readButton: {
      minHeight: 54,
      borderRadius: 17,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 18,
      marginBottom: 18,
      paddingHorizontal: 20,
    },

    readButtonText: {
      color:
        "#ffffff",
      fontFamily:
        "BitterBold",
      fontSize: 12.5,
      marginLeft: 9,
    },

    extractedCard: {
      width: "100%",
      borderRadius: 20,
      borderWidth: 1,
      padding: 17,
    },

    extractedHeader: {
      flexDirection:
        "row",
      alignItems:
        "center",
      marginBottom: 17,
    },

    extractedIcon: {
      width: 43,
      height: 43,
      borderRadius: 14,
      alignItems:
        "center",
      justifyContent:
        "center",
      marginRight: 11,
    },

    extractedHeaderText: {
      flex: 1,
    },

    extractedTitle: {
      fontFamily:
        "BitterBold",
      fontSize: 14,
      marginBottom: 3,
    },

    extractedSubtitle: {
      fontFamily:
        "Bitter",
      fontSize: 9.5,
    },

    extractedText: {
      fontFamily:
        "Bitter",
      fontSize: 11.5,
      lineHeight: 19,
    },

    noText: {
      fontFamily:
        "Bitter",
      fontSize: 11.5,
      lineHeight: 19,
      fontStyle:
        "italic",
    },

    textEditor: {
      minHeight: 430,
      borderRadius: 20,
      borderWidth: 1,
      padding: 17,
    },

    textInput: {
      flex: 1,
      fontFamily:
        "Bitter",
      fontSize: 12.5,
      lineHeight: 21,
    },

    noteActions: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      marginTop: 16,
    },

    secondaryButton: {
      width: "47.5%",
      minHeight: 52,
      borderRadius: 17,
      borderWidth: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    secondaryButtonText: {
      fontFamily:
        "BitterBold",
      fontSize: 11.5,
      marginLeft: 7,
    },

    saveButton: {
      width: "47.5%",
      minHeight: 52,
      borderRadius: 17,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
    },

    saveButtonText: {
      color:
        "#ffffff",
      fontFamily:
        "BitterBold",
      fontSize: 11.5,
      marginLeft: 7,
    },

    deleteButton: {
      width: "100%",
      minHeight: 52,
      borderRadius: 17,
      borderWidth: 1,
      flexDirection:
        "row",
      alignItems:
        "center",
      justifyContent:
        "center",
      marginTop: 16,
    },

    deleteButtonText: {
      fontFamily:
        "BitterBold",
      fontSize: 11.5,
      marginLeft: 8,
    },

    finalDivider: {
      width: "60%",
      height: 1,
      alignSelf:
        "center",
      marginTop: 35,
    },

    textInputPlaceholder: {},
  });