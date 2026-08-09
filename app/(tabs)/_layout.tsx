import { Tabs } from 'expo-router';
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Entypo } from "@react-native-vector-icons/entypo";
import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import StarryBackground from "@/components/starrybackground";
import { ProfileSheetProvider } from "@/context/profilesheetcontext";
import { useTheme } from "@/context/themecontext";

const SCREEN_WIDTH = Dimensions.get("window").width;

export default function TabLayout() {
  const NAV_WIDTH = 280;
  const SIDE_MARGIN = (SCREEN_WIDTH - NAV_WIDTH) / 2;
  const { isDark } = useTheme();

  const backgroundColors: [string, string] = isDark
    ? ["#0e1938", "#6b41bf"]
    : ["#EEF3FF", "#DCCFF5"];

  const navBorderColors: [string, string, string] = isDark
    ? ["#f9a8d4", "#c084fc", "#6366f1"]
    : ["#D8B4FE", "#C4B5FD", "#A5B4FC"];

  const navInnerColors: [string, string] = isDark
    ? ["rgba(14,25,56,0.96)", "rgba(14,25,56,0.96)"]
    : ["rgba(248,250,255,0.96)", "rgba(248,250,255,0.96)"];

  const activeTintColor = isDark ? "#ffffff" : "#33265C";
  const inactiveTintColor = isDark ? "rgba(203,213,225,0.65)" : "rgba(71,65,96,0.60)";

  return (
    <GestureHandlerRootView style={styles.root}>
      <ProfileSheetProvider>
        <View style={styles.container}>
          <LinearGradient
            colors={backgroundColors}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />
          <StarryBackground />
          <Tabs
            screenOptions={{
              headerShown: false,
              tabBarShowLabel: true,
              sceneStyle: {
                backgroundColor: "transparent",
              },
              tabBarStyle: {
                position: "absolute",
                width: NAV_WIDTH,
                marginLeft: SIDE_MARGIN,
                bottom: 25,
                height: 80,
                borderRadius: 999,
                backgroundColor: "transparent",
                borderWidth: 0,
                paddingTop: 8,
                paddingBottom: 8,
                elevation: 0,
                zIndex: 0,
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 10,
                },
                shadowOpacity: isDark ? 0.35 : 0.18,
                shadowRadius: 20,
              },
              tabBarBackground: () => (
                <LinearGradient
                  colors={navBorderColors}
                  start={{ x: 0, y: 0.5 }}
                  end={{ x: 1, y: 0.5 }}
                  style={{
                    flex: 1,
                    borderRadius: 999,
                    padding: 2,
                  }}
                >
                  <LinearGradient
                    colors={navInnerColors}
                    style={{
                      flex: 1,
                      borderRadius: 999,
                    }}
                  />
                </LinearGradient>
              ),
              tabBarItemStyle: {
                height: 54,
                alignItems: "center",
                justifyContent: "center",
              },
              tabBarLabelStyle: {
                marginTop: 2,
                fontSize: 11,
                fontWeight: "600",
              },
              tabBarActiveTintColor: activeTintColor,
              tabBarInactiveTintColor: inactiveTintColor,
              tabBarLabelPosition: "below-icon",
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: "Home",
                tabBarIcon: ({ focused, color }) => (
                  <Entypo
                    name="home"
                    size={focused ? 26 : 22}
                    color={color}
                    style={{
                      opacity: focused ? 1 : 0.65,
                      transform: [
                        {
                          scale: focused ? 1.08 : 1,
                        },
                      ],
                    }}
                  />
                ),
                tabBarLabelStyle: {
                  marginTop: 5,
                  fontSize: 11,
                  fontWeight: "600",
                  opacity: 1,
                },
              }}
            />
            <Tabs.Screen
              name="tasks"
              options={{
                title: "Tasks",
                tabBarIcon: ({ focused, color }) => (
                  <Ionicons
                    name="list-circle"
                    size={focused ? 26 : 22}
                    color={color}
                    style={{
                      opacity: focused ? 1 : 0.65,
                      transform: [
                        {
                          scale: focused ? 1.08 : 1,
                        },
                      ],
                    }}
                  />
                ),
                tabBarLabelStyle: {
                  marginTop: 2,
                  fontSize: 11,
                  fontWeight: "600",
                },
              }}
            />
            <Tabs.Screen
              name="study"
              options={{
                title: "Study",
                tabBarIcon: ({ focused, color }) => (
                  <Entypo
                    name="book"
                    size={focused ? 26 : 22}
                    color={color}
                    style={{
                      opacity: focused ? 1 : 0.65,
                      transform: [
                        {
                          scale: focused ? 1.08 : 1,
                        },
                      ],
                    }}
                  />
                ),
                tabBarLabelStyle: {
                  marginTop: 2,
                  fontSize: 11,
                  fontWeight: "600",
                },
              }}
            />
          </Tabs>
        </View>
      </ProfileSheetProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
});