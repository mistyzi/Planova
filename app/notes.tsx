import React, { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import StarryBackground from "@/components/starrybackground";
import { useTheme } from "@/context/themecontext";
import { addNote, getNotes, StoredNote } from "./noteStorage";
import { scanMultipleImages } from "./ocr";

type NoteFilter = "All" | "Text" | "Images";

export default function NotesScreen() {
  const { isDark } = useTheme();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<NoteFilter>("All");
  const [notes, setNotes] = useState<StoredNote[]>([]);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraRef, setCameraRef] = useState<CameraView | null>(null);
  const [isScanning, setIsScanning] = useState(false);
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
        filterBackground: "rgba(14,25,56,0.65)",
        filterBorder: "rgba(196,181,253,0.25)",
        activeFilter: "rgba(192,132,252,0.25)",
        activeFilterBorder: "#c084fc",
        divider: "rgba(196,181,253,0.40)",
        primary: "#8064B5",
        primaryText: "#ffffff",
        overlay: "rgba(8,12,30,0.75)",
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
        filterBackground: "rgba(255,255,255,0.65)",
        filterBorder: "rgba(79,66,125,0.20)",
        activeFilter: "rgba(185,169,223,0.30)",
        activeFilterBorder: "#8069B3",
        divider: "rgba(79,66,125,0.40)",
        primary: "#8069B3",
        primaryText: "#ffffff",
        overlay: "rgba(30,25,50,0.60)",
      };

  const loadNotes = useCallback(async () => {
    try {
      const storedNotes = await getNotes();
      setNotes(storedNotes);
    } catch (error) {
      console.log("Failed to load notes:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [loadNotes])
  );

  const filteredNotes = useMemo(() => {
    const query = search.trim().toLowerCase();
    return notes.filter((note) => {
      const matchesSearch =
        !query ||
        note.title.toLowerCase().includes(query) ||
        note.preview.toLowerCase().includes(query) ||
        note.extractedText?.toLowerCase().includes(query);
      const matchesFilter = activeFilter === "All" || note.type === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [notes, search, activeFilter]);

  const createTextNote = () => {
    setShowCreateMenu(false);
    router.push({
      pathname: "/note",
      params: {
        mode: "create",
        type: "Text",
      },
    });
  };

  const createImageNote = async (imageUris: string[]) => {
    if (imageUris.length === 0) return;
    try {
      setIsScanning(true);
      const combinedText = await scanMultipleImages(imageUris);
      const newNote: StoredNote = {
        id: Date.now().toString() + Math.random().toString(36).slice(2),
        title: imageUris.length === 1 ? "Imported Study Notes" : `Imported Study Notes (${imageUris.length} pages)`,
        type: "Images",
        preview: combinedText.length > 0 ? combinedText.slice(0, 120) : "Image study notes",
        date: "Just now",
        images: imageUris,
        extractedText: combinedText,
      };
      await addNote(newNote);
      await loadNotes();
      router.push({
        pathname: "/note",
        params: {
          id: newNote.id,
        },
      });
    } catch (error) {
      console.log("Failed to create image note:", error);
      Alert.alert(
        "Scan Failed",
        "The images were imported, but the text could not be scanned. Check your OCR API key and try again."
      );
    } finally {
      setIsScanning(false);
    }
  };

  const openCamera = async () => {
    setShowCreateMenu(false);
    if (!cameraPermission?.granted) {
      const permission = await requestCameraPermission();
      if (!permission.granted) {
        Alert.alert("Camera Permission", "Camera access is needed to take pictures of your study notes.");
        return;
      }
    }
    setShowCamera(true);
  };

  const pickFromGallery = async () => {
    setShowCreateMenu(false);
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Photo Permission", "Photo library access is needed to import your study notes.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }
    const imageUris = result.assets.map((asset) => asset.uri).filter(Boolean);
    await createImageNote(imageUris);
  };

  const pickFiles = async () => {
    setShowCreateMenu(false);
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*"],
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets || result.assets.length === 0) {
      return;
    }
    const imageUris = result.assets.map((asset) => asset.uri).filter(Boolean);
    await createImageNote(imageUris);
  };

  const takePhoto = async () => {
    if (!cameraRef) return;
    try {
      setIsSaving(true);
      const photo = await cameraRef.takePictureAsync({
        quality: 1,
      });
      if (photo?.uri) {
        setShowCamera(false);
        await createImageNote([photo.uri]);
      }
    } catch (error) {
      console.log("Camera error:", error);
      Alert.alert("Camera Error", "The photo could not be taken.");
    } finally {
      setIsSaving(false);
    }
  };

  const filters: NoteFilter[] = ["All", "Text", "Images"];

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
      <TouchableOpacity activeOpacity={0.7} onPress={() => router.back()} style={styles.backButton}>
        <Ionicons name="arrow-back" size={25} color={colors.title} />
      </TouchableOpacity>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.title }]}>Notes</Text>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Keep your written notes and scanned study pages together.
          </Text>
        </View>
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.input,
              borderColor: colors.inputBorder,
            },
          ]}
        >
          <Ionicons name="search-outline" size={21} color={colors.secondaryText} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search your notes..."
            placeholderTextColor={colors.secondaryText}
            style={[
              styles.searchInput,
              {
                color: colors.text,
              },
            ]}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={19} color={colors.secondaryText} />
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.filterRow}>
          {filters.map((filter) => {
            const active = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                activeOpacity={0.8}
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: active ? colors.activeFilter : colors.filterBackground,
                    borderColor: active ? colors.activeFilterBorder : colors.filterBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    {
                      color: active ? colors.title : colors.secondaryText,
                    },
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={createTextNote}
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View
              style={[
                styles.actionIcon,
                {
                  backgroundColor: colors.iconBackground,
                },
              ]}
            >
              <Ionicons name="create-outline" size={21} color={colors.icon} />
            </View>
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>New Note</Text>
              <Text style={[styles.actionSubtitle, { color: colors.secondaryText }]}>Write something</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowCreateMenu(true)}
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View
              style={[
                styles.actionIcon,
                {
                  backgroundColor: colors.iconBackground,
                },
              ]}
            >
              <Ionicons name="images-outline" size={21} color={colors.icon} />
            </View>
            <View style={styles.actionText}>
              <Text style={[styles.actionTitle, { color: colors.text }]}>Import</Text>
              <Text style={[styles.actionSubtitle, { color: colors.secondaryText }]}>Scan study pages</Text>
            </View>
          </TouchableOpacity>
        </View>
        {(isScanning || isSaving) && (
          <View
            style={[
              styles.processingCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <Ionicons name="scan-outline" size={24} color={colors.icon} />
            <View style={styles.processingText}>
              <Text style={[styles.processingTitle, { color: colors.text }]}>Scanning your notes...</Text>
              <Text style={[styles.processingSubtitle, { color: colors.secondaryText }]}>
                Reading the text from your study pages.
              </Text>
            </View>
          </View>
        )}
        <View style={styles.notesHeader}>
          <Text style={[styles.notesTitle, { color: colors.title }]}>Your Notes</Text>
          <Text style={[styles.noteCount, { color: colors.secondaryText }]}>
            {filteredNotes.length} {filteredNotes.length === 1 ? "note" : "notes"}
          </Text>
        </View>
        {filteredNotes.length > 0 ? (
          <View style={styles.notesList}>
            {filteredNotes.map((note) => (
              <TouchableOpacity
                key={note.id}
                activeOpacity={0.82}
                onPress={() =>
                  router.push({
                    pathname: "/note",
                    params: {
                      id: note.id,
                    },
                  })
                }
                style={[
                  styles.noteCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                {note.type === "Images" && note.images && note.images.length > 0 ? (
                  <View style={styles.imagePreview}>
                    <Image source={{ uri: note.images[0] }} style={styles.noteImage} />
                    {note.images.length > 1 && (
                      <View
                        style={[
                          styles.pageCount,
                          {
                            backgroundColor: colors.primary,
                          },
                        ]}
                      >
                        <Text style={styles.pageCountText}>+{note.images.length - 1}</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View
                    style={[
                      styles.noteIcon,
                      {
                        backgroundColor: colors.iconBackground,
                      },
                    ]}
                  >
                    <Ionicons name="document-text-outline" size={25} color={colors.icon} />
                  </View>
                )}
                <View style={styles.noteInfo}>
                  <View style={styles.noteTopRow}>
                    <Text numberOfLines={1} style={[styles.noteTitle, { color: colors.text }]}>
                      {note.title}
                    </Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.secondaryText} />
                  </View>
                  <Text numberOfLines={2} style={[styles.notePreview, { color: colors.secondaryText }]}>
                    {note.preview}
                  </Text>
                  <View style={styles.noteBottomRow}>
                    <View
                      style={[
                        styles.typeBadge,
                        {
                          backgroundColor: colors.iconBackground,
                        },
                      ]}
                    >
                      <Text style={[styles.typeText, { color: colors.secondaryText }]}>{note.type}</Text>
                    </View>
                    <Text style={[styles.noteDate, { color: colors.secondaryText }]}>{note.date}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
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
              <Ionicons name="document-outline" size={27} color={colors.icon} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No notes found</Text>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              Create a text note or import your study pages.
            </Text>
          </View>
        )}
        <View style={[styles.finalDivider, { backgroundColor: colors.divider }]} />
      </ScrollView>

      <Modal
        visible={showCreateMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCreateMenu(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
          <View
            style={[
              styles.importMenu,
              {
                backgroundColor: isDark ? "#121c3d" : "#ffffff",
                borderColor: colors.cardBorder,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Add Study Notes</Text>
                <Text style={[styles.modalSubtitle, { color: colors.secondaryText }]}>
                  Create one image note from one or more pages.
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowCreateMenu(false)}>
                <Ionicons name="close" size={24} color={colors.secondaryText} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={openCamera}
              style={[
                styles.menuOption,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor: colors.iconBackground,
                  },
                ]}
              >
                <Ionicons name="camera-outline" size={24} color={colors.icon} />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>Take Photo</Text>
                <Text style={[styles.menuSubtitle, { color: colors.secondaryText }]}>Photograph your notes</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={pickFromGallery}
              style={[
                styles.menuOption,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor: colors.iconBackground,
                  },
                ]}
              >
                <Ionicons name="images-outline" size={24} color={colors.icon} />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>Choose from Gallery</Text>
                <Text style={[styles.menuSubtitle, { color: colors.secondaryText }]}>Select multiple pages</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={pickFiles}
              style={[
                styles.menuOption,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View
                style={[
                  styles.menuIcon,
                  {
                    backgroundColor: colors.iconBackground,
                  },
                ]}
              >
                <Ionicons name="folder-open-outline" size={24} color={colors.icon} />
              </View>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: colors.text }]}>Choose Files</Text>
                <Text style={[styles.menuSubtitle, { color: colors.secondaryText }]}>Import image files</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showCamera}
        animationType="slide"
        onRequestClose={() => setShowCamera(false)}
      >
        <View style={styles.cameraContainer}>
          <CameraView ref={(ref) => setCameraRef(ref)} style={styles.camera} facing="back" />
          <View style={styles.cameraControls}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setShowCamera(false)} style={styles.cameraCancel}>
              <Ionicons name="close" size={26} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={takePhoto}
              style={styles.captureButton}
              disabled={isSaving}
            >
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <View style={styles.cameraPlaceholder} />
          </View>
        </View>
      </Modal>
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
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
    zIndex: 2,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 60,
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontFamily: "BitterBold",
    fontSize: 29,
    marginBottom: 14,
    textAlign: "center",
  },
  divider: {
    width: "60%",
    height: 1,
    marginBottom: 16,
  },
  subtitle: {
    fontFamily: "Bitter",
    fontSize: 12.5,
    lineHeight: 19,
    textAlign: "center",
    maxWidth: 315,
  },
  searchContainer: {
    width: "100%",
    height: 50,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 13,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Bitter",
    fontSize: 12.5,
    marginLeft: 10,
    paddingVertical: 0,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  filterButton: {
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  filterText: {
    fontFamily: "BitterBold",
    fontSize: 10.5,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  actionButton: {
    width: "48.3%",
    minHeight: 76,
    borderRadius: 19,
    borderWidth: 1,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  actionText: {
    flex: 1,
  },
  actionTitle: {
    fontFamily: "BitterBold",
    fontSize: 12.5,
    marginBottom: 3,
  },
  actionSubtitle: {
    fontFamily: "Bitter",
    fontSize: 9.5,
  },
  processingCard: {
    minHeight: 72,
    borderRadius: 18,
    borderWidth: 1,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  processingText: {
    marginLeft: 12,
    flex: 1,
  },
  processingTitle: {
    fontFamily: "BitterBold",
    fontSize: 12.5,
    marginBottom: 3,
  },
  processingSubtitle: {
    fontFamily: "Bitter",
    fontSize: 9.5,
  },
  notesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  notesTitle: {
    fontFamily: "BitterBold",
    fontSize: 19,
  },
  noteCount: {
    fontFamily: "Bitter",
    fontSize: 10.5,
  },
  notesList: {
    gap: 12,
  },
  noteCard: {
    width: "100%",
    minHeight: 112,
    borderRadius: 20,
    borderWidth: 1,
    padding: 12,
    flexDirection: "row",
  },
  imagePreview: {
    width: 84,
    height: 86,
    marginRight: 13,
    position: "relative",
  },
  noteImage: {
    width: 84,
    height: 86,
    borderRadius: 14,
  },
  pageCount: {
    position: "absolute",
    right: 5,
    bottom: 5,
    minWidth: 25,
    height: 25,
    paddingHorizontal: 6,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  pageCountText: {
    color: "#ffffff",
    fontFamily: "BitterBold",
    fontSize: 9,
  },
  noteIcon: {
    width: 84,
    height: 86,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 13,
  },
  noteInfo: {
    flex: 1,
    minWidth: 0,
  },
  noteTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  noteTitle: {
    flex: 1,
    fontFamily: "BitterBold",
    fontSize: 13.5,
    marginRight: 6,
  },
  notePreview: {
    fontFamily: "Bitter",
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 8,
  },
  noteBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeText: {
    fontFamily: "BitterBold",
    fontSize: 8.5,
  },
  noteDate: {
    fontFamily: "Bitter",
    fontSize: 9,
  },
  emptyCard: {
    width: "100%",
    minHeight: 190,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },
  emptyIcon: {
    width: 52,
    height: 52,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontFamily: "BitterBold",
    fontSize: 15,
    marginBottom: 6,
  },
  emptyText: {
    fontFamily: "Bitter",
    fontSize: 10.5,
    textAlign: "center",
  },
  finalDivider: {
    width: "60%",
    height: 1,
    alignSelf: "center",
    marginTop: 32,
  },
  modalOverlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 20,
  },
  importMenu: {
    width: "100%",
    borderRadius: 25,
    borderWidth: 1,
    padding: 20,
    marginBottom: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  modalTitle: {
    fontFamily: "BitterBold",
    fontSize: 19,
    marginBottom: 5,
  },
  modalSubtitle: {
    fontFamily: "Bitter",
    fontSize: 10.5,
    maxWidth: 270,
    lineHeight: 16,
  },
  menuOption: {
    minHeight: 70,
    borderRadius: 17,
    borderWidth: 1,
    padding: 11,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  menuIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: "BitterBold",
    fontSize: 13,
    marginBottom: 4,
  },
  menuSubtitle: {
    fontFamily: "Bitter",
    fontSize: 9.5,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 125,
    paddingHorizontal: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cameraCancel: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 3,
    borderColor: "#6b41bf",
  },
  cameraPlaceholder: {
    width: 48,
    height: 48,
  },
});