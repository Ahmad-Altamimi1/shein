import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import { theme, spacing, borderRadius } from '../constants/theme';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you would log this to a crash reporting service
    // like Sentry, Crashlytics, etc.
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Animatable.View animation="fadeIn" duration={800}>
            <Surface style={styles.errorContainer} elevation={2}>
              <MaterialCommunityIcons 
                name="alert-circle" 
                size={64} 
                color={theme.colors.error} 
              />
              
              <Text variant="headlineSmall" style={styles.errorTitle}>
                Oops! Something went wrong
              </Text>
              
              <Text variant="bodyLarge" style={styles.errorMessage}>
                We're sorry, but something unexpected happened. 
                Please try again or contact support if the problem persists.
              </Text>

              {__DEV__ && this.state.error && (
                <Surface style={styles.errorDetails} elevation={1}>
                  <Text variant="labelMedium" style={styles.errorDetailsTitle}>
                    Error Details (Development Mode):
                  </Text>
                  <Text variant="bodySmall" style={styles.errorDetailsText}>
                    {this.state.error.message}
                  </Text>
                </Surface>
              )}

              <View style={styles.buttonContainer}>
                <Button
                  mode="contained"
                  onPress={this.handleRetry}
                  style={styles.retryButton}
                  icon="refresh"
                >
                  Try Again
                </Button>
                
                <Button
                  mode="outlined"
                  onPress={() => {
                    // In production, implement support contact
                    console.log('Contact support');
                  }}
                  style={styles.supportButton}
                  icon="help-circle"
                >
                  Contact Support
                </Button>
              </View>
            </Surface>
          </Animatable.View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorContainer: {
    padding: spacing.xl,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    maxWidth: 350,
  },
  errorTitle: {
    fontWeight: '600',
    color: theme.colors.onSurface,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  errorMessage: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  errorDetails: {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: theme.colors.errorContainer,
    marginBottom: spacing.lg,
  },
  errorDetailsTitle: {
    color: theme.colors.onErrorContainer,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  errorDetailsText: {
    color: theme.colors.onErrorContainer,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    width: '100%',
    gap: spacing.md,
  },
  retryButton: {
    borderRadius: borderRadius.md,
  },
  supportButton: {
    borderRadius: borderRadius.md,
    borderColor: theme.colors.primary,
  },
});