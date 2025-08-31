import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Surface,
  TextInput,
  Divider,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useApp } from '../services/AppContext';
import { theme, spacing, borderRadius, shadows } from '../constants/theme';
import { Address, RootStackParamList, OrderStatus } from '../types';

type OrderConfirmationScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type OrderConfirmationScreenRouteProp = RouteProp<RootStackParamList, 'OrderConfirmation'>;

export default function OrderConfirmationScreen() {
  const navigation = useNavigation<OrderConfirmationScreenNavigationProp>();
  const route = useRoute<OrderConfirmationScreenRouteProp>();
  const { state, createOrder, getCartTotal } = useApp();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState<Address>({
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
  });

  const cartTotal = getCartTotal();
  const shippingCost = 5.99; // Simplified for demo
  const totalAmount = cartTotal + shippingCost;

  const validateAddress = (): boolean => {
    const requiredFields = ['fullName', 'street', 'city', 'state', 'zipCode', 'phone'];
    for (const field of requiredFields) {
      if (!shippingAddress[field as keyof Address]) {
        Alert.alert('Missing Information', `Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }

    // Basic phone validation
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    if (!phoneRegex.test(shippingAddress.phone)) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return false;
    }

    // Basic zip code validation
    const zipRegex = /^\d{5}(-\d{4})?$/;
    if (!zipRegex.test(shippingAddress.zipCode)) {
      Alert.alert('Invalid Zip Code', 'Please enter a valid zip code');
      return false;
    }

    return true;
  };

  const handleConfirmPurchase = async () => {
    if (state.cart.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty');
      return;
    }

    if (!validateAddress()) {
      return;
    }

    setIsProcessing(true);

    try {
      const order = await createOrder({
        userId: state.user?.id || 'guest',
        items: state.cart,
        totalAmount,
        shippingCost,
        status: OrderStatus.PENDING,
        shippingAddress,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Alert.alert(
        'Order Confirmed!',
        `Your order #${order.id} has been confirmed. You will receive updates via notifications.`,
        [
          {
            text: 'Track Order',
            onPress: () => {
              navigation.reset({
                index: 1,
                routes: [
                  { name: 'Main' },
                  { name: 'OrderTracking', params: { orderId: order.id } },
                ],
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Order Failed', 'Failed to create order. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateAddress = (field: keyof Address, value: string) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Order Summary */}
        <Animatable.View animation="fadeInDown" duration={600}>
          <Surface style={styles.orderSummarySection} elevation={1}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Order Summary
            </Text>
            
            {state.cart.map((item, index) => (
              <View key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`} style={styles.orderItem}>
                <View style={styles.orderItemInfo}>
                  <Text variant="bodyMedium" style={styles.orderItemName}>
                    {item.product.name}
                  </Text>
                  <View style={styles.orderItemDetails}>
                    {item.selectedSize && (
                      <Chip style={styles.detailChip} textStyle={styles.detailChipText}>
                        {item.selectedSize}
                      </Chip>
                    )}
                    {item.selectedColor && (
                      <Chip style={styles.detailChip} textStyle={styles.detailChipText}>
                        {item.selectedColor}
                      </Chip>
                    )}
                    <Text variant="bodySmall" style={styles.quantityText}>
                      Qty: {item.quantity}
                    </Text>
                  </View>
                </View>
                <Text variant="titleSmall" style={styles.orderItemPrice}>
                  ${(item.product.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            ))}
            
            <Divider style={styles.divider} />
            
            <View style={styles.totalRow}>
              <Text variant="bodyMedium">Subtotal:</Text>
              <Text variant="bodyMedium">${cartTotal.toFixed(2)}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text variant="bodyMedium">Shipping:</Text>
              <Text variant="bodyMedium">${shippingCost.toFixed(2)}</Text>
            </View>
            
            <View style={styles.totalRow}>
              <Text variant="titleMedium" style={styles.totalLabel}>Total:</Text>
              <Text variant="titleLarge" style={styles.totalAmount}>${totalAmount.toFixed(2)}</Text>
            </View>
          </Surface>
        </Animatable.View>

        {/* Shipping Address */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200}>
          <Surface style={styles.addressSection} elevation={1}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Shipping Address
            </Text>
            
            <View style={styles.addressForm}>
              <TextInput
                mode="outlined"
                label="Full Name *"
                value={shippingAddress.fullName}
                onChangeText={(value) => updateAddress('fullName', value)}
                style={styles.addressInput}
                autoCapitalize="words"
              />
              
              <TextInput
                mode="outlined"
                label="Street Address *"
                value={shippingAddress.street}
                onChangeText={(value) => updateAddress('street', value)}
                style={styles.addressInput}
                autoCapitalize="words"
              />
              
              <View style={styles.addressRow}>
                <TextInput
                  mode="outlined"
                  label="City *"
                  value={shippingAddress.city}
                  onChangeText={(value) => updateAddress('city', value)}
                  style={[styles.addressInput, styles.halfWidth]}
                  autoCapitalize="words"
                />
                
                <TextInput
                  mode="outlined"
                  label="State *"
                  value={shippingAddress.state}
                  onChangeText={(value) => updateAddress('state', value)}
                  style={[styles.addressInput, styles.halfWidth]}
                  autoCapitalize="characters"
                  maxLength={2}
                />
              </View>
              
              <View style={styles.addressRow}>
                <TextInput
                  mode="outlined"
                  label="Zip Code *"
                  value={shippingAddress.zipCode}
                  onChangeText={(value) => updateAddress('zipCode', value)}
                  style={[styles.addressInput, styles.halfWidth]}
                  keyboardType="numeric"
                  maxLength={10}
                />
                
                <TextInput
                  mode="outlined"
                  label="Phone *"
                  value={shippingAddress.phone}
                  onChangeText={(value) => updateAddress('phone', value)}
                  style={[styles.addressInput, styles.halfWidth]}
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </Surface>
        </Animatable.View>

        {/* Payment Info */}
        <Animatable.View animation="fadeInUp" duration={600} delay={400}>
          <Surface style={styles.paymentSection} elevation={1}>
            <View style={styles.paymentHeader}>
              <MaterialCommunityIcons 
                name="information" 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text variant="titleMedium" style={styles.paymentTitle}>
                Payment Information
              </Text>
            </View>
            <Text variant="bodyMedium" style={styles.paymentDescription}>
              This is an intermediary service. You will receive payment instructions 
              via email after confirming your order. We accept various payment methods 
              including PayPal, bank transfer, and credit cards.
            </Text>
          </Surface>
        </Animatable.View>

        {/* Terms and Conditions */}
        <Animatable.View animation="fadeInUp" duration={600} delay={500}>
          <Surface style={styles.termsSection} elevation={1}>
            <Text variant="bodySmall" style={styles.termsText}>
              By confirming this order, you agree to our Terms of Service and 
              Privacy Policy. Orders are processed within 1-2 business days.
            </Text>
          </Surface>
        </Animatable.View>
      </ScrollView>

      {/* Confirm Button */}
      <Animatable.View animation="fadeInUp" duration={600} delay={600}>
        <Surface style={styles.confirmSection} elevation={3}>
          <Button
            mode="contained"
            onPress={handleConfirmPurchase}
            loading={isProcessing}
            disabled={isProcessing || state.cart.length === 0}
            style={styles.confirmButton}
            contentStyle={styles.confirmButtonContent}
            labelStyle={styles.confirmButtonLabel}
            icon="check-circle"
          >
            {isProcessing ? 'Processing Order...' : `Confirm Purchase - $${totalAmount.toFixed(2)}`}
          </Button>
        </Surface>
      </Animatable.View>
    </KeyboardAvoidingView>
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
  orderSummarySection: {
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
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontWeight: '500',
    color: theme.colors.onSurface,
    marginBottom: spacing.xs,
  },
  orderItemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailChip: {
    backgroundColor: theme.colors.surfaceVariant,
    height: 24,
  },
  detailChipText: {
    fontSize: 10,
    color: theme.colors.onSurfaceVariant,
  },
  quantityText: {
    color: theme.colors.onSurfaceVariant,
  },
  orderItemPrice: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  divider: {
    marginVertical: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  totalLabel: {
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  totalAmount: {
    fontWeight: '700',
    color: theme.colors.primary,
  },
  addressSection: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  addressForm: {
    gap: spacing.md,
  },
  addressInput: {
    backgroundColor: theme.colors.surface,
  },
  addressRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  paymentSection: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.primaryContainer,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  paymentTitle: {
    marginLeft: spacing.sm,
    fontWeight: '600',
    color: theme.colors.onPrimaryContainer,
  },
  paymentDescription: {
    color: theme.colors.onPrimaryContainer,
    lineHeight: 20,
  },
  termsSection: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surfaceVariant,
  },
  termsText: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 16,
  },
  confirmSection: {
    padding: spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: borderRadius.lg,
    borderTopRightRadius: borderRadius.lg,
    ...shadows.large,
  },
  confirmButton: {
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  confirmButtonContent: {
    paddingVertical: spacing.md,
  },
  confirmButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});