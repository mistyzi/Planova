import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { useTheme } from "../context/themecontext";

const { width, height } = Dimensions.get("window");

type StarData = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
};

function TwinklingStar({ star }: { star: StarData }) {
  const { isDark } = useTheme();
  const opacity = useRef(new Animated.Value(Math.random())).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: star.duration,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: star.duration,
          useNativeDriver: true,
        }),
      ])
    );

    const timeout = setTimeout(() => {
      animation.start();
    }, star.delay);

    return () => {
      clearTimeout(timeout);
      animation.stop();
    };
  }, [opacity, star.duration, star.delay]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.star,
        {
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          opacity,
          backgroundColor: isDark ? "#ffffff" : "#5B4B86",
          shadowColor: isDark ? "#ffffff" : "#5B4B86",
        },
      ]}
    />
  );
}

export default function StarryBackground() {
  const stars = useMemo<StarData[]>(() => {
    return Array.from({ length: 140 }, (_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 2000 + 1000,
      delay: Math.random() * 3000,
    }));
  }, []);

  return (
    <View pointerEvents="none" style={styles.container}>
      {stars.map((star) => (
        <TwinklingStar key={star.id} star={star} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  star: {
    position: "absolute",
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});