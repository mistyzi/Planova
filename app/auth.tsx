import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import MaskedView from "@react-native-masked-view/masked-view";

// Planova logo
const logo = require("../assets/logo.png");

import { supabase } from "@/lib/supabase";

type AuthScreen = "loading" | "choice" | "login" | "register";

/* ============================================================
   PLANOVA GRADIENT WORDMARK
   ============================================================ */

const PlanovaWordmark = ({
  size = 29,
  style,
}: {
  size?: number;
  style?: object;
}) => {
  return (
    <View
      style={[
        styles.wordmarkWrapper,
        {
          minWidth: size * 4.25,
          height: size * 1.35,
        },
        style,
      ]}
    >
      <MaskedView
        style={styles.wordmarkMask}
        maskElement={
          <Text
            numberOfLines={1}
            allowFontScaling={false}
            style={[
              styles.planovaGradientText,
              {
                fontSize: size,
                lineHeight: size * 1.3,
                width: size * 4.2,
              },
            ]}
          >
            PLANOVA
          </Text>
        }
      >
        <LinearGradient
          colors={[
            "#E9D5FF",
            "#C4B5FD",
            "#8B7CF6",
            "#6D5A9F",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.wordmarkGradient,
            {
              width: size * 4.2,
              height: size * 1.3,
            },
          ]}
        />
      </MaskedView>
    </View>
  );
};

export default function Auth() {
  const [screen, setScreen] =
    useState<AuthScreen>("loading");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] =
    useState("");
  const [registerPassword, setRegisterPassword] =
    useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);
  const [
    showRegisterPassword,
    setShowRegisterPassword,
  ] = useState(false);
  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] = useState(false);

  // ==========================================================
  // LOADING ANIMATION
  // ==========================================================

  const logoOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const logoScale = useRef(
    new Animated.Value(0.88)
  ).current;

  const pulse = useRef(
    new Animated.Value(1)
  ).current;

  // ==========================================================
  // TWINKLING STARS
  // ==========================================================

  const starAnimations = useRef(
    Array.from({ length: 15 }, () => ({
      opacity: new Animated.Value(0.35),
      scale: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 650,
        useNativeDriver: true,
      }),

      Animated.spring(logoScale, {
        toValue: 1,
        friction: 7,
        tension: 45,
        useNativeDriver: true,
      }),
    ]).start();

    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.04,
          duration: 900,
          useNativeDriver: true,
        }),

        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );

    pulseAnimation.start();

    const starLoops = starAnimations.map(
      (star, index) => {
        const delay = 300 + index * 180;

        const animation = Animated.loop(
          Animated.sequence([
            Animated.delay(delay),

            Animated.parallel([
              Animated.timing(star.opacity, {
                toValue: 1,
                duration:
                  700 + (index % 4) * 180,
                useNativeDriver: true,
              }),

              Animated.timing(star.scale, {
                toValue: 1.35,
                duration:
                  700 + (index % 4) * 180,
                useNativeDriver: true,
              }),
            ]),

            Animated.parallel([
              Animated.timing(star.opacity, {
                toValue: 0.25,
                duration:
                  900 + (index % 3) * 220,
                useNativeDriver: true,
              }),

              Animated.timing(star.scale, {
                toValue: 0.8,
                duration:
                  900 + (index % 3) * 220,
                useNativeDriver: true,
              }),
            ]),

            Animated.delay(
              200 + (index % 5) * 150
            ),
          ])
        );

        animation.start();

        return animation;
      }
    );

    checkExistingAuth();

    return () => {
      pulseAnimation.stop();

      starLoops.forEach((animation) => {
        animation.stop();
      });
    };
  }, []);

  // ==========================================================
  // AUTH CHECK
  // ==========================================================

const checkExistingAuth = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    setTimeout(() => {
      if (session) {
        router.replace("/(tabs)");
      } else {
        setScreen("choice");
      }
    }, 1400);
  } catch (error) {
    console.log(
      "Failed to check authentication:",
      error
    );

    setTimeout(() => {
      setScreen("choice");
    }, 1400);
  }
};

  // ==========================================================
  // LOGIN
  // ==========================================================

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

    const {
      data,
      error,
    } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (error) {
      throw error;
    }

    if (!data.session) {
      throw new Error(
        "A login session could not be created."
      );
    }

    router.replace("/(tabs)");
  } catch (error: any) {
    console.log(
      "Login failed:",
      error
    );

    Alert.alert(
      "Login Failed",
      error?.message ||
        "The email or password may be incorrect."
    );
  } finally {
    setLoading(false);
  }
};

  // ==========================================================
  // REGISTRATION
  // ==========================================================

const handleRegistration = async () => {
  const trimmedName = registerName.trim();
  const trimmedEmail = registerEmail.trim();

  if (!trimmedName) {
    Alert.alert("Missing Name", "Please enter your name.");
    return;
  }

  if (!trimmedEmail) {
    Alert.alert("Missing Email", "Please enter your email.");
    return;
  }

  if (!registerPassword) {
    Alert.alert(
      "Missing Password",
      "Please create a password."
    );
    return;
  }

  if (registerPassword.length < 6) {
    Alert.alert(
      "Password Too Short",
      "Your password must be at least 6 characters."
    );
    return;
  }

  if (registerPassword !== confirmPassword) {
    Alert.alert(
      "Passwords Don't Match",
      "Please make sure both passwords match."
    );
    return;
  }

  try {
    setLoading(true);

    const {
      data,
      error,
    } = await supabase.auth.signUp({
      email: trimmedEmail,
      password: registerPassword,
    });

    if (error) {
      throw error;
    }

    if (!data.user) {
      throw new Error(
        "Account could not be created."
      );
    }

    const defaultAvatar =
      "https://i.pinimg.com/736x/e9/46/55/e94655294e897527f56c15e51580661a.jpg";

    const defaultBackground =
      "https://images.unsplash.com/photo-1534791547706-0c292bfb8004?auto=format&fit=crop&w=1200&q=80";

    const {
      error: profileError,
    } = await supabase
      .from("profiles")
      .insert({
        id: data.user.id,
        name: trimmedName,
        school: "",
        program: "",
        avatar_uri: defaultAvatar,
        background_uri: defaultBackground,
      });

    if (profileError) {
      console.log(
        "Profile creation error:",
        profileError
      );

      Alert.alert(
        "Account Created",
        "Your account was created, but your profile could not be created."
      );

      return;
    }

    /*
     * Depending on your Supabase email-confirmation
     * settings, session may be null here.
     */

    if (data.session) {
      router.replace("/(tabs)");
    } else {
      Alert.alert(
        "Check Your Email",
        "Your account was created. Please verify your email before signing in.",
        [
          {
            text: "OK",
            onPress: () => setScreen("login"),
          },
        ]
      );
    }
  } catch (error: any) {
    console.log(
      "Registration failed:",
      error
    );

    Alert.alert(
      "Registration Error",
      error?.message ||
        "Something went wrong while creating your account."
    );
  } finally {
    setLoading(false);
  }
};

  // ==========================================================
  // BACK
  // ==========================================================

  const goBackToChoice = () => {
    setEmail("");
    setPassword("");
    setRegisterName("");
    setRegisterEmail("");
    setRegisterPassword("");
    setConfirmPassword("");

    setShowPassword(false);
    setShowRegisterPassword(false);
    setShowConfirmPassword(false);

    setScreen("choice");
  };

  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  const renderLoadingScreen = () => {
    return (
      <View style={styles.loadingScreen}>
        <Animated.View
          style={[
            styles.loadingLogoWrapper,
            {
              opacity: logoOpacity,
              transform: [
                {
                  scale: Animated.multiply(
                    logoScale,
                    pulse
                  ),
                },
              ],
            },
          ]}
        >
          <Image
            source={logo}
            style={styles.loadingLogo}
            resizeMode="contain"
          />
          
        <PlanovaWordmark
          size={18}
          style={styles.loadingWordmark}
        />
        </Animated.View>

        <View style={styles.loadingIndicator}>
          <View style={styles.loadingDot} />

          <View
            style={[
              styles.loadingDot,
              styles.loadingDotMiddle,
            ]}
          />

          <View style={styles.loadingDot} />
        </View>
      </View>
    );
  };

  // ==========================================================
  // CHOICE SCREEN
  // ==========================================================

  const renderChoiceScreen = () => {
    return (
      <ScrollView
        contentContainerStyle={
          styles.choiceScrollContent
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.choiceLogoContainer}>
          <Image
            source={logo}
            style={styles.choiceLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.choiceHeading}>
          <PlanovaWordmark size={31} />

          <Text style={styles.choiceSubtitle}>
            Your study schedule — scientifically
            aligned.
          </Text>
        </View>

        <View style={styles.choiceCard}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              setScreen("register")
            }
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonTitle}>
              Create Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setScreen("login")}
            style={styles.secondaryButton}
          >
            <Text
              style={styles.secondaryButtonTitle}
            >
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // ==========================================================
  // LOGIN SCREEN
  // ==========================================================

  const renderLoginScreen = () => {
    return (
      <ScrollView
        contentContainerStyle={
          styles.formScrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={goBackToChoice}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={19}
            color="#B7B6D8"
          />

          <Text style={styles.backText}>
            Back
          </Text>
        </TouchableOpacity>

        {/* BRANDING */}

        <View style={styles.formLogoContainer}>
          <Image
            source={logo}
            style={styles.formLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formBrand}>
          <PlanovaWordmark size={27} />
        </View>

        {/* HEADING */}

        <View style={styles.formHeading}>

          <Text style={styles.subtitle}>
            Sign back in and join us in our expedition!
          </Text>
        </View>

        {/* FORM CARD */}

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
              onSubmitEditing={handleLogin}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setShowPassword(
                  (previous) => !previous
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
            <Text style={styles.loginButtonText}>
              {loading
                ? "Signing in..."
                : "Sign In"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.switchAuthRow}>
          <Text style={styles.signupText}>
            New to Planova?
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() =>
              setScreen("register")
            }
          >
            <Text style={styles.signupLink}>
              Create an account
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // ==========================================================
  // REGISTER SCREEN
  // ==========================================================

  const renderRegisterScreen = () => {
    return (
      <ScrollView
        contentContainerStyle={
          styles.formScrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={goBackToChoice}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={19}
            color="#B7B6D8"
          />

          <Text style={styles.backText}>
            Back
          </Text>
        </TouchableOpacity>

        {/* BRANDING */}

        <View style={styles.formLogoContainer}>
          <Image
            source={logo}
            style={styles.formLogo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.formBrand}>
          <PlanovaWordmark size={27} />
        </View>

        {/* HEADING */}

        <View style={styles.formHeading}>

          <Text style={styles.subtitle}>
            Create your account and start building a study routine that works
            for you.
          </Text>
        </View>

        {/* FORM CARD */}

        <View style={styles.card}>
          <Text style={styles.inputLabel}>
            Name
          </Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="person-outline"
              size={18}
              color="#A8B2FF"
            />

            <TextInput
              value={registerName}
              onChangeText={setRegisterName}
              placeholder="Your name"
              placeholderTextColor="#777B9D"
              autoCapitalize="words"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

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
              value={registerEmail}
              onChangeText={setRegisterEmail}
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
              value={registerPassword}
              onChangeText={
                setRegisterPassword
              }
              placeholder="Create a password"
              placeholderTextColor="#777B9D"
              secureTextEntry={
                !showRegisterPassword
              }
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setShowRegisterPassword(
                  (previous) => !previous
                )
              }
            >
              <Ionicons
                name={
                  showRegisterPassword
                    ? "eye-off-outline"
                    : "eye-outline"
                }
                size={19}
                color="#9097B5"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>
            Confirm Password
          </Text>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="shield-checkmark-outline"
              size={18}
              color="#A8B2FF"
            />

            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor="#777B9D"
              secureTextEntry={
                !showConfirmPassword
              }
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
              onSubmitEditing={
                handleRegistration
              }
            />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setShowConfirmPassword(
                  (previous) => !previous
                )
              }
            >
              <Ionicons
                name={
                  showConfirmPassword
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
            onPress={handleRegistration}
            disabled={loading}
            style={[
              styles.loginButton,
              loading &&
                styles.loginButtonDisabled,
            ]}
          >
            <Text style={styles.loginButtonText}>
              {loading
                ? "Creating account..."
                : "Create Account"}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.switchAuthRow}>
          <Text style={styles.signupText}>
            Already have an account?
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setScreen("login")}
          >
            <Text style={styles.signupLink}>
              Sign in
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  // ==========================================================
  // MAIN BACKGROUND
  // ==========================================================

  return (
    <View style={styles.safeArea}>
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
        {/* TWINKLING STARS */}

        <View
          pointerEvents="none"
          style={styles.stars}
        >
          {starAnimations.map(
            (animation, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.star,
                  styles[
                    `s${
                      index + 1
                    }` as keyof typeof styles
                  ] as object,
                  {
                    opacity: animation.opacity,
                    transform: [
                      {
                        scale: animation.scale,
                      },
                    ],
                  },
                ]}
              />
            )
          )}
        </View>

        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={
            Platform.OS === "ios"
              ? "padding"
              : undefined
          }
        >
          {screen === "loading" &&
            renderLoadingScreen()}

          {screen === "choice" &&
            renderChoiceScreen()}

          {screen === "login" &&
            renderLoginScreen()}

          {screen === "register" &&
            renderRegisterScreen()}
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  // ==========================================================
  // GENERAL
  // ==========================================================

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

  // ==========================================================
  // PLANOVA WORDMARK
  // ==========================================================

  wordmarkWrapper: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible",
  },

  wordmarkMask: {
    alignItems: "flex-start",
    justifyContent: "center",
    overflow: "visible",
  },

  wordmarkGradient: {
    overflow: "hidden",
  },

  planovaGradientText: {
    fontFamily: "MysteryQuest",
    fontWeight: "400",
    letterSpacing: 1,
    textAlign: "left",
    color: "#FFFFFF",
    includeFontPadding: false,
  },

  loadingWordmark: {
    marginTop: 12,
  },

  // ==========================================================
  // STARS
  // ==========================================================

  stars: {
    ...StyleSheet.absoluteFillObject,
  },

  star: {
    position: "absolute",
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: "#FFFFFF",
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

  // ==========================================================
  // LOADING
  // ==========================================================

  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  loadingLogoWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },

  loadingLogo: {
    width: 175,
    height: 90,
  },

  loadingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    gap: 6,
  },

  loadingDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#A8B2FF",
    opacity: 0.7,
  },

  loadingDotMiddle: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#B7A7FF",
    opacity: 1,
  },

  // ==========================================================
  // CHOICE SCREEN
  // ==========================================================

  choiceScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingVertical: 40,
  },

  choiceLogoContainer: {
    alignItems: "center",
    marginBottom: 12,
  },

  choiceLogo: {
    width: 100,
    height: 65,
  },

  choiceHeading: {
    alignItems: "center",
    marginBottom: 28,
  },

  choiceSubtitle: {
    color: "#A8B2FF",
    fontFamily: "Bitter",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 9,
    textAlign: "center",
    maxWidth: 330,
  },

  choiceCard: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    backgroundColor:
      "rgba(18,26,69,0.90)",
    borderWidth: 1,
    borderColor:
      "rgba(168,178,255,0.16)",
    borderRadius: 25,
    padding: 19,
  },

  primaryButton: {
    height: 55,
    borderRadius: 15,
    backgroundColor: "#7C5DFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,

    shadowColor: "#7C5DFF",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 5,
  },

  primaryButtonTitle: {
    color: "#FFFFFF",
    fontFamily: "BitterBold",
    fontSize: 15,
  },

  secondaryButton: {
    height: 55,
    borderRadius: 15,
    backgroundColor:
      "rgba(255,255,255,0.035)",
    borderWidth: 1,
    borderColor:
      "rgba(168,178,255,0.20)",
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryButtonTitle: {
    color: "#E8E6FF",
    fontFamily: "BitterBold",
    fontSize: 15,
  },

  // ==========================================================
  // LOGIN / REGISTER
  // ==========================================================

  formScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    paddingTop: 62,
    paddingBottom: 35,
  },

  backButton: {
    position: "absolute",
    top: 18,
    left: 25,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 7,
    paddingHorizontal: 4,
  },

  backText: {
    color: "#B7B6D8",
    fontFamily: "BitterBold",
    fontSize: 12,
  },

  // ==========================================================
  // FORM BRANDING
  // ==========================================================

  formLogoContainer: {
    alignItems: "center",
    marginBottom: 1,
  },

  formLogo: {
    width: 72,
    height: 48,
  },

  formBrand: {
    alignItems: "center",
    marginBottom: 15,
  },

  // ==========================================================
  // FORM HEADING
  // ==========================================================

  formHeading: {
    alignItems: "center",
    marginBottom: 21,
    paddingHorizontal: 12,
  },

  title: {
    color: "#FFFFFF",
    fontFamily: "BitterBold",
    fontSize: 25,
    lineHeight: 32,
    textAlign: "center",
  },

  subtitle: {
    color: "#A8B2FF",
    fontFamily: "Bitter",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 6,
    maxWidth: 320,
  },

  // ==========================================================
  // FORM CARD
  // ==========================================================

  card: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    backgroundColor:
      "rgba(18,26,69,0.92)",
    borderWidth: 1,
    borderColor:
      "rgba(168,178,255,0.16)",
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
    borderColor:
      "rgba(168,178,255,0.16)",
    backgroundColor:
      "rgba(255,255,255,0.045)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
    marginBottom: 15,
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
    alignItems: "center",
    justifyContent: "center",
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

  // ==========================================================
  // BOTTOM AUTH SWITCH
  // ==========================================================

  switchAuthRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 19,
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