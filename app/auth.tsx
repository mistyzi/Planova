import React, { useEffect, useState } from "react";

import {
  Alert,
  Image,
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

import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

import logo from "@/assets/logo.png";

const AUTH_STORAGE_KEY = "@planova_auth";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkExistingAuth();
  }, []);

  const checkExistingAuth = async () => {
    try {
      const authenticated =
        await AsyncStorage.getItem(
          AUTH_STORAGE_KEY
        );

      if (authenticated === "true") {
        router.replace("/(tabs)");
      }
    } catch (error) {
      console.log(
        "Failed to check authentication:",
        error
      );
    }
  };

  const handleLogin = async () => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      Alert.alert(
        "Missing Email",
        "Please enter your email."
      );
      return;
    }

    if (!password) {
      Alert.alert(
        "Missing Password",
        "Please enter your password."
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * This is the local authentication state.
       *
       * If your existing login/database system already
       * validates the account, keep that validation there
       * and run the AsyncStorage.setItem AFTER successful
       * authentication.
       */
      await AsyncStorage.setItem(
        AUTH_STORAGE_KEY,
        "true"
      );

      router.replace("/(tabs)");
    } catch (error) {
      console.log(
        "Login failed:",
        error
      );

      Alert.alert(
        "Login Error",
        "Something went wrong while signing in."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={[
          "#050817",
          "#0A1024",
          "#17154A",
          "#24145A",
          "#0A1024",
        ]}
        locations={[
          0,
          0.25,
          0.55,
          0.75,
          1,
        ]}
        style={styles.background}
      >
        {/* Stars */}
        <View
          pointerEvents="none"
          style={styles.stars}
        >
          <View style={[styles.star, styles.s1]} />
          <View style={[styles.star, styles.s2]} />
          <View style={[styles.star, styles.s3]} />
          <View style={[styles.star, styles.s4]} />
          <View style={[styles.star, styles.s5]} />
          <View style={[styles.star, styles.s6]} />
          <View style={[styles.star, styles.s7]} />
          <View style={[styles.star, styles.s8]} />
          <View style={[styles.star, styles.s9]} />
          <View style={[styles.star, styles.s10]} />
          <View style={[styles.star, styles.s11]} />
          <View style={[styles.star, styles.s12]} />
          <View style={[styles.star, styles.s13]} />
          <View style={[styles.star, styles.s14]} />
          <View style={[styles.star, styles.s15]} />
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          <ScrollView
            contentContainerStyle={
              styles.scrollContent
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <Image
                source={planovaLogo}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            {/* Heading */}
            <View style={styles.headingContainer}>
              <Text style={styles.title}>
                Welcome back
              </Text>

              <Text style={styles.subtitle}>
                Continue your journey with Planova.
              </Text>
            </View>

            {/* Auth Card */}
            <View style={styles.card}>
              <Text style={styles.inputLabel}>
                Email
              </Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="#A8B2FF"
                />

                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#777B9D"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>

              <Text style={styles.inputLabel}>
                Password
              </Text>

              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color="#A8B2FF"
                />

                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#777B9D"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  onSubmitEditing={
                    handleLogin
                  }
                />

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={19}
                    color="#9097B5"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleLogin}
                disabled={loading}
                style={[
                  styles.loginButton,
                  loading &&
                    styles.loginButtonDisabled,
                ]}
              >
                <Text
                  style={styles.loginButtonText}
                >
                  {loading
                    ? "Signing in..."
                    : "Sign In"}
                </Text>

                {!loading && (
                  <Ionicons
                    name="arrow-forward"
                    size={18}
                    color="#FFFFFF"
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* Sign up */}
            <View style={styles.signupRow}>
              <Text style={styles.signupText}>
                New to Planova?
              </Text>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  Alert.alert(
                    "Create Account",
                    "Connect this button to your registration screen."
                  );
                }}
              >
                <Text style={styles.signupLink}>
                  Create an account
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#050817",
  },

  background: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 35,
  },

  stars: {
    ...StyleSheet.absoluteFillObject,
  },

  star: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
    opacity: 0.7,
  },

  s1: {
    top: "8%",
    left: "12%",
  },

  s2: {
    top: "14%",
    left: "72%",
    width: 2,
    height: 2,
  },

  s3: {
    top: "20%",
    left: "89%",
  },

  s4: {
    top: "28%",
    left: "8%",
    width: 2,
    height: 2,
  },

  s5: {
    top: "32%",
    left: "61%",
    width: 2,
    height: 2,
  },

  s6: {
    top: "39%",
    left: "91%",
  },

  s7: {
    top: "47%",
    left: "18%",
    width: 2,
    height: 2,
  },

  s8: {
    top: "53%",
    left: "79%",
  },

  s9: {
    top: "61%",
    left: "7%",
    width: 2,
    height: 2,
  },

  s10: {
    top: "68%",
    left: "88%",
    width: 2,
    height: 2,
  },

  s11: {
    top: "73%",
    left: "31%",
  },

  s12: {
    top: "79%",
    left: "68%",
    width: 2,
    height: 2,
  },

  s13: {
    top: "84%",
    left: "13%",
    width: 2,
    height: 2,
  },

  s14: {
    top: "90%",
    left: "48%",
  },

  s15: {
    top: "11%",
    left: "46%",
    width: 2,
    height: 2,
  },

  logoContainer: {
    alignItems: "center",
    marginBottom: 14,
  },

  logo: {
    width: 145,
    height: 75,
  },

  headingContainer: {
    alignItems: "center",
    marginBottom: 24,
  },

  title: {
    color: "#FFFFFF",
    fontFamily: "BitterBold",
    fontSize: 29,
    textAlign: "center",
  },

  subtitle: {
    color: "#A8B2FF",
    fontFamily: "Bitter",
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },

  card: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    backgroundColor: "rgba(18,26,69,0.92)",
    borderWidth: 1,
    borderColor: "rgba(168,178,255,0.16)",
    borderRadius: 24,
    padding: 20,
  },

  inputLabel: {
    color: "#D8D8F2",
    fontFamily: "BitterBold",
    fontSize: 12,
    marginBottom: 7,
  },

  inputWrapper: {
    minHeight: 48,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(168,178,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.045)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 16,
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    fontFamily: "Bitter",
    fontSize: 14,
    marginLeft: 9,
    paddingVertical: 11,
  },

  loginButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: "#7C5DFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 3,
  },

  loginButtonDisabled: {
    opacity: 0.65,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontFamily: "BitterBold",
    fontSize: 15,
  },

  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    gap: 5,
  },

  signupText: {
    color: "#9097B5",
    fontFamily: "Bitter",
    fontSize: 13,
  },

  signupLink: {
    color: "#B7A7FF",
    fontFamily: "BitterBold",
    fontSize: 13,
  },
});