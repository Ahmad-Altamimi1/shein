import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Chip,
  Surface,
  IconButton,
  Divider,
  FAB,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useApp } from '../services/AppContext';
import { theme, spacing, borderRadius, shadows } from '../constants/theme';
import { RootStackParamList } from '../types';
import ARProductViewer from '../components/ARProductViewer';

const { width } = Dimensions.get('window');

type ProductDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList>;
type ProductDetailsScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetails'>;

export default function ProductDetailsScreen() {
  const navigation = useNavigation<ProductDetailsScreenNavigationProp>();
  const route = useRoute<ProductDetailsScreenRouteProp>();
  const { addToCart } = useApp();
  
  const { product } = route.params;
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showAR, setShowAR] = useState(false);

  const images = product.images || [product.image];

  const handleAddToCart = async () => {
    // Validation
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      Alert.alert('Select Size', 'Please select a size before adding to cart');
      return;
    }

    if (product.colors && product.colors.length > 0 && !selectedColor) {
      Alert.alert('Select Color', 'Please select a color before adding to cart');
      return;
    }

    try {
      await addToCart({
        product,
        quantity,
        selectedSize: selectedSize || undefined,
        selectedColor: selectedColor || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Added to Cart',
        `${product.name} has been added to your cart`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('Cart' as any) },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  const adjustQuantity = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Product Images */}
      <Animatable.View animation="fadeIn" duration={600}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: images[currentImageIndex] }} style={styles.productImage} />
          
          {/* Image Indicators */}
          {images.length > 1 && (
            <View style={styles.imageIndicators}>
              {images.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => setCurrentImageIndex(index)}
                  style={[
                    styles.imageIndicator,
                    currentImageIndex === index && styles.activeImageIndicator,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Discount Badge */}
          {product.originalPrice && (
            <Surface style={styles.discountBadge} elevation={2}>
              <Text variant="labelMedium" style={styles.discountText}>
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </Text>
            </Surface>
          )}
        </View>
      </Animatable.View>

      {/* Product Info */}
      <Animatable.View animation="fadeInUp" duration={600} delay={200}>
        <Surface style={styles.productInfoSection} elevation={1}>
          <Text variant="headlineSmall" style={styles.productName}>
            {product.name}
          </Text>
          
          <Text variant="bodyMedium" style={styles.productCode}>
            Product Code: {product.code}
          </Text>

          <View style={styles.priceContainer}>
            <Text variant="headlineMedium" style={styles.currentPrice}>
              ${product.price}
            </Text>
            {product.originalPrice && (
              <Text variant="titleMedium" style={styles.originalPrice}>
                ${product.originalPrice}
              </Text>
            )}
          </View>

          {product.rating && (
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <MaterialCommunityIcons
                    key={star}
                    name={star <= Math.floor(product.rating!) ? 'star' : 'star-outline'}
                    size={16}
                    color="#FFD700"
                  />
                ))}
              </View>
              <Text variant="bodyMedium" style={styles.ratingText}>
                {product.rating} ({product.reviews} reviews)
              </Text>
            </View>
          )}

          {product.description && (
            <>
              <Divider style={styles.divider} />
              <Text variant="titleSmall" style={styles.sectionTitle}>
                Description
              </Text>
              <Text variant="bodyMedium" style={styles.description}>
                {product.description}
              </Text>
            </>
          )}
        </Surface>
      </Animatable.View>

      {/* Size Selection */}
      {product.sizes && product.sizes.length > 0 && (
        <Animatable.View animation="fadeInUp" duration={600} delay={300}>
          <Surface style={styles.optionSection} elevation={1}>
            <Text variant="titleMedium" style={styles.optionTitle}>
              Select Size
            </Text>
            <View style={styles.optionChips}>
              {product.sizes.map((size) => (
                <Chip
                  key={size}
                  selected={selectedSize === size}
                  onPress={() => setSelectedSize(size)}
                  style={[
                    styles.optionChip,
                    selectedSize === size && styles.selectedChip,
                  ]}
                  textStyle={[
                    styles.optionChipText,
                    selectedSize === size && styles.selectedChipText,
                  ]}
                >
                  {size}
                </Chip>
              ))}
            </View>
          </Surface>
        </Animatable.View>
      )}

      {/* Color Selection */}
      {product.colors && product.colors.length > 0 && (
        <Animatable.View animation="fadeInUp" duration={600} delay={400}>
          <Surface style={styles.optionSection} elevation={1}>
            <Text variant="titleMedium" style={styles.optionTitle}>
              Select Color
            </Text>
            <View style={styles.optionChips}>
              {product.colors.map((color) => (
                <Chip
                  key={color}
                  selected={selectedColor === color}
                  onPress={() => setSelectedColor(color)}
                  style={[
                    styles.optionChip,
                    selectedColor === color && styles.selectedChip,
                  ]}
                  textStyle={[
                    styles.optionChipText,
                    selectedColor === color && styles.selectedChipText,
                  ]}
                >
                  {color}
                </Chip>
              ))}
            </View>
          </Surface>
        </Animatable.View>
      )}

      {/* Quantity Selection */}
      <Animatable.View animation="fadeInUp" duration={600} delay={500}>
        <Surface style={styles.quantitySection} elevation={1}>
          <Text variant="titleMedium" style={styles.optionTitle}>
            Quantity
          </Text>
          <View style={styles.quantityContainer}>
            <IconButton
              icon="minus"
              size={24}
              onPress={() => adjustQuantity(-1)}
              disabled={quantity <= 1}
              style={styles.quantityButton}
            />
            <Surface style={styles.quantityDisplay} elevation={1}>
              <Text variant="titleMedium" style={styles.quantityText}>
                {quantity}
              </Text>
            </Surface>
            <IconButton
              icon="plus"
              size={24}
              onPress={() => adjustQuantity(1)}
              disabled={quantity >= 10}
              style={styles.quantityButton}
            />
          </View>
        </Surface>
      </Animatable.View>

      {/* Add to Cart Button */}
      <Animatable.View animation="fadeInUp" duration={600} delay={600}>
        <View style={styles.addToCartContainer}>
          <Button
            mode="contained"
            onPress={handleAddToCart}
            style={styles.addToCartButton}
            contentStyle={styles.addToCartButtonContent}
            labelStyle={styles.addToCartButtonLabel}
            icon="cart-plus"
          >
            Add to Cart - ${(product.price * quantity).toFixed(2)}
          </Button>
        </View>
      </Animatable.View>

      {/* AR FAB */}
      <FAB
        icon="augmented-reality"
        style={styles.arFab}
        onPress={() => setShowAR(true)}
        label="3D View"
        color={theme.colors.onPrimary}
      />

      {/* AR Product Viewer */}
      <ARProductViewer
        product={product}
        visible={showAR}
        onClose={() => setShowAR(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: theme.colors.surface,
  },
  productImage: {
    width: width,
    height: width * 1.2,
    resizeMode: 'cover',
  },
  imageIndicators: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  imageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  activeImageIndicator: {
    backgroundColor: theme.colors.onPrimary,
  },
  discountBadge: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: theme.colors.error,
  },
  discountText: {
    color: theme.colors.onError,
    fontWeight: '600',
  },
  productInfoSection: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  productName: {
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
  },
  productCode: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  currentPrice: {
    fontWeight: '700',
    color: theme.colors.primary,
    marginRight: spacing.md,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: theme.colors.onSurfaceVariant,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  ratingText: {
    color: theme.colors.onSurfaceVariant,
  },
  divider: {
    marginVertical: spacing.md,
  },
  sectionTitle: {
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
  },
  description: {
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  optionSection: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  optionTitle: {
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.md,
  },
  optionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionChip: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  selectedChip: {
    backgroundColor: theme.colors.primary,
  },
  optionChipText: {
    color: theme.colors.onSurfaceVariant,
  },
  selectedChipText: {
    color: theme.colors.onPrimary,
  },
  quantitySection: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButton: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  quantityDisplay: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: theme.colors.surface,
  },
  quantityText: {
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  addToCartContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  addToCartButton: {
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  addToCartButtonContent: {
    paddingVertical: spacing.md,
  },
  addToCartButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  arFab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.lg,
    backgroundColor: theme.colors.secondary,
  },
});