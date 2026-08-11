import StarryBackground from "@/components/starrybackground";
import { useTheme } from "@/context/themecontext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  Bookmark,
  deleteBookmark,
  getBookmarks,
} from "../storage/bookmarkStorage";

export default function BookmarksScreen() {
  const { isDark } = useTheme();

  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [search, setSearch] = useState("");
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
        input: "rgba(14,25,56,0.70)",
        inputBorder: "rgba(196,181,253,0.28)",
        iconBackground: "rgba(196,181,253,0.14)",
        icon: "#c4b5fd",
        primary: "#8064B5",
        danger: "rgba(248,113,113,0.12)",
        dangerBorder: "rgba(248,113,113,0.25)",
        dangerText: "#fca5a5",
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
        primary: "#8069B3",
        danger: "rgba(220,38,38,0.07)",
        dangerBorder: "rgba(220,38,38,0.18)",
        dangerText: "#b91c1c",
        divider: "rgba(79,66,125,0.40)",
      };

  const loadBookmarks = useCallback(async () => {
    try {
      const storedBookmarks = await getBookmarks();
      setBookmarks(storedBookmarks);
    } catch (error) {
      console.log("Failed to load bookmarks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const filteredBookmarks = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return bookmarks;

    return bookmarks.filter(
      (bookmark) =>
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query) ||
        bookmark.description?.toLowerCase().includes(query),
    );
  }, [bookmarks, search]);

  const handleDelete = (bookmark: Bookmark) => {
    Alert.alert(
      "Remove Bookmark",
      `Remove "${bookmark.title}" from your bookmarks?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteBookmark(bookmark.id);

              setBookmarks((current) =>
                current.filter(
                  (item) => item.id !== bookmark.id,
                ),
              );
            } catch (error) {
              console.log("Failed to delete bookmark:", error);

              Alert.alert(
                "Delete failed",
                "The bookmark could not be removed.",
              );
            }
          },
        },
      ],
    );
  };

  const openBookmark = async (url: string) => {
    try {
      const formattedUrl =
        url.startsWith("http://") ||
        url.startsWith("https://")
          ? url
          : `https://${url}`;

      const supported = await Linking.canOpenURL(
        formattedUrl,
      );

      if (!supported) {
        Alert.alert(
          "Unable to open",
          "This link could not be opened.",
        );
        return;
      }

      await Linking.openURL(formattedUrl);
    } catch (error) {
      console.log("Failed to open bookmark:", error);

      Alert.alert(
        "Unable to open",
        "This link could not be opened.",
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={backgroundColors}
          style={StyleSheet.absoluteFillObject}
        />

        <View
          pointerEvents="none"
          style={styles.stars}
        >
          <StarryBackground />
        </View>

        <View style={styles.loading}>
          <ActivityIndicator
            size="large"
            color={colors.icon}
          />
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

      <View
        pointerEvents="none"
        style={styles.stars}
      >
        <StarryBackground />
      </View>

      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={25}
            color={colors.title}
          />
        </TouchableOpacity>

        {/* PLUS BUTTON -> BOOKMARK MAKER */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push("/bookmarkMaker")}
          style={[
            styles.addButton,
            {
              backgroundColor: colors.iconBackground,
            },
          ]}
        >
          <Ionicons
            name="add"
            size={24}
            color={colors.title}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleSection}>
          <Text
            style={[
              styles.pageTitle,
              { color: colors.title },
            ]}
          >
            Bookmarks
          </Text>

          <View
            style={[
              styles.constellationLine,
              { backgroundColor: colors.divider },
            ]}
          />

          <Text
            style={[
              styles.pageSubtitle,
              { color: colors.secondaryText },
            ]}
          >
            Keep useful websites, articles, and study
            resources in one place.
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
          <Ionicons
            name="search-outline"
            size={19}
            color={colors.secondaryText}
          />

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search bookmarks..."
            placeholderTextColor={colors.secondaryText}
            style={[
              styles.searchInput,
              {
                color: colors.text,
              },
            ]}
          />

          {search.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSearch("")}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.secondaryText}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.listHeader}>
          <View>
            <Text
              style={[
                styles.listTitle,
                { color: colors.title },
              ]}
            >
              My Bookmarks
            </Text>

            <Text
              style={[
                styles.listSubtitle,
                { color: colors.secondaryText },
              ]}
            >
              {filteredBookmarks.length}{" "}
              {filteredBookmarks.length === 1
                ? "resource"
                : "resources"}
            </Text>
          </View>

          <View
            style={[
              styles.bookmarkCount,
              {
                backgroundColor: colors.iconBackground,
              },
            ]}
          >
            <Ionicons
              name="bookmark"
              size={15}
              color={colors.icon}
            />

            <Text
              style={[
                styles.bookmarkCountText,
                { color: colors.icon },
              ]}
            >
              {bookmarks.length}
            </Text>
          </View>
        </View>

        {filteredBookmarks.length === 0 && (
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
              <Ionicons
                name={
                  search.length > 0
                    ? "search-outline"
                    : "bookmark-outline"
                }
                size={29}
                color={colors.icon}
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                { color: colors.text },
              ]}
            >
              {search.length > 0
                ? "No bookmarks found"
                : "No bookmarks yet"}
            </Text>

            <Text
              style={[
                styles.emptyDescription,
                { color: colors.secondaryText },
              ]}
            >
              {search.length > 0
                ? "Try searching for a different resource."
                : "Save useful websites and study resources here so you can find them later."}
            </Text>

            {search.length === 0 && (
              <TouchableOpacity
                activeOpacity={0.82}
                onPress={() =>
                  router.push("/bookmarkMaker")
                }
                style={[
                  styles.emptyButton,
                  {
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <Ionicons
                  name="add"
                  size={18}
                  color="#ffffff"
                />

                <Text style={styles.emptyButtonText}>
                  Add Bookmark
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={styles.bookmarkList}>
          {filteredBookmarks.map((bookmark) => (
            <View
              key={bookmark.id}
              style={[
                styles.bookmarkCard,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <View style={styles.bookmarkTop}>
                <View
                  style={[
                    styles.bookmarkIcon,
                    {
                      backgroundColor:
                        colors.iconBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name="bookmark"
                    size={21}
                    color={colors.icon}
                  />
                </View>

                <View style={styles.bookmarkInfo}>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.bookmarkTitle,
                      { color: colors.text },
                    ]}
                  >
                    {bookmark.title}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.bookmarkUrl,
                      {
                        color: colors.secondaryText,
                      },
                    ]}
                  >
                    {bookmark.url}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleDelete(bookmark)}
                  style={styles.deleteButton}
                >
                  <Ionicons
                    name="trash-outline"
                    size={19}
                    color={colors.secondaryText}
                  />
                </TouchableOpacity>
              </View>

              {!!bookmark.description && (
                <Text
                  numberOfLines={3}
                  style={[
                    styles.bookmarkDescription,
                    {
                      color: colors.secondaryText,
                    },
                  ]}
                >
                  {bookmark.description}
                </Text>
              )}

              <View style={styles.bookmarkBottom}>
                <View style={styles.dateContainer}>
                  <Ionicons
                    name="time-outline"
                    size={13}
                    color={colors.secondaryText}
                  />

                  <Text
                    style={[
                      styles.dateText,
                      {
                        color: colors.secondaryText,
                      },
                    ]}
                  >
                    {bookmark.date}
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.82}
                  onPress={() =>
                    openBookmark(bookmark.url)
                  }
                  style={[
                    styles.openButton,
                    {
                      backgroundColor:
                        colors.iconBackground,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.openButtonText,
                      {
                        color: colors.icon,
                      },
                    ]}
                  >
                    Open
                  </Text>

                  <Ionicons
                    name="open-outline"
                    size={15}
                    color={colors.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View
          style={[
            styles.finalDivider,
            { backgroundColor: colors.divider },
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

  addButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
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

  titleSection: {
    alignItems: "center",
    marginBottom: 25,
  },

  pageTitle: {
    fontFamily: "BitterBold",
    fontSize: 24,
    textAlign: "center",
    marginBottom: 13,
  },

  constellationLine: {
    width: "60%",
    height: 1,
    alignSelf: "center",
    marginBottom: 13,
  },

  pageSubtitle: {
    fontFamily: "Bitter",
    fontSize: 10.5,
    lineHeight: 17,
    textAlign: "center",
    maxWidth: 310,
  },

  searchContainer: {
    width: "100%",
    minHeight: 50,
    borderRadius: 15,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    marginBottom: 25,
  },

  searchInput: {
    flex: 1,
    fontFamily: "Bitter",
    fontSize: 11.5,
    marginLeft: 9,
    paddingVertical: 10,
  },

  listHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  listTitle: {
    fontFamily: "BitterBold",
    fontSize: 19,
  },

  listSubtitle: {
    fontFamily: "Bitter",
    fontSize: 9.5,
    marginTop: 3,
  },

  bookmarkCount: {
    minWidth: 38,
    height: 32,
    borderRadius: 11,
    paddingHorizontal: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  bookmarkCountText: {
    fontFamily: "BitterBold",
    fontSize: 10,
    marginLeft: 5,
  },

  bookmarkList: {
    gap: 13,
  },

  bookmarkCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 17,
  },

  bookmarkTop: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  bookmarkIcon: {
    width: 45,
    height: 45,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  bookmarkInfo: {
    flex: 1,
    paddingRight: 8,
  },

  bookmarkTitle: {
    fontFamily: "BitterBold",
    fontSize: 14,
    lineHeight: 19,
  },

  bookmarkUrl: {
    fontFamily: "Bitter",
    fontSize: 9,
    marginTop: 4,
  },

  deleteButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  bookmarkDescription: {
    fontFamily: "Bitter",
    fontSize: 10.5,
    lineHeight: 17,
    marginTop: 13,
  },

  bookmarkBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 15,
  },

  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  dateText: {
    fontFamily: "Bitter",
    fontSize: 8.5,
    marginLeft: 5,
  },

  openButton: {
    minHeight: 35,
    paddingHorizontal: 12,
    borderRadius: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },

  openButtonText: {
    fontFamily: "BitterBold",
    fontSize: 9.5,
    marginRight: 5,
  },

  emptyCard: {
    width: "100%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 25,
    alignItems: "center",
  },

  emptyIcon: {
    width: 55,
    height: 55,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  emptyTitle: {
    fontFamily: "BitterBold",
    fontSize: 16,
    textAlign: "center",
  },

  emptyDescription: {
    fontFamily: "Bitter",
    fontSize: 10.5,
    lineHeight: 17,
    textAlign: "center",
    maxWidth: 290,
    marginTop: 7,
  },

  emptyButton: {
    minHeight: 44,
    paddingHorizontal: 18,
    borderRadius: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },

  emptyButtonText: {
    color: "#ffffff",
    fontFamily: "BitterBold",
    fontSize: 10,
    marginLeft: 6,
  },

  finalDivider: {
    width: "60%",
    height: 1,
    alignSelf: "center",
    marginTop: 13,
    marginBottom: 13,
  },
});