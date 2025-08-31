import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import * as Animatable from 'react-native-animatable';

import { theme, spacing } from '../constants/theme';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  overlay?: boolean;
}

export default function LoadingSpinner({ 
  message = 'Loading...', 
  size = 'large',
  overlay = false 
}: LoadingSpinnerProps) {
  const containerStyle = overlay ? styles.overlayContainer : styles.container;

  return (
    <View style={containerStyle}>
      <Animatable.View 
        animation="fadeIn" 
        duration={300}
        style={styles.content}
      >
        <ActivityIndicator 
          size={size} 
          color={theme.colors.primary}
          style={styles.spinner}
        />
        {message && (
          <Text variant="bodyMedium" style={styles.message}>
            {message}
          </Text>
        )}
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: spacing.lg,
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: spacing.xl,
    borderRadius: 12,
    minWidth: 120,
  },
  spinner: {
    marginBottom: spacing.md,
  },
  message: {
    color: theme.colors.onSurface,
    textAlign: 'center',
  },
});