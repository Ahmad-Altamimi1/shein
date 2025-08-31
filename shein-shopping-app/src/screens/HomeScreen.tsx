import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  Image,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Chip,
  Surface,
  ActivityIndicator,
  Badge,
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { FlatGrid } from 'react-native-super-grid';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useApp } from '../services/AppContext';
import { theme, spacing, borderRadius, shadows } from '../constants/theme';
import { Product, RootStackParamList } from '../types';

const { width } = Dimensions.get('window');

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { state, loadFeaturedProducts, getCartItemCount } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFeaturedProducts();
    setRefreshing(false);
  };

  const renderProductCard = ({ item }: { item: Product }) => (
    <Animatable.View animation="fadeInUp" duration={600}>
      <Card style={styles.productCard} mode="elevated">
        <TouchableOpacity
          onPress={() => navigation.navigate('ProductDetails', { product: item })}
          activeOpacity={0.8}
        >
          <View style={styles.productImageContainer}>
            <Image source={{ uri: item.image }} style={styles.productImage} />
            {item.originalPrice && (
              <Chip style={styles.discountChip} textStyle={styles.discountText}>
                {Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}% OFF
              </Chip>
            )}
          </View>
          <Card.Content style={styles.productContent}>
            <Text variant="bodyMedium" style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            <View style={styles.priceContainer}>
              <Text variant="titleMedium" style={styles.currentPrice}>
                ${item.price}
              </Text>
              {item.originalPrice && (
                <Text variant="bodySmall" style={styles.originalPrice}>
                  ${item.originalPrice}
                </Text>
              )}
            </View>
            {item.rating && (
              <View style={styles.ratingContainer}>
                <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
                <Text variant="bodySmall" style={styles.ratingText}>
                  {item.rating} ({item.reviews})
                </Text>
              </View>
            )}
          </Card.Content>
        </TouchableOpacity>
      </Card>
    </Animatable.View>
  );

  const cartItemCount = getCartItemCount();

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header Section */}
      <LinearGradient
        colors={[theme.colors.primary, theme.colors.secondary]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animatable.View animation="fadeInDown" duration={800}>
          <View style={styles.headerContent}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons 
                name="shopping" 
                size={32} 
                color={theme.colors.onPrimary} 
              />
              <Text variant="headlineMedium" style={styles.appTitle}>
                SHEIN Helper
              </Text>
            </View>
            <View style={styles.cartBadgeContainer}>
              <TouchableOpacity onPress={() => navigation.navigate('Cart' as any)}>
                <MaterialCommunityIcons 
                  name="shopping-outline" 
                  size={28} 
                  color={theme.colors.onPrimary} 
                />
                {cartItemCount > 0 && (
                  <Badge style={styles.cartBadge} size={20}>
                    {cartItemCount}
                  </Badge>
                )}
              </TouchableOpacity>
            </View>
          </View>
          
          <Text variant="bodyLarge" style={styles.headerSubtitle}>
            Shop SHEIN products with ease
          </Text>
          
          <Button
            mode="contained"
            onPress={() => navigation.navigate('ProductCode')}
            style={styles.startOrderButton}
            contentStyle={styles.startOrderButtonContent}
            labelStyle={styles.startOrderButtonLabel}
            buttonColor={theme.colors.onPrimary}
            textColor={theme.colors.primary}
            icon="plus-circle"
          >
            Start New Order
          </Button>
        </Animatable.View>
      </LinearGradient>

      {/* Quick Actions */}
      <Animatable.View animation="fadeInUp" duration={600} delay={200}>
        <Surface style={styles.quickActionsContainer} elevation={1}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Quick Actions
          </Text>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('ProductCode')}
            >
              <MaterialCommunityIcons name="barcode-scan" size={24} color={theme.colors.primary} />
              <Text variant="bodySmall" style={styles.quickActionText}>
                Scan Code
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Recommendations')}
            >
              <MaterialCommunityIcons name="heart" size={24} color={theme.colors.secondary} />
              <Text variant="bodySmall" style={styles.quickActionText}>
                For You
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Orders' as any)}
            >
              <MaterialCommunityIcons name="truck-delivery" size={24} color={theme.colors.tertiary} />
              <Text variant="bodySmall" style={styles.quickActionText}>
                Track Orders
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>
      </Animatable.View>

      {/* Featured Products */}
      <Animatable.View animation="fadeInUp" duration={600} delay={400}>
        <View style={styles.featuredSection}>
          <View style={styles.sectionHeader}>
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Featured Products
            </Text>
            <TouchableOpacity>
              <Text variant="bodyMedium" style={styles.seeAllText}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          {state.isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary} />
              <Text variant="bodyMedium" style={styles.loadingText}>
                Loading products...
              </Text>
            </View>
          ) : (
            <FlatGrid
              itemDimension={width / 2 - spacing.lg * 1.5}
              data={state.featuredProducts}
              style={styles.productGrid}
              spacing={spacing.md}
              renderItem={renderProductCard}
              scrollEnabled={false}
            />
          )}
        </View>
      </Animatable.View>

      {/* Current Deals Section */}
      <Animatable.View animation="fadeInUp" duration={600} delay={600}>
        <Surface style={styles.dealsContainer} elevation={1}>
          <View style={styles.dealsHeader}>
            <MaterialCommunityIcons name="fire" size={24} color="#FF4444" />
            <Text variant="titleMedium" style={styles.dealsTitle}>
              Hot Deals Today
            </Text>
          </View>
          <Text variant="bodyMedium" style={styles.dealsDescription}>
            Up to 70% off on selected items. Limited time offer!
          </Text>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Recommendations')}
            style={styles.viewDealsButton}
            icon="arrow-right"
          >
            View Deals
          </Button>
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
  header: {
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appTitle: {
    color: theme.colors.onPrimary,
    fontWeight: '700',
    marginLeft: spacing.sm,
  },
  cartBadgeContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: theme.colors.error,
  },
  headerSubtitle: {
    color: theme.colors.onPrimary,
    opacity: 0.9,
    marginBottom: spacing.lg,
  },
  startOrderButton: {
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  startOrderButtonContent: {
    paddingVertical: spacing.sm,
  },
  startOrderButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionsContainer: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
  },
  quickActionButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  quickActionText: {
    marginTop: spacing.xs,
    color: theme.colors.onSurfaceVariant,
  },
  featuredSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontWeight: '600',
    color: theme.colors.onBackground,
  },
  seeAllText: {
    color: theme.colors.primary,
    fontWeight: '500',
  },
  productGrid: {
    flex: 1,
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
    height: 150,
    resizeMode: 'cover',
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
  productContent: {
    padding: spacing.sm,
  },
  productName: {
    fontWeight: '500',
    marginBottom: spacing.xs,
    color: theme.colors.onSurface,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
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
  loadingContainer: {
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.md,
    color: theme.colors.onSurfaceVariant,
  },
  dealsContainer: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
  },
  dealsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dealsTitle: {
    marginLeft: spacing.sm,
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  dealsDescription: {
    color: theme.colors.onSurfaceVariant,
    marginBottom: spacing.md,
  },
  viewDealsButton: {
    borderColor: theme.colors.primary,
  },
});