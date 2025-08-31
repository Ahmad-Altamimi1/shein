import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Surface,
  Chip,
  Button,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useApp } from '../services/AppContext';
import { theme, spacing, borderRadius, shadows } from '../constants/theme';
import { Order, OrderStatus, RootStackParamList } from '../types';

type OrdersScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function OrdersScreen() {
  const navigation = useNavigation<OrdersScreenNavigationProp>();
  const { state } = useApp();
  
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call to refresh orders
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return theme.colors.outline;
      case OrderStatus.CONFIRMED:
        return theme.colors.secondary;
      case OrderStatus.PROCESSING:
        return theme.colors.tertiary;
      case OrderStatus.SHIPPED:
        return theme.colors.primary;
      case OrderStatus.DELIVERED:
        return '#4CAF50';
      case OrderStatus.CANCELLED:
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'clock-outline';
      case OrderStatus.CONFIRMED:
        return 'check-circle';
      case OrderStatus.PROCESSING:
        return 'package-variant';
      case OrderStatus.SHIPPED:
        return 'truck-delivery';
      case OrderStatus.DELIVERED:
        return 'home-circle';
      case OrderStatus.CANCELLED:
        return 'cancel';
      default:
        return 'help-circle';
    }
  };

  const renderOrderCard = (order: Order, index: number) => (
    <Animatable.View 
      key={order.id}
      animation="fadeInUp" 
      duration={600} 
      delay={index * 100}
    >
      <Card style={styles.orderCard} mode="elevated">
        <TouchableOpacity
          onPress={() => navigation.navigate('OrderTracking', { orderId: order.id })}
          activeOpacity={0.8}
        >
          <Card.Content style={styles.orderContent}>
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text variant="titleMedium" style={styles.orderId}>
                  Order #{order.id}
                </Text>
                <Text variant="bodySmall" style={styles.orderDate}>
                  {order.createdAt.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              
              <Chip
                style={[styles.statusChip, { backgroundColor: getStatusColor(order.status) }]}
                textStyle={styles.statusChipText}
                icon={getStatusIcon(order.status)}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </Chip>
            </View>

            <View style={styles.orderItems}>
              <Text variant="bodyMedium" style={styles.itemsLabel}>
                {order.items.length} item{order.items.length > 1 ? 's' : ''}
              </Text>
              <Text variant="bodySmall" style={styles.itemsPreview}>
                {order.items.slice(0, 2).map(item => item.product.name).join(', ')}
                {order.items.length > 2 && ` +${order.items.length - 2} more`}
              </Text>
            </View>

            <View style={styles.orderFooter}>
              <Text variant="titleMedium" style={styles.orderTotal}>
                ${order.totalAmount.toFixed(2)}
              </Text>
              <MaterialCommunityIcons 
                name="chevron-right" 
                size={24} 
                color={theme.colors.onSurfaceVariant} 
              />
            </View>
          </Card.Content>
        </TouchableOpacity>
      </Card>
    </Animatable.View>
  );

  if (state.orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Animatable.View animation="fadeIn" duration={800}>
          <MaterialCommunityIcons 
            name="package-variant-closed" 
            size={80} 
            color={theme.colors.onSurfaceVariant} 
          />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            No orders yet
          </Text>
          <Text variant="bodyLarge" style={styles.emptySubtitle}>
            Your order history will appear here once you make your first purchase
          </Text>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('ProductCode')}
            style={styles.startShoppingButton}
            icon="plus-circle"
          >
            Start Shopping
          </Button>
        </Animatable.View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <Animatable.View animation="fadeInDown" duration={600}>
        <Surface style={styles.header} elevation={1}>
          <Text variant="titleLarge" style={styles.headerTitle}>
            Your Orders
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Track and manage your SHEIN orders
          </Text>
        </Surface>
      </Animatable.View>

      {/* Orders List */}
      <View style={styles.ordersList}>
        {state.orders.map((order, index) => renderOrderCard(order, index))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: theme.colors.background,
  },
  emptyTitle: {
    fontWeight: '600',
    color: theme.colors.onBackground,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  startShoppingButton: {
    borderRadius: borderRadius.lg,
  },
  header: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  headerTitle: {
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
  },
  headerSubtitle: {
    color: theme.colors.onSurfaceVariant,
  },
  ordersList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  orderCard: {
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  orderContent: {
    padding: spacing.lg,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  orderDate: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  statusChip: {
    marginLeft: spacing.md,
  },
  statusChipText: {
    color: theme.colors.onPrimary,
    fontSize: 10,
    fontWeight: '600',
  },
  orderItems: {
    marginBottom: spacing.md,
  },
  itemsLabel: {
    fontWeight: '500',
    color: theme.colors.onSurface,
    marginBottom: spacing.xs,
  },
  itemsPreview: {
    color: theme.colors.onSurfaceVariant,
    lineHeight: 18,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderTotal: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
});