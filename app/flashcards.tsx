import StarryBackground from "@/components/starrybackground";
import { useTheme } from "@/context/themecontext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    deleteFlashcardDeck,
    FlashcardDeck,
    getFlashcardDecks,
} from "../storage/flashcardStorage";

export default function FlashcardsScreen() {
  const { isDark } = useTheme();
  const [search, setSearch] = useState("");
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
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
        divider: "rgba(196,181,253,0.40)",
        primary: "#8064B5",
        primaryText: "#ffffff",
        activeFilter: "rgba(192,132,252,0.25)",
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
        divider: "rgba(79,66,125,0.40)",
        primary: "#8069B3",
        primaryText: "#ffffff",
        activeFilter: "rgba(185,169,223,0.30)",
        overlay: "rgba(30,25,50,0.60)",
      };

  const loadDecks = useCallback(async () => {
    try {
      setIsLoading(true);
      const storedDecks = await getFlashcardDecks();
      setDecks(storedDecks);
    } catch (error) {
      console.log("Failed to load flashcard decks:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadDecks();
    }, [loadDecks]),
  );

  const filteredDecks = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return decks;
    return decks.filter(
      (deck) =>
        deck.title.toLowerCase().includes(query) ||
        deck.description.toLowerCase().includes(query),
    );
  }, [decks, search]);

  const createDeck = () => {
    router.push({
      pathname: "/flashcardMaker",
      params: {
        mode: "create",
      },
    });
  };

  const confirmDelete = (deck: FlashcardDeck) => {
    Alert.alert(
      "Delete Deck",
      `Are you sure you want to delete "${deck.title}"?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteFlashcardDeck(deck.id);
            await loadDecks();
          },
        },
      ],
    );
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
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.back()}
        style={styles.backButton}
      >
        <Ionicons name="arrow-back" size={25} color={colors.title} />
      </TouchableOpacity>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.title }]}>
            Flashcards
          </Text>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            Create and organize your study decks.
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
            size={21}
            color={colors.secondaryText}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search your decks..."
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
              <Ionicons
                name="close-circle"
                size={19}
                color={colors.secondaryText}
              />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={createDeck}
          style={[
            styles.createButton,
            {
              backgroundColor: colors.primary,
            },
          ]}
        >
          <Ionicons name="add" size={22} color="#ffffff" />
          <Text style={styles.createButtonText}>Create Flashcard Deck</Text>
        </TouchableOpacity>
        <View style={styles.deckHeader}>
          <Text style={[styles.deckHeaderTitle, { color: colors.title }]}>
            Your Decks
          </Text>
          <Text style={[styles.deckCount, { color: colors.secondaryText }]}>
            {filteredDecks.length}{" "}
            {filteredDecks.length === 1 ? "deck" : "decks"}
          </Text>
        </View>
        {filteredDecks.length > 0 ? (
          <View style={styles.deckList}>
            {filteredDecks.map((deck) => (
              <TouchableOpacity
                key={deck.id}
                activeOpacity={0.82}
                onPress={() =>
                  router.push({
                    pathname: "/flashcard",
                    params: {
                      id: deck.id,
                    },
                  })
                }
                style={[
                  styles.deckCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.deckIcon,
                    {
                      backgroundColor: colors.iconBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name="albums-outline"
                    size={26}
                    color={colors.icon}
                  />
                </View>
                <View style={styles.deckInfo}>
                  <View style={styles.deckTopRow}>
                    <Text
                      numberOfLines={1}
                      style={[styles.deckTitle, { color: colors.text }]}
                    >
                      {deck.title}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={colors.secondaryText}
                    />
                  </View>
                  {!!deck.description && (
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.deckDescription,
                        { color: colors.secondaryText },
                      ]}
                    >
                      {deck.description}
                    </Text>
                  )}
                  <View style={styles.deckBottomRow}>
                    <View
                      style={[
                        styles.cardBadge,
                        {
                          backgroundColor: colors.iconBackground,
                        },
                      ]}
                    >
                      <Ionicons
                        name="layers-outline"
                        size={12}
                        color={colors.icon}
                      />
                      <Text
                        style={[
                          styles.cardBadgeText,
                          { color: colors.secondaryText },
                        ]}
                      >
                        {deck.cards.length}{" "}
                        {deck.cards.length === 1 ? "card" : "cards"}
                      </Text>
                    </View>
                    <Text
                      style={[styles.deckDate, { color: colors.secondaryText }]}
                    >
                      {deck.date}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => confirmDelete(deck)}
                  style={styles.deleteButton}
                >
                  <Ionicons
                    name="trash-outline"
                    size={18}
                    color={colors.secondaryText}
                  />
                </TouchableOpacity>
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
              <Ionicons name="albums-outline" size={28} color={colors.icon} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No flashcard decks
            </Text>
            <Text style={[styles.emptyText, { color: colors.secondaryText }]}>
              Create your first deck to start studying.
            </Text>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={createDeck}
              style={[
                styles.emptyButton,
                {
                  backgroundColor: colors.primary,
                },
              ]}
            >
              <Text style={styles.emptyButtonText}>Create Deck</Text>
            </TouchableOpacity>
          </View>
        )}
        <View
          style={[styles.finalDivider, { backgroundColor: colors.divider }]}
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
  createButton: {
    minHeight: 55,
    borderRadius: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
  },
  createButtonText: {
    color: "#ffffff",
    fontFamily: "BitterBold",
    fontSize: 12.5,
    marginLeft: 8,
  },
  deckHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  deckHeaderTitle: {
    fontFamily: "BitterBold",
    fontSize: 19,
  },
  deckCount: {
    fontFamily: "Bitter",
    fontSize: 10.5,
  },
  deckList: {
    gap: 12,
  },
  deckCard: {
    width: "100%",
    minHeight: 115,
    borderRadius: 20,
    borderWidth: 1,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
  },
  deckIcon: {
    width: 58,
    height: 58,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  deckInfo: {
    flex: 1,
    minWidth: 0,
  },
  deckTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  deckTitle: {
    flex: 1,
    fontFamily: "BitterBold",
    fontSize: 14,
    marginRight: 5,
  },
  deckDescription: {
    fontFamily: "Bitter",
    fontSize: 10,
    lineHeight: 15,
    marginBottom: 8,
  },
  deckBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 9,
  },
  cardBadgeText: {
    fontFamily: "BitterBold",
    fontSize: 8.5,
    marginLeft: 4,
  },
  deckDate: {
    fontFamily: "Bitter",
    fontSize: 8.5,
  },
  deleteButton: {
    width: 35,
    height: 35,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 5,
  },
  emptyCard: {
    width: "100%",
    minHeight: 235,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 25,
  },
  emptyIcon: {
    width: 55,
    height: 55,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
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
    marginBottom: 17,
  },
  emptyButton: {
    minHeight: 43,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyButtonText: {
    color: "#ffffff",
    fontFamily: "BitterBold",
    fontSize: 10.5,
  },
  finalDivider: {
    width: "60%",
    height: 1,
    alignSelf: "center",
    marginTop: 32,
  },
});
