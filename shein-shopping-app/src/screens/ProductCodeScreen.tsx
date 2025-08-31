import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Surface,
  ActivityIndicator,
  Chip,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as Haptics from 'expo-haptics';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useApp } from '../services/AppContext';
import { theme, spacing, borderRadius, shadows } from '../constants/theme';
import { Product, RootStackParamList } from '../types';

type ProductCodeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function ProductCodeScreen() {
  const navigation = useNavigation<ProductCodeScreenNavigationProp>();
  const { searchProduct, addToCart, state } = useApp();
  
  const [productCode, setProductCode] = useState('');
  const [foundProduct, setFoundProduct] = useState<Product | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  
  const inputRef = useRef<any>(null);

  const requestCameraPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
    return status === 'granted';
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setShowScanner(false);
    setProductCode(data);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    handleSearchProduct(data);
  };

  const handleSearchProduct = async (code?: string) => {
    const searchCode = code || productCode.trim();
    
    if (!searchCode) {
      Alert.alert('Error', 'Please enter a product code');
      return;
    }

    setIsSearching(true);
    setFoundProduct(null);
    
    try {
      const product = await searchProduct(searchCode);
      
      if (product) {
        setFoundProduct(product);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        Alert.alert(
          'Product Not Found',
          'The product code you entered was not found. Please check the code and try again.',
          [{ text: 'OK' }]
        );
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to search for product. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToCart = async () => {
    if (!foundProduct) return;

    // Check if product has size/color options and none selected
    if (foundProduct.sizes && foundProduct.sizes.length > 0 && !selectedSize) {
      Alert.alert('Select Size', 'Please select a size before adding to cart');
      return;
    }

    if (foundProduct.colors && foundProduct.colors.length > 0 && !selectedColor) {
      Alert.alert('Select Color', 'Please select a color before adding to cart');
      return;
    }

    try {
      await addToCart({
        product: foundProduct,
        quantity: 1,
        selectedSize: selectedSize || undefined,
        selectedColor: selectedColor || undefined,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Added to Cart',
        `${foundProduct.name} has been added to your cart`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('Cart' as any) },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  const handleAddAnother = () => {
    setProductCode('');
    setFoundProduct(null);
    setSelectedSize('');
    setSelectedColor('');
    inputRef.current?.focus();
  };

  const openScanner = async () => {
    if (hasPermission === null) {
      const granted = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Camera Permission', 'Camera permission is required to scan barcodes');
        return;
      }
    } else if (hasPermission === false) {
      Alert.alert('Camera Permission', 'Camera permission is required to scan barcodes');
      return;
    }
    
    setShowScanner(true);
  };

  if (showScanner) {
    return (
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={handleBarCodeScanned}
          style={styles.scanner}
        />
        <View style={styles.scannerOverlay}>
          <Text variant="titleMedium" style={styles.scannerText}>
            Scan product barcode
          </Text>
          <Button
            mode="contained"
            onPress={() => setShowScanner(false)}
            style={styles.closeScannerButton}
          >
            Close Scanner
          </Button>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled">
        {/* Input Section */}
        <Animatable.View animation="fadeInDown" duration={600}>
          <Surface style={styles.inputSection} elevation={2}>
            <Text variant="titleLarge" style={styles.inputTitle}>
              Enter Product Code
            </Text>
            <Text variant="bodyMedium" style={styles.inputSubtitle}>
              Enter the SHEIN product code to find and add items to your cart
            </Text>
            
            <View style={styles.inputContainer}>
              <TextInput
                ref={inputRef}
                mode="outlined"
                label="Product Code"
                value={productCode}
                onChangeText={setProductCode}
                placeholder="e.g., SW2301001"
                style={styles.textInput}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="search"
                onSubmitEditing={() => handleSearchProduct()}
                disabled={isSearching}
                right={
                  <TextInput.Icon
                    icon="barcode-scan"
                    onPress={openScanner}
                    disabled={isSearching}
                  />
                }
              />
              
              <Button
                mode="contained"
                onPress={() => handleSearchProduct()}
                loading={isSearching}
                disabled={isSearching || !productCode.trim()}
                style={styles.searchButton}
                contentStyle={styles.searchButtonContent}
                icon="magnify"
              >
                {isSearching ? 'Searching...' : 'Search Product'}
              </Button>
            </View>
          </Surface>
        </Animatable.View>

        {/* Product Result */}
        {foundProduct && (
          <Animatable.View animation="fadeInUp" duration={600}>
            <Card style={styles.productCard} mode="elevated">
              <View style={styles.productHeader}>
                <Image source={{ uri: foundProduct.image }} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <Text variant="titleMedium" style={styles.productName}>
                    {foundProduct.name}
                  </Text>
                  <Text variant="bodySmall" style={styles.productCode}>
                    Code: {foundProduct.code}
                  </Text>
                  <View style={styles.priceContainer}>
                    <Text variant="titleLarge" style={styles.currentPrice}>
                      ${foundProduct.price}
                    </Text>
                    {foundProduct.originalPrice && (
                      <Text variant="bodyMedium" style={styles.originalPrice}>
                        ${foundProduct.originalPrice}
                      </Text>
                    )}
                  </View>
                  {foundProduct.rating && (
                    <View style={styles.ratingContainer}>
                      <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                      <Text variant="bodySmall" style={styles.ratingText}>
                        {foundProduct.rating} ({foundProduct.reviews} reviews)
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Size Selection */}
              {foundProduct.sizes && foundProduct.sizes.length > 0 && (
                <View style={styles.optionSection}>
                  <Text variant="titleSmall" style={styles.optionTitle}>
                    Size
                  </Text>
                  <View style={styles.optionChips}>
                    {foundProduct.sizes.map((size) => (
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
                </View>
              )}

              {/* Color Selection */}
              {foundProduct.colors && foundProduct.colors.length > 0 && (
                <View style={styles.optionSection}>
                  <Text variant="titleSmall" style={styles.optionTitle}>
                    Color
                  </Text>
                  <View style={styles.optionChips}>
                    {foundProduct.colors.map((color) => (
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
                </View>
              )}

              {/* Action Buttons */}
              <Card.Actions style={styles.actionButtons}>
                <Button
                  mode="outlined"
                  onPress={handleAddAnother}
                  style={styles.secondaryButton}
                  icon="plus"
                >
                  Add Another
                </Button>
                <Button
                  mode="contained"
                  onPress={handleAddToCart}
                  style={styles.primaryButton}
                  icon="cart-plus"
                >
                  Add to Cart
                </Button>
              </Card.Actions>
            </Card>
          </Animatable.View>
        )}

        {/* Help Section */}
        <Animatable.View animation="fadeInUp" duration={600} delay={200}>
          <Surface style={styles.helpSection} elevation={1}>
            <View style={styles.helpHeader}>
              <MaterialCommunityIcons 
                name="help-circle" 
                size={24} 
                color={theme.colors.primary} 
              />
              <Text variant="titleMedium" style={styles.helpTitle}>
                How to find product codes
              </Text>
            </View>
            <Text variant="bodyMedium" style={styles.helpText}>
              • Look for the product code on the SHEIN product page{'\n'}
              • Check the product URL for the code{'\n'}
              • Use the barcode scanner for physical products{'\n'}
              • Ask customer service for the specific code
            </Text>
          </Surface>
        </Animatable.View>
      </ScrollView>
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
  inputSection: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  inputTitle: {
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
  },
  inputSubtitle: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    gap: spacing.md,
  },
  textInput: {
    backgroundColor: theme.colors.surface,
  },
  searchButton: {
    borderRadius: borderRadius.md,
  },
  searchButtonContent: {
    paddingVertical: spacing.sm,
  },
  productCard: {
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  productHeader: {
    flexDirection: 'row',
    padding: spacing.lg,
  },
  productImage: {
    width: 100,
    height: 120,
    borderRadius: borderRadius.md,
    marginRight: spacing.md,
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.xs,
  },
  productCode: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.sm,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  currentPrice: {
    fontWeight: '700',
    color: theme.colors.primary,
    marginRight: spacing.sm,
  },
  originalPrice: {
    textDecorationLine: 'line-through',
    color: theme.colors.onSurfaceVariant,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: spacing.xs,
    color: theme.colors.onSurfaceVariant,
  },
  optionSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  optionTitle: {
    fontWeight: '600',
    color: theme.colors.onSurface,
    marginBottom: spacing.sm,
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
  actionButtons: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  secondaryButton: {
    flex: 0.45,
    borderColor: theme.colors.primary,
  },
  primaryButton: {
    flex: 0.45,
  },
  helpSection: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  helpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  helpTitle: {
    marginLeft: spacing.sm,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  helpText: {
    color: theme.colors.onSurfaceVariant,
    lineHeight: 20,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  scanner: {
    flex: 1,
  },
  scannerOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
    padding: spacing.lg,
  },
  scannerText: {
    color: 'white',
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  closeScannerButton: {
    backgroundColor: theme.colors.primary,
  },
});