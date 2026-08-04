import React, { useEffect, useMemo, useRef } from 'react';
import { View, StyleSheet, Dimensions, Animated } from 'react-native';

const { width, height } = Dimensions.get('window');

type StarData = {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
};

function TwinklingStar({ star }: { star: StarData }) {
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

    const timeout = setTimeout(() => animation.start(), star.delay);

    return () => {
      clearTimeout(timeout);
      animation.stop();
    };
  }, []);

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: star.x,
          top: star.y,
          width: star.size,
          height: star.size,
          borderRadius: star.size / 2,
          opacity,
        },
      ]}
    />
  );
}

export default function StarryBackground() {
  const stars = useMemo<StarData[]>(() => {
    return Array.from({ length: 140 }).map((_, i) => ({
      id: i,
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 2000 + 1000, // 1s–3s
      delay: Math.random() * 3000,
    }))
  }, []);

  return (
    <View style={styles.container} pointerEvents="none">
      {stars.map((star) => (
        <TwinklingStar key={star.id} star={star} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: 'absolute',
    backgroundColor: '#ffffff',
    shadowColor: '#ffffff',
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
});