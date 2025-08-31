import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Image,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  Surface,
  ActivityIndicator,
  IconButton,
  SegmentedButtons,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { FlatGrid } from 'react-native-super-grid';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useApp } from '../services/AppContext';
import { apiService } from '../services/api';
import { theme, spacing, borderRadius, shadows } from '../constants/theme';
import { Product, Recommendation, RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

type RecommendationsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function RecommendationsScreen() {
  const navigation = useNavigation<RecommendationsScreenNavigationProp>();
  const { state, addToCart } = useApp();
  
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { value: 'all', label: 'All' },
    { value: 'tops', label: 'Tops' },
    { value: 'bottoms', label: 'Bottoms' },
    { value: 'dresses', label: 'Dresses' },
    { value: 'accessories', label: 'Accessories' },
  ];

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setIsLoading(true);
    try {
      const recs = await apiService.getRecommendations(state.user?.id || 'guest');
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
    setRefreshing(false);
  };

  const handleShareProduct = async (product: Product) => {
    try {
      await Share.share({
        message: `Check out this amazing product from SHEIN: ${product.name} - Only $${product.price}! Use code: ${product.code}`,
        title: product.name,
        url: product.image,
      });
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  };

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCart({
        product,
        quantity: 1,
      });
      
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

  const filteredRecommendations = selectedCategory === 'all' 
    ? recommendations 
    : recommendations.filter(rec => 
        rec.product.category?.toLowerCase().includes(selectedCategory)
      );

  const renderRecommendationCard = ({ item }: { item: Recommendation }) => (
    <Animatable.View animation="fadeInUp" duration={600}>
      <Card style={styles.productCard} mode="elevated">
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductDetails', { product: item.product })}
          activeOpacity={0.8}
        >
          <View style={styles.productImageContainer}>
            <Image source={{ uri: item.product.image }} style={styles.productImage} />
            
            {/* Recommendation Reason */}
            <Surface style={styles.reasonBadge} elevation={2}>
              <Text variant="labelSmall" style={styles.reasonText}>
                {item.reason}
              </Text>
            </Surface>

            {/* Discount Badge */}
            {item.product.originalPrice && (
              <Chip style={styles.discountChip} textStyle={styles.discountText}>
                {Math.round(((item.product.originalPrice - item.product.price) / item.product.originalPrice) * 100)}% OFF
              </Chip>
            )}

            {/* Share Button */}
            <IconButton
              icon="share-variant"
              size={20}
              onPress={() => handleShareProduct(item.product)}
              style={styles.shareButton}
              iconColor={theme.colors.onSurface}
            />
          </View>
          
          <Card.Content style={styles.productContent}>
            <Text variant="bodyMedium" style={styles.productName} numberOfLines={2}>
              {item.product.name}
            </Text>
            
            <View style={styles.priceContainer}>
              <Text variant="titleMedium" style={styles.currentPrice}>
                ${item.product.price}
              </Text>
              {item.product.originalPrice && (
                <Text variant="bodySmall" style={styles.originalPrice}>
                  ${item.product.originalPrice}
                </Text>
              )}
            </View>
            
            {item.product.rating && (
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                <Text variant="bodySmall" style={styles.ratingText}>
                  {item.product.rating} ({item.product.reviews})
                </Text>
              </View>
            )}
          </Card.Content>
        </TouchableOpacity>
        
        <Card.Actions style={styles.cardActions}>
          <Button
            mode="contained"
            onPress={() => handleAddToCart(item.product)}
            style={styles.addToCartButton}
            contentStyle={styles.addToCartButtonContent}
            labelStyle={styles.addToCartButtonLabel}
            icon="cart-plus"
          >
            Add to Cart
          </Button>
        </Card.Actions>
      </Card>
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animatable.View animation="fadeInDown" duration={600}>
        <Surface style={styles.header} elevation={1}>
          <Text variant="titleLarge" style={styles.headerTitle}>
            Recommended for You
          </Text>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            Personalized product suggestions based on your preferences
          </Text>
        </Surface>
      </Animatable.View>

      {/* Category Filter */}
      <Animatable.View animation="fadeInUp" duration={600} delay={200}>
        <Surface style={styles.filterSection} elevation={1}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoryFilters}>
              {categories.map((category) => (
                <Chip
                  key={category.value}
                  selected={selectedCategory === category.value}
                  onPress={() => setSelectedCategory(category.value)}
                  style={[
                    styles.categoryChip,
                    selectedCategory === category.value && styles.selectedCategoryChip,
                  ]}
                  textStyle={[
                    styles.categoryChipText,
                    selectedCategory === category.value && styles.selectedCategoryChipText,
                  ]}
                >
                  {category.label}
                </Chip>
              ))}
            </View>
          </ScrollView>
        </Surface>
      </Animatable.View>

      {/* Products Grid */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text variant="bodyMedium" style={styles.loadingText}>
            Finding perfect products for you...
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Animatable.View animation="fadeInUp" duration={600} delay={400}>
            <FlatGrid
              itemDimension={width / 2 - spacing.lg * 1.5}
              data={filteredRecommendations}
              style={styles.productGrid}
              spacing={spacing.md}
              renderItem={renderRecommendationCard}
              scrollEnabled={false}
              staticDimension={width}
              maxItemsPerRow={2}
            />
          </Animatable.View>
        </ScrollView>
      )}

      {filteredRecommendations.length === 0 && !isLoading && (
        <View style={styles.emptyContainer}>
          <Animatable.View animation="fadeIn" duration={800}>
            <MaterialCommunityIcons 
              name="heart-outline" 
              size={80} 
              color={theme.colors.onSurfaceVariant} 
            />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              No recommendations
            </Text>
            <Text variant="bodyLarge" style={styles.emptySubtitle}>
              Start shopping to get personalized recommendations
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
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  filterSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  categoryFilters: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  categoryChip: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  selectedCategoryChip: {
    backgroundColor: theme.colors.primary,
  },
  categoryChipText: {
    color: theme.colors.onSurfaceVariant,
  },
  selectedCategoryChipText: {
    color: theme.colors.onPrimary,
  },
  scrollView: {
    flex: 1,
  },
  productGrid: {
    paddingHorizontal: spacing.lg,
  },
  productCard: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    ...shadows.small,
  },
  productImageContainer: {
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  reasonBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    backgroundColor: theme.colors.secondary,
  },
  reasonText: {
    color: theme.colors.onSecondary,
    fontWeight: '600',
    fontSize: 10,
  },
  discountChip: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: theme.colors.error,
  },
  discountText: {
    color: theme.colors.onError,
    fontSize: 10,
    fontWeight: '600',
  },
  shareButton: {
    position: 'absolute',
    bottom: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  productContent: {
    padding: spacing.md,
  },
  productName: {
    fontWeight: '500',
    marginBottom: spacing.sm,
    color: theme.colors.onSurface,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  currentPrice: {
    fontWeight: '600',
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
  cardActions: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  addToCartButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
  addToCartButtonContent: {
    paddingVertical: spacing.xs,
  },
  addToCartButtonLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: theme.colors.onSurfaceVariant,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
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
});