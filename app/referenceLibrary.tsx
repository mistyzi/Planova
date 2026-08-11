import StarryBackground from "@/components/starrybackground";
import { useTheme } from "@/context/themecontext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    deleteReference,
    getReferences,
    Reference,
    ReferenceType,
} from "../storage/referenceStorage";

const referenceTypes: ReferenceType[] = [
  "Book",
  "Article",
  "Website",
  "Journal",
  "Video",
  "Other",
];

export default function ReferenceLibraryScreen() {
  const { isDark } = useTheme();
  const [references, setReferences] = useState<Reference[]>([]);
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<ReferenceType | "All">(
    "All",
  );
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
        iconBackground: "rgba(79,66,125,0.10)",
        icon: "#4F427D",
        selected: "rgba(185,169,223,0.25)",
        selectedBorder: "rgba(79,66,125,0.35)",
        primary: "#8069B3",
        divider: "rgba(79,66,125,0.40)",
      };

  const loadReferences = useCallback(async () => {
    try {
      const stored = await getReferences();
      setReferences(stored);
    } catch (error) {
      console.log("Failed to load references:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  const filteredReferences = references.filter((reference) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      reference.author.toLowerCase().includes(query) ||
      reference.title.toLowerCase().includes(query) ||
      reference.publication.toLowerCase().includes(query);
    const matchesType =
      selectedType === "All" || reference.type === selectedType;
    return matchesSearch && matchesType;
  });

  const confirmDelete = (reference: Reference) => {
    Alert.alert(
      "Delete Reference",
      `Remove "${reference.title}" from your reference library?`,
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
              await deleteReference(reference.id);
              await loadReferences();
            } catch (error) {
              console.log("Failed to delete reference:", error);
              Alert.alert(
                "Delete failed",
                "The reference could not be deleted.",
              );
            }
          },
        },
      ],
    );
  };

  const openReference = async (url: string) => {
    if (!url.trim()) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Unable to open link", "This link could not be opened.");
      }
    } catch (error) {
      console.log("Failed to open reference:", error);
    }
  };

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
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.push("/referenceMaker")}
          style={[
            styles.headerButton,
            {
              backgroundColor: colors.iconBackground,
            },
          ]}
        >
          <Ionicons name="add" size={23} color={colors.icon} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageIntro}>
          <Text style={[styles.pageTitle, { color: colors.title }]}>
            References
          </Text>
          <Text style={[styles.pageSubtitle, { color: colors.secondaryText }]}>
            Keep your sources organized and ready to cite.
          </Text>
        </View>
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Ionicons
            name="search-outline"
            size={19}
            color={colors.secondaryText}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search references..."
            placeholderTextColor={colors.secondaryText}
            style={[
              styles.searchInput,
              {
                color: colors.text,
              },
            ]}
          />
          {!!search && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.secondaryText}
              />
            </TouchableOpacity>
          )}
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setSelectedType("All")}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  selectedType === "All" ? colors.selected : colors.card,
                borderColor:
                  selectedType === "All"
                    ? colors.selectedBorder
                    : colors.cardBorder,
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    selectedType === "All" ? colors.icon : colors.secondaryText,
                },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          {referenceTypes.map((referenceType) => {
            const selected = selectedType === referenceType;
            return (
              <TouchableOpacity
                key={referenceType}
                activeOpacity={0.8}
                onPress={() => setSelectedType(referenceType)}
                style={[
                  styles.filterButton,
                  {
                    backgroundColor: selected ? colors.selected : colors.card,
                    borderColor: selected
                      ? colors.selectedBorder
                      : colors.cardBorder,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
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
        </ScrollView>
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.icon} />
          </View>
        ) : filteredReferences.length === 0 ? (
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
              <Ionicons name="library-outline" size={27} color={colors.icon} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No References Yet
            </Text>
            <Text
              style={[styles.emptyDescription, { color: colors.secondaryText }]}
            >
              Add books, articles, websites, journals, and other sources here.
            </Text>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={() => router.push("/referenceMaker")}
              style={[
                styles.addButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Ionicons name="add" size={19} color="#ffffff" />
              <Text style={styles.addButtonText}>Add Reference</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.referenceList}>
            {filteredReferences.map((reference, index) => (
              <View
                key={reference.id}
                style={[
                  styles.referenceCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View style={styles.referenceTop}>
                  <View
                    style={[
                      styles.typeBadge,
                      {
                        backgroundColor: colors.iconBackground,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.typeBadgeText, { color: colors.icon }]}
                    >
                      {reference.type}
                    </Text>
                  </View>
                  <View style={styles.referenceActions}>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() =>
                        router.push({
                          pathname: "/referenceMaker",
                          params: {
                            id: reference.id,
                            mode: "edit",
                          },
                        })
                      }
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color={colors.secondaryText}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => confirmDelete(reference)}
                      style={styles.actionButton}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={colors.secondaryText}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={[styles.author, { color: colors.secondaryText }]}>
                  {reference.author}
                </Text>
                <Text style={[styles.referenceTitle, { color: colors.text }]}>
                  {reference.title}
                </Text>
                <Text
                  style={[styles.publication, { color: colors.secondaryText }]}
                >
                  {reference.publication || "Publication not specified"}
                  {reference.year ? ` · ${reference.year}` : ""}
                </Text>
                <View
                  style={[
                    styles.citationLine,
                    {
                      backgroundColor: colors.divider,
                    },
                  ]}
                />
                <Text style={[styles.citation, { color: colors.text }]}>
                  {reference.author}.{" "}
                  <Text style={styles.citationTitle}>{reference.title}</Text>
                  {reference.publication ? `. ${reference.publication}` : ""}
                  {reference.year ? `, ${reference.year}` : ""}.
                </Text>
                {!!reference.url && (
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => openReference(reference.url)}
                    style={styles.linkRow}
                  >
                    <Ionicons
                      name="link-outline"
                      size={15}
                      color={colors.icon}
                    />
                    <Text
                      numberOfLines={2}
                      style={[styles.linkText, { color: colors.icon }]}
                    >
                      {reference.url}
                    </Text>
                  </TouchableOpacity>
                )}
                {!!reference.notes && (
                  <View style={styles.notesBox}>
                    <Text
                      style={[
                        styles.notesLabel,
                        { color: colors.secondaryText },
                      ]}
                    >
                      NOTES
                    </Text>
                    <Text style={[styles.notes, { color: colors.text }]}>
                      {reference.notes}
                    </Text>
                  </View>
                )}
                <Text
                  style={[
                    styles.referenceNumber,
                    { color: colors.secondaryText },
                  ]}
                >
                  [{index + 1}]
                </Text>
              </View>
            ))}
          </View>
        )}
        <View
          style={[
            styles.bottomDivider,
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
  pageIntro: {
    alignItems: "center",
    marginBottom: 22,
  },
  pageTitle: {
    fontFamily: "BitterBold",
    fontSize: 27,
    marginBottom: 7,
  },
  pageSubtitle: {
    fontFamily: "Bitter",
    fontSize: 10.5,
    textAlign: "center",
    lineHeight: 17,
  },
  searchBox: {
    width: "100%",
    minHeight: 48,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Bitter",
    fontSize: 11,
    marginLeft: 8,
    paddingVertical: 0,
  },
  filterScroll: {
    marginTop: 13,
    marginBottom: 20,
  },
  filterContent: {
    gap: 8,
  },
  filterButton: {
    minHeight: 35,
    paddingHorizontal: 12,
    borderRadius: 11,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  filterText: {
    fontFamily: "BitterBold",
    fontSize: 9,
  },
  loading: {
    paddingVertical: 70,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    width: "100%",
    borderRadius: 22,
    borderWidth: 1,
    padding: 25,
    alignItems: "center",
    marginTop: 5,
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
    fontSize: 16,
    marginBottom: 7,
  },
  emptyDescription: {
    fontFamily: "Bitter",
    fontSize: 10.5,
    lineHeight: 17,
    textAlign: "center",
    maxWidth: 280,
  },
  addButton: {
    minHeight: 47,
    paddingHorizontal: 20,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  addButtonText: {
    color: "#ffffff",
    fontFamily: "BitterBold",
    fontSize: 10.5,
    marginLeft: 7,
  },
  referenceList: {
    gap: 14,
  },
  referenceCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    position: "relative",
  },
  referenceTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  typeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 9,
  },
  typeBadgeText: {
    fontFamily: "BitterBold",
    fontSize: 8,
    textTransform: "uppercase",
  },
  referenceActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  actionButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  author: {
    fontFamily: "BitterBold",
    fontSize: 10,
    marginBottom: 5,
  },
  referenceTitle: {
    fontFamily: "BitterBold",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 5,
    paddingRight: 5,
  },
  publication: {
    fontFamily: "Bitter",
    fontSize: 10,
    lineHeight: 16,
  },
  citationLine: {
    width: "100%",
    height: 1,
    marginVertical: 14,
  },
  citation: {
    fontFamily: "Bitter",
    fontSize: 10.5,
    lineHeight: 18,
  },
  citationTitle: {
    fontFamily: "BitterBold",
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
  },
  linkText: {
    flex: 1,
    fontFamily: "Bitter",
    fontSize: 9.5,
    lineHeight: 15,
    marginLeft: 6,
    textDecorationLine: "underline",
  },
  notesBox: {
    marginTop: 14,
  },
  notesLabel: {
    fontFamily: "BitterBold",
    fontSize: 7.5,
    letterSpacing: 0.7,
    marginBottom: 5,
  },
  notes: {
    fontFamily: "Bitter",
    fontSize: 9.5,
    lineHeight: 16,
  },
  referenceNumber: {
    position: "absolute",
    right: 17,
    bottom: 15,
    fontFamily: "BitterBold",
    fontSize: 8,
  },
  bottomDivider: {
    width: "60%",
    height: 1,
    alignSelf: "center",
    marginTop: 35,
  },
});
