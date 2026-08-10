import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import StarryBackground from "@/components/starrybackground";
import { useTheme } from "@/context/themecontext";
import {
  addFlashcardDeck,
  createFlashcardId,
  Flashcard,
  FlashcardDeck,
  getFlashcardDeckById,
  updateFlashcardDeck,
} from "../storage/flashcardStorage";

type CardDraft = {
  id: string;
  question: string;
  answer: string;
};

export default function FlashcardMakerScreen() {
  const { isDark } = useTheme();
  const params = useLocalSearchParams<{
    id?: string;
    mode?: string;
  }>();
  const deckId = typeof params.id === "string" ? params.id : undefined;
  const isEditing = params.mode === "edit" || !!deckId;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [cards, setCards] = useState<CardDraft[]>([
    {
      id: createFlashcardId(),
      question: "",
      answer: "",
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

  const loadDeck = useCallback(async () => {
    if (!deckId) {
      setIsLoading(false);
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
      setTitle(storedDeck.title);
      setDescription(storedDeck.description);
      setCards(
        storedDeck.cards.length > 0
          ? storedDeck.cards.map((card) => ({
              id: card.id,
              question: card.question,
              answer: card.answer,
            }))
          : [
              {
                id: createFlashcardId(),
                question: "",
                answer: "",
              },
            ]
      );
    } catch (error) {
      console.log("Failed to load deck:", error);
    } finally {
      setIsLoading(false);
    }
  }, [deckId]);

  useEffect(() => {
    loadDeck();
  }, [loadDeck]);

  const updateCard = (cardId: string, field: "question" | "answer", value: string) => {
    setCards((currentCards) =>
      currentCards.map((card) =>
        card.id === cardId ? { ...card, [field]: value } : card
      )
    );
  };

  const addCard = () => {
    setCards((currentCards) => [
      ...currentCards,
      {
        id: createFlashcardId(),
        question: "",
        answer: "",
      },
    ]);
  };

  const removeCard = (cardId: string) => {
    if (cards.length === 1) {
      Alert.alert("Keep at least one card", "A deck needs at least one flashcard.");
      return;
    }
    Alert.alert("Remove Card", "Are you sure you want to remove this card?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Remove",
        style: "destructive",
        onPress: () => {
          setCards((currentCards) => currentCards.filter((card) => card.id !== cardId));
        },
      },
    ]);
  };

  const saveDeck = async () => {
    if (!title.trim()) {
      Alert.alert("Add a title", "Please give your flashcard deck a title.");
      return;
    }
    const invalidCard = cards.find((card) => !card.question.trim() || !card.answer.trim());
    if (invalidCard) {
      Alert.alert("Incomplete Card", "Please fill in both the question and answer for every card.");
      return;
    }
    setIsSaving(true);
    try {
      const storedCards: Flashcard[] = cards.map((card) => ({
        id: card.id,
        question: card.question.trim(),
        answer: card.answer.trim(),
      }));
      if (isEditing && deckId) {
        const existingDeck = await getFlashcardDeckById(deckId);
        if (!existingDeck) {
          Alert.alert("Deck not found", "The deck could not be updated.");
          return;
        }
        const updatedDeck: FlashcardDeck = {
          ...existingDeck,
          title: title.trim(),
          description: description.trim(),
          cards: storedCards,
        };
        await updateFlashcardDeck(updatedDeck);
        router.replace({
          pathname: "/flashcard",
          params: {
            id: updatedDeck.id,
          },
        });
        return;
      }
      const newDeck: FlashcardDeck = {
        id: createFlashcardId(),
        title: title.trim(),
        description: description.trim(),
        cards: storedCards,
        date: "Just now",
      };
      await addFlashcardDeck(newDeck);
      router.replace({
        pathname: "/flashcard",
        params: {
          id: newDeck.id,
        },
      });
    } catch (error) {
      console.log("Failed to save deck:", error);
      Alert.alert("Save failed", "Your flashcard deck could not be saved.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
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
            {isEditing ? "Edit Deck" : "New Flashcards"}
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
                <Ionicons name="albums-outline" size={21} color={colors.icon} />
              </View>
              <View style={styles.sectionHeaderText}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Deck Information</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.secondaryText }]}>
                  Give your study deck a name.
                </Text>
              </View>
            </View>
            <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>Title</Text>
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
            <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>Description</Text>
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
              <Text style={[styles.cardsTitle, { color: colors.title }]}>Flashcards</Text>
              <Text style={[styles.cardsSubtitle, { color: colors.secondaryText }]}>
                {cards.length} {cards.length === 1 ? "card" : "cards"}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={addCard}
              style={[
                styles.addCardButton,
                {
                  backgroundColor: colors.iconBackground,
                  borderColor: colors.cardBorder,
                },
              ]}
            >
              <Ionicons name="add" size={18} color={colors.icon} />
              <Text style={[styles.addCardText, { color: colors.icon }]}>Add Card</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.cardList}>
            {cards.map((card, index) => (
              <View
                key={card.id}
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
                    <Text style={[styles.cardNumberText, { color: colors.secondaryText }]}>
                      CARD {index + 1}
                    </Text>
                  </View>
                  <TouchableOpacity activeOpacity={0.7} onPress={() => removeCard(card.id)}>
                    <Ionicons name="trash-outline" size={19} color={colors.secondaryText} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>Question</Text>
                <TextInput
                  value={card.question}
                  onChangeText={(value) => updateCard(card.id, "question", value)}
                  placeholder="Enter the question..."
                  placeholderTextColor={colors.secondaryText}
                  multiline
                  textAlignVertical="top"
                  style={[
                    styles.cardInput,
                    {
                      backgroundColor: colors.input,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                />
                <Text style={[styles.inputLabel, { color: colors.secondaryText }]}>Answer</Text>
                <TextInput
                  value={card.answer}
                  onChangeText={(value) => updateCard(card.id, "answer", value)}
                  placeholder="Enter the answer..."
                  placeholderTextColor={colors.secondaryText}
                  multiline
                  textAlignVertical="top"
                  style={[
                    styles.cardInput,
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
            onPress={saveDeck}
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
              {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Save Flashcard Deck"}
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
  cardInput: {
    width: "100%",
    minHeight: 100,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 12,
    fontFamily: "Bitter",
    fontSize: 11.5,
    lineHeight: 18,
    textAlignVertical: "top",
    marginBottom: 15,
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