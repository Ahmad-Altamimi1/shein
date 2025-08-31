import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Surface,
  ProgressBar,
  Chip,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useApp } from '../services/AppContext';
import { theme, spacing, borderRadius, shadows } from '../constants/theme';
import { OrderStatus, RootStackParamList } from '../types';

type OrderTrackingScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type OrderTrackingScreenRouteProp = RouteProp<RootStackParamList, 'OrderTracking'>;

interface OrderStatusStep {
  status: OrderStatus;
  title: string;
  description: string;
  icon: string;
  completed: boolean;
  current: boolean;
  timestamp?: Date;
}

export default function OrderTrackingScreen() {
  const navigation = useNavigation<OrderTrackingScreenNavigationProp>();
  const route = useRoute<OrderTrackingScreenRouteProp>();
  const { state } = useApp();
  
  const [refreshing, setRefreshing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(OrderStatus.CONFIRMED);
  
  const { orderId } = route.params;

  // Mock order data - in production, fetch from API
  const orderSteps: OrderStatusStep[] = [
    {
      status: OrderStatus.CONFIRMED,
      title: 'Order Confirmed',
      description: 'Your order has been received and confirmed',
      icon: 'check-circle',
      completed: true,
      current: currentStatus === OrderStatus.CONFIRMED,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      status: OrderStatus.PROCESSING,
      title: 'Processing',
      description: 'We are preparing your items for shipment',
      icon: 'package-variant',
      completed: currentStatus !== OrderStatus.CONFIRMED,
      current: currentStatus === OrderStatus.PROCESSING,
      timestamp: currentStatus !== OrderStatus.CONFIRMED ? new Date(Date.now() - 1 * 60 * 60 * 1000) : undefined,
    },
    {
      status: OrderStatus.SHIPPED,
      title: 'Shipped',
      description: 'Your order is on its way to you',
      icon: 'truck-delivery',
      completed: [OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(currentStatus),
      current: currentStatus === OrderStatus.SHIPPED,
      timestamp: currentStatus === OrderStatus.SHIPPED ? new Date(Date.now() - 30 * 60 * 1000) : undefined,
    },
    {
      status: OrderStatus.DELIVERED,
      title: 'Delivered',
      description: 'Your order has been delivered successfully',
      icon: 'home-circle',
      completed: currentStatus === OrderStatus.DELIVERED,
      current: currentStatus === OrderStatus.DELIVERED,
      timestamp: currentStatus === OrderStatus.DELIVERED ? new Date() : undefined,
    },
  ];

  const progress = orderSteps.filter(step => step.completed).length / orderSteps.length;

  useEffect(() => {
    // Simulate order status updates
    const statusTimer = setTimeout(() => {
      if (currentStatus === OrderStatus.CONFIRMED) {
        setCurrentStatus(OrderStatus.PROCESSING);
      } else if (currentStatus === OrderStatus.PROCESSING) {
        setCurrentStatus(OrderStatus.SHIPPED);
      }
    }, 5000);

    return () => clearTimeout(statusTimer);
  }, [currentStatus]);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call to refresh order status
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'How would you like to contact our support team?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Email', 
          onPress: () => Linking.openURL('mailto:support@sheinhelper.com?subject=Order Support - ' + orderId)
        },
        { 
          text: 'Phone', 
          onPress: () => Linking.openURL('tel:+1234567890')
        },
      ]
    );
  };

  const getStatusColor = (step: OrderStatusStep) => {
    if (step.completed) return theme.colors.primary;
    if (step.current) return theme.colors.secondary;
    return theme.colors.onSurfaceVariant;
  };

  const getStatusIcon = (step: OrderStatusStep) => {
    if (step.completed) return 'check-circle';
    if (step.current) return step.icon;
    return step.icon + '-outline';
  };

  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return '';
    return timestamp.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Order Header */}
      <Animatable.View animation="fadeInDown" duration={600}>
        <Surface style={styles.orderHeader} elevation={1}>
          <Text variant="titleLarge" style={styles.orderTitle}>
            Order #{orderId}
          </Text>
          <Text variant="bodyMedium" style={styles.orderSubtitle}>
            Track your order progress and get real-time updates
          </Text>
          
          <View style={styles.progressContainer}>
            <Text variant="bodySmall" style={styles.progressLabel}>
              Order Progress
            </Text>
            <ProgressBar 
              progress={progress} 
              color={theme.colors.primary}
              style={styles.progressBar}
            />
            <Text variant="bodySmall" style={styles.progressText}>
              {Math.round(progress * 100)}% Complete
            </Text>
          </View>
        </Surface>
      </Animatable.View>

      {/* Order Status Steps */}
      <Animatable.View animation="fadeInUp" duration={600} delay={200}>
        <Surface style={styles.statusSection} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Order Status
          </Text>
          
          {orderSteps.map((step, index) => (
            <View key={step.status} style={styles.statusStep}>
              <View style={styles.statusIndicator}>
                <Surface 
                  style={[
                    styles.statusIcon,
                    { backgroundColor: getStatusColor(step) }
                  ]} 
                  elevation={step.current ? 3 : 1}
                >
                  <MaterialCommunityIcons
                    name={getStatusIcon(step) as any}
                    size={24}
                    color={step.completed || step.current ? theme.colors.onPrimary : theme.colors.onSurfaceVariant}
                  />
                </Surface>
                
                {index < orderSteps.length - 1 && (
                  <View 
                    style={[
                      styles.statusLine,
                      { backgroundColor: step.completed ? theme.colors.primary : theme.colors.outline }
                    ]} 
                  />
                )}
              </View>
              
              <View style={styles.statusContent}>
                <View style={styles.statusHeader}>
                  <Text 
                    variant="titleSmall" 
                    style={[
                      styles.statusTitle,
                      { color: step.completed || step.current ? theme.colors.onSurface : theme.colors.onSurfaceVariant }
                    ]}
                  >
                    {step.title}
                  </Text>
                  {step.timestamp && (
                    <Text variant="bodySmall" style={styles.statusTimestamp}>
                      {formatTimestamp(step.timestamp)}
                    </Text>
                  )}
                </View>
                
                <Text 
                  variant="bodyMedium" 
                  style={[
                    styles.statusDescription,
                    { color: step.completed || step.current ? theme.colors.onSurfaceVariant : theme.colors.outline }
                  ]}
                >
                  {step.description}
                </Text>
                
                {step.current && (
                  <Chip 
                    style={styles.currentChip}
                    textStyle={styles.currentChipText}
                    icon="clock"
                  >
                    Current Status
                  </Chip>
                )}
              </View>
            </View>
          ))}
        </Surface>
      </Animatable.View>

      {/* Tracking Information */}
      {currentStatus === OrderStatus.SHIPPED && (
        <Animatable.View animation="fadeInUp" duration={600} delay={400}>
          <Surface style={styles.trackingSection} elevation={1}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Tracking Information
            </Text>
            
            <View style={styles.trackingInfo}>
              <View style={styles.trackingRow}>
                <MaterialCommunityIcons 
                  name="truck" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <View style={styles.trackingText}>
                  <Text variant="bodyMedium" style={styles.trackingLabel}>
                    Tracking Number
                  </Text>
                  <Text variant="titleSmall" style={styles.trackingValue}>
                    SH{orderId.slice(-8).toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <View style={styles.trackingRow}>
                <MaterialCommunityIcons 
                  name="calendar" 
                  size={20} 
                  color={theme.colors.secondary} 
                />
                <View style={styles.trackingText}>
                  <Text variant="bodyMedium" style={styles.trackingLabel}>
                    Estimated Delivery
                  </Text>
                  <Text variant="titleSmall" style={styles.trackingValue}>
                    {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>
            </View>
          </Surface>
        </Animatable.View>
      )}

      {/* Support Section */}
      <Animatable.View animation="fadeInUp" duration={600} delay={500}>
        <Surface style={styles.supportSection} elevation={1}>
          <View style={styles.supportHeader}>
            <MaterialCommunityIcons 
              name="help-circle" 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text variant="titleMedium" style={styles.supportTitle}>
              Need Help?
            </Text>
          </View>
          
          <Text variant="bodyMedium" style={styles.supportDescription}>
            Our support team is here to help with any questions about your order.
          </Text>
          
          <View style={styles.supportButtons}>
            <Button
              mode="outlined"
              onPress={handleContactSupport}
              style={styles.supportButton}
              icon="message"
            >
              Contact Support
            </Button>
            
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Main')}
              style={styles.supportButton}
              icon="home"
            >
              Back to Home
            </Button>
          </View>
        </Surface>
      </Animatable.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  orderHeader: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  orderTitle: {
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
  },
  orderSubtitle: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  progressContainer: {
    gap: spacing.sm,
  },
  progressLabel: {
    color: theme.colors.onSurfaceVariant,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.surfaceVariant,
  },
  progressText: {
    color: theme.colors.primary,
    fontWeight: '500',
    textAlign: 'right',
  },
  statusSection: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  sectionTitle: {
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.lg,
  },
  statusStep: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
  },
  statusIndicator: {
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusLine: {
    width: 2,
    height: 40,
    marginTop: spacing.sm,
  },
  statusContent: {
    flex: 1,
    paddingTop: spacing.sm,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  statusTitle: {
    fontWeight: '600',
  },
  statusTimestamp: {
    color: theme.colors.onSurfaceVariant,
  },
  statusDescription: {
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  currentChip: {
    backgroundColor: theme.colors.secondaryContainer,
    alignSelf: 'flex-start',
  },
  currentChipText: {
    color: theme.colors.onSecondaryContainer,
    fontSize: 10,
  },
  trackingSection: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  trackingInfo: {
    gap: spacing.md,
  },
  trackingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trackingText: {
    marginLeft: spacing.md,
    flex: 1,
  },
  trackingLabel: {
    color: theme.colors.onSurfaceVariant,
  },
  trackingValue: {
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginTop: spacing.xs,
  },
  supportSection: {
    margin: spacing.lg,
    marginTop: 0,
    marginBottom: spacing.xl,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  supportTitle: {
    marginLeft: spacing.sm,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  supportDescription: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  supportButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  supportButton: {
    flex: 1,
    borderColor: theme.colors.primary,
  },
});