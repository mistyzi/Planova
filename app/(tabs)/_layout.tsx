import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Dimensions } from 'react-native';
import StarryBackground from '../../components/starrybackground';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function TabLayout() {
  const NAV_WIDTH = 280;
  const SIDE_MARGIN = (SCREEN_WIDTH - NAV_WIDTH) / 2;

  return (
    <>
      <LinearGradient
        colors={['#0e1938', '#6b41bf']}
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
            backgroundColor: 'transparent',
          },
          tabBarStyle: {
            position: 'absolute',
            width: NAV_WIDTH,
            marginLeft: SIDE_MARGIN,
            bottom: 25,
            height: 80,
            borderRadius: 999,
            backgroundColor: 'transparent',
            borderWidth: 0,
            paddingTop: 8,
            paddingBottom: 8,
            elevation: 20,
            zIndex: 20,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 10,
            },
            shadowOpacity: 0.35,
            shadowRadius: 20,
          },
          tabBarBackground: () => (
            <LinearGradient
              colors={['#f9a8d4', '#c084fc', '#6366f1']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{
                flex: 1,
                borderRadius: 999,
                padding: 2,
              }}
            >
              <LinearGradient
                colors={['rgba(14,25,56,0.96)', 'rgba(14,25,56,0.96)']}
                style={{
                  flex: 1,
                  borderRadius: 999,
                }}
              />
            </LinearGradient>
          ),
          tabBarItemStyle: {
            height: 54,
            alignItems: 'center',
            justifyContent: 'center',
          },
          tabBarLabelStyle: {
            marginTop: 2,
            fontSize: 11,
            fontWeight: '600',
          },
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: 'rgba(203,213,225,0.65)',
          tabBarLabelPosition: 'below-icon',
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
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
              fontWeight: '600',
              opacity: 1,
            },
          }}
        />

        <Tabs.Screen
          name="tasks"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name="checkmark-done"
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
              fontWeight: '600',
            },
          }}
        />

        <Tabs.Screen
          name="timer"
          options={{
            title: 'Timer',
            tabBarIcon: ({ focused, color }) => (
              <Ionicons
                name="timer"
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
              fontWeight: '600',
            },
          }}
        />
      </Tabs>
    </>
  );
}