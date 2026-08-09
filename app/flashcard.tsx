import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Speech from "expo-speech";
import StarryBackground from "@/components/starrybackground";
import { useTheme } from "@/context/themecontext";
import { deleteFlashcardDeck, FlashcardDeck, getFlashcardDeckById } from "./flashcardStorage";

export default function FlashcardScreen() {
  const { isDark } = useTheme();
  const params = useLocalSearchParams<{
    id?: string;
  }>();
  const deckId = typeof params.id === "string" ? params.id : undefined;
  const [deck, setDeck] = useState<FlashcardDeck | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

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
        divider: "rgba(196,181,253,0.40)",
        primary: "#8064B5",
        questionBackground: "rgba(14,25,56,0.85)",
        answerBackground: "rgba(128,100,181,0.85)",
      }
    : {
        title: "#4F427D",
        text: "#30284C",
        secondaryText: "#6D5A9F",
        card: "rgba(255,255,255,0.72)",
        cardBorder: "rgba(79,66,125,0.25)",
        iconBackground: "rgba(79,66,125,0.10)",
        icon: "#4F427D",
        divider: "rgba(79,66,125,0.40)",
        primary: "#8069B3",
        questionBackground: "rgba(255,255,255,0.88)",
        answerBackground: "rgba(128,105,179,0.92)",
      };

  useEffect(() => {
    const load = async () => {
      if (!deckId) {
        setIsLoading(false);
        Alert.alert("Deck not found", "No flashcard deck was selected.", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
        return;
      }
      try {
        const storedDeck = await getFlashcardDeckById(deckId);
        if (!storedDeck) {
          Alert.alert("Deck not found", "This flashcard deck could not be found.", [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]);
          return;
        }
        if (storedDeck.cards.length === 0) {
          Alert.alert("Empty deck", "This deck does not contain any flashcards.", [
            {
              text: "OK",
              onPress: () => router.back(),
            },
          ]);
          return;
        }
        setDeck(storedDeck);
      } catch (error) {
        console.log("Failed to load flashcard deck:", error);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [deckId]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  const currentCard = deck?.cards[currentIndex];

  const flipCard = () => {
    setIsFlipped((current) => !current);
    Speech.stop();
    setIsSpeaking(false);
  };

  const nextCard = () => {
    if (!deck) return;
    if (currentIndex < deck.cards.length - 1) {
      setCurrentIndex((current) => current + 1);
      setIsFlipped(false);
      Speech.stop();
      setIsSpeaking(false);
      return;
    }
    Alert.alert("Deck Complete", "You've reached the end of this deck.", [
      {
        text: "Stay",
        style: "cancel",
      },
      {
        text: "Start Again",
        onPress: () => {
          setCurrentIndex(0);
          setIsFlipped(false);
        },
      },
      {
        text: "Done",
        onPress: () => router.back(),
      },
    ]);
  };

  const previousCard = () => {
    if (currentIndex <= 0) return;
    setCurrentIndex((current) => current - 1);
    setIsFlipped(false);
    Speech.stop();
    setIsSpeaking(false);
  };

  const readAloud = async () => {
    if (!currentCard) return;
    const speechText = isFlipped ? currentCard.answer : currentCard.question;
    if (!speechText.trim()) return;
    if (isSpeaking) {
      await Speech.stop();
      setIsSpeaking(false);
      return;
    }
    setIsSpeaking(true);
    Speech.speak(speechText, {
      rate: 0.9,
      pitch: 1,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const confirmDelete = () => {
    if (!deck) return;
    Alert.alert("Delete Deck", `Are you sure you want to delete "${deck.title}"?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteFlashcardDeck(deck.id);
          router.replace("/flashcards");
        },
      },
    ]);
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

  if (!deck || !currentCard) {
    return null;
  }

  const progress = `${currentIndex + 1} / ${deck.cards.length}`;

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
          onPress={() => {
            Speech.stop();
            router.back();
          }}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={25} color={colors.title} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text numberOfLines={1} style={[styles.topTitle, { color: colors.title }]}>
            {deck.title}
          </Text>
          <Text style={[styles.progressText, { color: colors.secondaryText }]}>{progress}</Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() =>
            router.push({
              pathname: "/flashcardMaker",
              params: {
                id: deck.id,
                mode: "edit",
              },
            })
          }
          style={styles.headerButton}
        >
          <Ionicons name="create-outline" size={22} color={colors.title} />
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!!deck.description && (
          <Text style={[styles.description, { color: colors.secondaryText }]}>{deck.description}</Text>
        )}
        <TouchableOpacity
          activeOpacity={0.95}
          onPress={flipCard}
          style={[
            styles.studyCard,
            {
              backgroundColor: isFlipped ? colors.answerBackground : colors.questionBackground,
              borderColor: isFlipped ? "rgba(255,255,255,0.25)" : colors.cardBorder,
            },
          ]}
        >
          <View
            style={[
              styles.cardTypeBadge,
              {
                backgroundColor: isFlipped ? "rgba(255,255,255,0.15)" : colors.iconBackground,
              },
            ]}
          >
            <Ionicons
              name={isFlipped ? "checkmark-circle-outline" : "help-circle-outline"}
              size={15}
              color={isFlipped ? "#ffffff" : colors.icon}
            />
            <Text
              style={[
                styles.cardTypeText,
                {
                  color: isFlipped ? "#ffffff" : colors.secondaryText,
                },
              ]}
            >
              {isFlipped ? "ANSWER" : "QUESTION"}
            </Text>
          </View>
          <View style={styles.cardContent}>
            <Text
              style={[
                styles.cardText,
                {
                  color: isFlipped ? "#ffffff" : colors.text,
                },
              ]}
            >
              {isFlipped ? currentCard.answer : currentCard.question}
            </Text>
          </View>
          <View
            style={[
              styles.tapHint,
              {
                backgroundColor: isFlipped ? "rgba(255,255,255,0.12)" : colors.iconBackground,
              },
            ]}
          >
            <Ionicons name="sync-outline" size={14} color={isFlipped ? "#ffffff" : colors.icon} />
            <Text
              style={[
                styles.tapHintText,
                {
                  color: isFlipped ? "#ffffff" : colors.secondaryText,
                },
              ]}
            >
              Tap to flip
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={readAloud}
          style={[
            styles.readButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.cardBorder,
            },
          ]}
        >
          <Ionicons
            name={isSpeaking ? "stop-circle-outline" : "volume-high-outline"}
            size={20}
            color={colors.icon}
          />
          <Text style={[styles.readButtonText, { color: colors.text }]}>
            {isSpeaking ? "Stop Reading" : "Read Aloud"}
          </Text>
        </TouchableOpacity>
        <View style={styles.navigation}>
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={previousCard}
            disabled={currentIndex === 0}
            style={[
              styles.navigationButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.cardBorder,
                opacity: currentIndex === 0 ? 0.4 : 1,
              },
            ]}
          >
            <Ionicons name="arrow-back" size={19} color={colors.icon} />
            <Text style={[styles.navigationText, { color: colors.text }]}>Previous</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={nextCard}
            style={[
              styles.navigationButton,
              {
                backgroundColor: colors.primary,
              },
            ]}
          >
            <Text style={styles.navigationTextLight}>
              {currentIndex === deck.cards.length - 1 ? "Finish" : "Next"}
            </Text>
            <Ionicons
              name={currentIndex === deck.cards.length - 1 ? "checkmark" : "arrow-forward"}
              size={19}
              color="#ffffff"
            />
          </TouchableOpacity>
        </View>
        <View style={styles.management}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={() =>
              router.push({
                pathname: "/flashcardMaker",
                params: {
                  id: deck.id,
                  mode: "edit",
                },
              })
            }
            style={styles.managementButton}
          >
            <Ionicons name="create-outline" size={17} color={colors.icon} />
            <Text style={[styles.managementText, { color: colors.secondaryText }]}>Edit Deck</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.75} onPress={confirmDelete} style={styles.managementButton}>
            <Ionicons name="trash-outline" size={17} color={colors.secondaryText} />
            <Text style={[styles.managementText, { color: colors.secondaryText }]}>Delete Deck</Text>
          </TouchableOpacity>
        </View>
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
  headerCenter: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 8,
  },
  topTitle: {
    fontFamily: "BitterBold",
    fontSize: 17,
    textAlign: "center",
  },
  progressText: {
    fontFamily: "Bitter",
    fontSize: 9,
    marginTop: 3,
  },
  scroll: {
    flex: 1,
    backgroundColor: "transparent",
    zIndex: 2,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 60,
  },
  description: {
    fontFamily: "Bitter",
    fontSize: 10.5,
    lineHeight: 16,
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 15,
  },
  studyCard: {
    width: "100%",
    minHeight: 430,
    borderRadius: 25,
    borderWidth: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  cardTypeBadge: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
  },
  cardTypeText: {
    fontFamily: "BitterBold",
    fontSize: 8.5,
    marginLeft: 5,
    letterSpacing: 0.5,
  },
  cardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  cardText: {
    fontFamily: "BitterBold",
    fontSize: 20,
    lineHeight: 30,
    textAlign: "center",
  },
  tapHint: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tapHintText: {
    fontFamily: "Bitter",
    fontSize: 8.5,
    marginLeft: 5,
  },
  readButton: {
    minHeight: 52,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 15,
  },
  readButtonText: {
    fontFamily: "BitterBold",
    fontSize: 11.5,
    marginLeft: 7,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 13,
  },
  navigationButton: {
    width: "48%",
    minHeight: 52,
    borderRadius: 17,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  navigationText: {
    fontFamily: "BitterBold",
    fontSize: 10.5,
    marginLeft: 7,
  },
  navigationTextLight: {
    color: "#ffffff",
    fontFamily: "BitterBold",
    fontSize: 10.5,
    marginRight: 7,
  },
  management: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 25,
    marginTop: 22,
  },
  managementButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 7,
  },
  managementText: {
    fontFamily: "Bitter",
    fontSize: 9.5,
    marginLeft: 5,
  },
  finalDivider: {
    width: "60%",
    height: 1,
    alignSelf: "center",
    marginTop: 32,
  },
});