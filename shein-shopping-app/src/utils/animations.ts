import { Dimensions } from 'react-native';
import { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withTiming, 
  withSequence,
  withRepeat,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');

// Spring configurations
export const springConfig = {
  damping: 15,
  stiffness: 150,
  mass: 1,
};

export const bounceConfig = {
  damping: 8,
  stiffness: 100,
  mass: 1,
};

// Timing configurations
export const timingConfig = {
  duration: 300,
};

export const slowTimingConfig = {
  duration: 500,
};

// Animation presets
export const fadeIn = (duration: number = 300) => ({
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration,
});

export const fadeOut = (duration: number = 300) => ({
  from: { opacity: 1 },
  to: { opacity: 0 },
  duration,
});

export const slideInUp = (duration: number = 300) => ({
  from: { translateY: 50, opacity: 0 },
  to: { translateY: 0, opacity: 1 },
  duration,
});

export const slideInDown = (duration: number = 300) => ({
  from: { translateY: -50, opacity: 0 },
  to: { translateY: 0, opacity: 1 },
  duration,
});

export const slideInLeft = (duration: number = 300) => ({
  from: { translateX: -width, opacity: 0 },
  to: { translateX: 0, opacity: 1 },
  duration,
});

export const slideInRight = (duration: number = 300) => ({
  from: { translateX: width, opacity: 0 },
  to: { translateX: 0, opacity: 1 },
  duration,
});

export const scaleIn = (duration: number = 300) => ({
  from: { scale: 0.8, opacity: 0 },
  to: { scale: 1, opacity: 1 },
  duration,
});

export const bounce = (duration: number = 600) => ({
  from: { scale: 0.3 },
  to: { scale: 1 },
  duration,
  easing: 'ease-out-back',
});

export const pulse = (duration: number = 1000) => ({
  from: { scale: 1 },
  to: { scale: 1.05 },
  duration,
  direction: 'alternate',
  iterationCount: 'infinite',
  easing: 'ease-in-out',
});

export const shake = (duration: number = 500) => ({
  from: { translateX: 0 },
  to: { translateX: 10 },
  duration: duration / 8,
  direction: 'alternate',
  iterationCount: 8,
  easing: 'ease-in-out',
});

// Reanimated 3 hooks for advanced animations
export const useScaleAnimation = (trigger: boolean) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(trigger ? 1.05 : 1, springConfig),
        },
      ],
    };
  });

  return { scale, animatedStyle };
};

export const useFadeAnimation = (trigger: boolean) => {
  const opacity = useSharedValue(trigger ? 1 : 0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(trigger ? 1 : 0, timingConfig),
    };
  });

  return { opacity, animatedStyle };
};

export const useSlideAnimation = (trigger: boolean, direction: 'up' | 'down' | 'left' | 'right' = 'up') => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const getInitialValue = () => {
    switch (direction) {
      case 'up':
        return { x: 0, y: 50 };
      case 'down':
        return { x: 0, y: -50 };
      case 'left':
        return { x: 50, y: 0 };
      case 'right':
        return { x: -50, y: 0 };
      default:
        return { x: 0, y: 50 };
    }
  };

  const initial = getInitialValue();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withSpring(trigger ? 0 : initial.x, springConfig),
        },
        {
          translateY: withSpring(trigger ? 0 : initial.y, springConfig),
        },
      ],
      opacity: withTiming(trigger ? 1 : 0, timingConfig),
    };
  });

  return { translateX, translateY, animatedStyle };
};

export const useRotateAnimation = (trigger: boolean) => {
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          rotate: `${withSpring(trigger ? 360 : 0, springConfig)}deg`,
        },
      ],
    };
  });

  return { rotation, animatedStyle };
};

export const usePulseAnimation = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withTiming(1.05, { duration: 1000 }),
              withTiming(1, { duration: 1000 })
            ),
            -1,
            true
          ),
        },
      ],
    };
  });

  return { scale, animatedStyle };
};

// Gesture animations
export const useSwipeAnimation = () => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
    };
  });

  const swipeLeft = () => {
    translateX.value = withTiming(-width, timingConfig);
    opacity.value = withTiming(0, timingConfig);
  };

  const swipeRight = () => {
    translateX.value = withTiming(width, timingConfig);
    opacity.value = withTiming(0, timingConfig);
  };

  const reset = () => {
    translateX.value = withSpring(0, springConfig);
    opacity.value = withTiming(1, timingConfig);
  };

  return { translateX, opacity, animatedStyle, swipeLeft, swipeRight, reset };
};

// Card flip animation
export const useFlipAnimation = (trigger: boolean) => {
  const rotateY = useSharedValue(0);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      rotateY.value,
      [0, 90],
      [0, 90],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
      opacity: rotateValue > 45 ? 0 : 1,
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateValue = interpolate(
      rotateY.value,
      [90, 180],
      [90, 180],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ rotateY: `${rotateValue}deg` }],
      opacity: rotateValue < 135 ? 0 : 1,
    };
  });

  React.useEffect(() => {
    rotateY.value = withSpring(trigger ? 180 : 0, springConfig);
  }, [trigger, rotateY]);

  return { frontAnimatedStyle, backAnimatedStyle };
};