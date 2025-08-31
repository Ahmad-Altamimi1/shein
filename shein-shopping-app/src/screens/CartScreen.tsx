import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Surface,
  IconButton,
  Divider,
  Switch,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useApp } from '../services/AppContext';
import { theme, spacing, borderRadius, shadows } from '../constants/theme';
import { CartItem, RootStackParamList, OrderStatus } from '../types';

type CartScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function CartScreen() {
  const navigation = useNavigation<CartScreenNavigationProp>();
  const { state, removeFromCart, updateCartQuantity, clearCart, getCartTotal } = useApp();
  
  const [mergeOrders, setMergeOrders] = useState(true);
  const [isCalculatingShipping, setIsCalculatingShipping] = useState(false);

  const cartTotal = getCartTotal();
  const shippingCost = mergeOrders ? 5.99 : state.cart.length * 3.99;
  const totalWithShipping = cartTotal + shippingCost;

  const handleRemoveItem = async (item: CartItem) => {
    Alert.alert(
      'Remove Item',
      `Remove ${item.product.name} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await removeFromCart(item.product.id, item.selectedSize, item.selectedColor);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleUpdateQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(item);
      return;
    }

    await updateCartQuantity(
      item.product.id,
      newQuantity,
      item.selectedSize,
      item.selectedColor
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await clearCart();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (state.cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checking out');
      return;
    }

    // Navigate to order confirmation with cart data
    navigation.navigate('OrderConfirmation', { 
      orderId: `temp_${Date.now()}` // Temporary ID for order creation
    });
  };

  const renderCartItem = (item: CartItem, index: number) => (
    <Animatable.View 
      key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
      animation="fadeInUp" 
      duration={600} 
      delay={index * 100}
    >
      <Card style={styles.cartItem} mode="elevated">
        <View style={styles.itemContainer}>
          <Image source={{ uri: item.product.image }} style={styles.itemImage} />
          
          <View style={styles.itemDetails}>
            <Text variant="titleSmall" style={styles.itemName} numberOfLines={2}>
              {item.product.name}
            </Text>
            
            <Text variant="bodySmall" style={styles.itemCode}>
              Code: {item.product.code}
            </Text>
            
            {item.selectedSize && (
              <Text variant="bodySmall" style={styles.itemOption}>
                Size: {item.selectedSize}
              </Text>
            )}
            
            {item.selectedColor && (
              <Text variant="bodySmall" style={styles.itemOption}>
                Color: {item.selectedColor}
              </Text>
            )}
            
            <View style={styles.priceContainer}>
              <Text variant="titleMedium" style={styles.itemPrice}>
                ${item.product.price}
              </Text>
              <Text variant="bodySmall" style={styles.itemTotal}>
                Total: ${(item.product.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          </View>

          <View style={styles.itemActions}>
            <IconButton
              icon="delete"
              size={20}
              onPress={() => handleRemoveItem(item)}
              style={styles.removeButton}
            />
            
            <View style={styles.quantityControls}>
              <IconButton
                icon="minus"
                size={18}
                onPress={() => handleUpdateQuantity(item, item.quantity - 1)}
                disabled={item.quantity <= 1}
                style={styles.quantityButton}
              />
              <Surface style={styles.quantityDisplay} elevation={1}>
                <Text variant="bodyMedium" style={styles.quantityText}>
                  {item.quantity}
                </Text>
              </Surface>
              <IconButton
                icon="plus"
                size={18}
                onPress={() => handleUpdateQuantity(item, item.quantity + 1)}
                disabled={item.quantity >= 10}
                style={styles.quantityButton}
              />
            </View>
          </View>
        </View>
      </Card>
    </Animatable.View>
  );

  if (state.cart.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Animatable.View animation="fadeIn" duration={800}>
          <MaterialCommunityIcons 
            name="cart-outline" 
            size={80} 
            color={theme.colors.onSurfaceVariant} 
          />
          <Text variant="headlineSmall" style={styles.emptyTitle}>
            Your cart is empty
          </Text>
          <Text variant="bodyLarge" style={styles.emptySubtitle}>
            Start shopping by entering a product code
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
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Cart Header */}
        <Animatable.View animation="fadeInDown" duration={600}>
          <Surface style={styles.cartHeader} elevation={1}>
            <View style={styles.headerRow}>
              <Text variant="titleLarge" style={styles.cartTitle}>
                Shopping Cart ({state.cart.length} items)
              </Text>
              <IconButton
                icon="delete-sweep"
                size={24}
                onPress={handleClearCart}
                style={styles.clearButton}
              />
            </View>
          </Surface>
        </Animatable.View>

        {/* Cart Items */}
        <View style={styles.cartItems}>
          {state.cart.map((item, index) => renderCartItem(item, index))}
        </View>

        {/* Shipping Options */}
        <Animatable.View animation="fadeInUp" duration={600}>
          <Surface style={styles.shippingSection} elevation={1}>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Shipping Options
            </Text>
            
            <View style={styles.shippingOption}>
              <View style={styles.shippingOptionLeft}>
                <MaterialCommunityIcons 
                  name="package-variant" 
                  size={20} 
                  color={theme.colors.primary} 
                />
                <View style={styles.shippingOptionText}>
                  <Text variant="bodyMedium" style={styles.shippingOptionTitle}>
                    Merge Orders
                  </Text>
                  <Text variant="bodySmall" style={styles.shippingOptionDescription}>
                    Combine items to reduce shipping cost
                  </Text>
                </View>
              </View>
              <Switch
                value={mergeOrders}
                onValueChange={setMergeOrders}
                thumbColor={mergeOrders ? theme.colors.primary : theme.colors.outline}
                trackColor={{ 
                  false: theme.colors.surfaceVariant, 
                  true: theme.colors.primaryContainer 
                }}
              />
            </View>
            
            <View style={styles.shippingCostContainer}>
              <Text variant="bodyMedium" style={styles.shippingCostText}>
                Estimated Shipping: ${shippingCost.toFixed(2)}
              </Text>
              {mergeOrders && (
                <Text variant="bodySmall" style={styles.savingsText}>
                  You save ${((state.cart.length * 3.99) - 5.99).toFixed(2)} with merged shipping
                </Text>
              )}
            </View>
          </Surface>
        </Animatable.View>
      </ScrollView>

      {/* Order Summary Footer */}
      <Animatable.View animation="fadeInUp" duration={600}>
        <Surface style={styles.orderSummary} elevation={3}>
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>
              Subtotal:
            </Text>
            <Text variant="bodyMedium" style={styles.summaryValue}>
              ${cartTotal.toFixed(2)}
            </Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text variant="bodyMedium" style={styles.summaryLabel}>
              Shipping:
            </Text>
            <Text variant="bodyMedium" style={styles.summaryValue}>
              ${shippingCost.toFixed(2)}
            </Text>
          </View>
          
          <Divider style={styles.summaryDivider} />
          
          <View style={styles.summaryRow}>
            <Text variant="titleMedium" style={styles.totalLabel}>
              Total:
            </Text>
            <Text variant="titleLarge" style={styles.totalValue}>
              ${totalWithShipping.toFixed(2)}
            </Text>
          </View>
          
          <Button
            mode="contained"
            onPress={handleCheckout}
            style={styles.checkoutButton}
            contentStyle={styles.checkoutButtonContent}
            labelStyle={styles.checkoutButtonLabel}
            icon="arrow-right"
          >
            Proceed to Checkout
          </Button>
        </Surface>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
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
  cartHeader: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartTitle: {
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  clearButton: {
    backgroundColor: theme.colors.errorContainer,
  },
  cartItems: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  cartItem: {
    borderRadius: borderRadius.lg,
    ...shadows.small,
  },
  itemContainer: {
    flexDirection: 'row',
    padding: spacing.md,
  },
  itemImage: {
    width: 80,
    height: 100,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  itemName: {
    fontWeight: '500',
    color: theme.colors.onSurface,
    marginBottom: spacing.xs,
  },
  itemCode: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.xs,
  },
  itemOption: {
    color: theme.colors.onSurfaceVariant,
    fontSize: 12,
  },
  priceContainer: {
    marginTop: spacing.sm,
  },
  itemPrice: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  itemTotal: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  itemActions: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  removeButton: {
    backgroundColor: theme.colors.errorContainer,
    marginBottom: spacing.sm,
  },
  quantityControls: {
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: theme.colors.surfaceVariant,
    margin: spacing.xs,
  },
  quantityDisplay: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: theme.colors.surface,
    marginVertical: spacing.xs,
  },
  quantityText: {
    fontWeight: '600',
    color: theme.colors.onSurface,
    textAlign: 'center',
    minWidth: 20,
  },
  shippingSection: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  sectionTitle: {
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.md,
  },
  shippingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  shippingOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  shippingOptionText: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  shippingOptionTitle: {
    fontWeight: '500',
    color: theme.colors.onSurface,
  },
  shippingOptionDescription: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  shippingCostContainer: {
    backgroundColor: theme.colors.primaryContainer,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  shippingCostText: {
    fontWeight: '500',
    color: theme.colors.onPrimaryContainer,
  },
  savingsText: {
    color: theme.colors.primary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  orderSummary: {
    padding: spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    ...shadows.large,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    color: theme.colors.onSurfaceVariant,
  },
  summaryValue: {
    color: theme.colors.onSurface,
    fontWeight: '500',
  },
  summaryDivider: {
    marginVertical: spacing.md,
  },
  totalLabel: {
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  totalValue: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  checkoutButton: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  checkoutButtonContent: {
    paddingVertical: spacing.sm,
  },
  checkoutButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});