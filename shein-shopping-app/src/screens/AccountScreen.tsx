import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Card,
  Surface,
  Avatar,
  Button,
  Switch,
  Divider,
  IconButton,
  ProgressBar,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { useApp } from '../services/AppContext';
import { theme, spacing, borderRadius, shadows } from '../constants/theme';
import { RootStackParamList } from '../types';

type AccountScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function AccountScreen() {
  const navigation = useNavigation<AccountScreenNavigationProp>();
  const { state, clearCart } = useApp();
  
  const [notificationSettings, setNotificationSettings] = useState({
    orderUpdates: true,
    promotions: true,
    recommendations: true,
  });

  // Mock user data
  const user = state.user || {
    id: 'guest',
    email: 'user@example.com',
    displayName: 'John Doe',
    photoURL: undefined,
    addresses: [],
    preferences: {
      notifications: notificationSettings,
      language: 'en',
      currency: 'USD',
    },
    loyaltyPoints: 150,
    createdAt: new Date(),
  };

  const loyaltyProgress = (user.loyaltyPoints % 500) / 500; // 500 points per tier
  const currentTier = Math.floor(user.loyaltyPoints / 500) + 1;
  const pointsToNextTier = 500 - (user.loyaltyPoints % 500);

  const menuItems = [
    {
      icon: 'account-edit',
      title: 'Edit Profile',
      subtitle: 'Update your personal information',
      onPress: () => Alert.alert('Coming Soon', 'Profile editing will be available soon'),
    },
    {
      icon: 'map-marker',
      title: 'Shipping Addresses',
      subtitle: `${user.addresses.length} saved addresses`,
      onPress: () => Alert.alert('Coming Soon', 'Address management will be available soon'),
    },
    {
      icon: 'credit-card',
      title: 'Payment Methods',
      subtitle: 'Manage your payment options',
      onPress: () => Alert.alert('Coming Soon', 'Payment management will be available soon'),
    },
    {
      icon: 'bell',
      title: 'Notifications',
      subtitle: 'Manage notification preferences',
      onPress: () => {},
      showNotificationSettings: true,
    },
    {
      icon: 'help-circle',
      title: 'Help & Support',
      subtitle: 'Get help with your orders',
      onPress: () => Alert.alert('Support', 'Contact us at support@sheinhelper.com'),
    },
    {
      icon: 'information',
      title: 'About',
      subtitle: 'App version and information',
      onPress: () => Alert.alert('SHEIN Helper v1.0.0', 'Your trusted SHEIN shopping companion'),
    },
  ];

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await clearCart();
            // In production, implement actual sign out logic
            Alert.alert('Signed Out', 'You have been signed out successfully');
          },
        },
      ]
    );
  };

  const updateNotificationSetting = (setting: keyof typeof notificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [setting]: value }));
    // In production, save to backend
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <Animatable.View animation="fadeInDown" duration={600}>
        <Surface style={styles.profileHeader} elevation={1}>
          <View style={styles.profileInfo}>
            <Avatar.Text 
              size={60} 
              label={user.displayName.split(' ').map(n => n[0]).join('')}
              style={styles.avatar}
            />
            <View style={styles.userInfo}>
              <Text variant="titleLarge" style={styles.userName}>
                {user.displayName}
              </Text>
              <Text variant="bodyMedium" style={styles.userEmail}>
                {user.email}
              </Text>
            </View>
          </View>
          
          <IconButton
            icon="account-edit"
            size={24}
            onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon')}
            style={styles.editButton}
          />
        </Surface>
      </Animatable.View>

      {/* Loyalty Points */}
      <Animatable.View animation="fadeInUp" duration={600} delay={200}>
        <Surface style={styles.loyaltySection} elevation={1}>
          <View style={styles.loyaltyHeader}>
            <MaterialCommunityIcons 
              name="star-circle" 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text variant="titleMedium" style={styles.loyaltyTitle}>
              Loyalty Rewards
            </Text>
          </View>
          
          <View style={styles.loyaltyContent}>
            <Text variant="headlineMedium" style={styles.pointsCount}>
              {user.loyaltyPoints}
            </Text>
            <Text variant="bodyMedium" style={styles.pointsLabel}>
              Points
            </Text>
          </View>
          
          <View style={styles.tierProgress}>
            <View style={styles.tierInfo}>
              <Text variant="bodySmall" style={styles.tierText}>
                Tier {currentTier}
              </Text>
              <Text variant="bodySmall" style={styles.tierText}>
                {pointsToNextTier} points to next tier
              </Text>
            </View>
            <ProgressBar 
              progress={loyaltyProgress} 
              color={theme.colors.primary}
              style={styles.tierProgressBar}
            />
          </View>
        </Surface>
      </Animatable.View>

      {/* Menu Items */}
      <Animatable.View animation="fadeInUp" duration={600} delay={400}>
        <Surface style={styles.menuSection} elevation={1}>
          {menuItems.map((item, index) => (
            <View key={item.title}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={24}
                    color={theme.colors.primary}
                    style={styles.menuIcon}
                  />
                  <View style={styles.menuText}>
                    <Text variant="bodyLarge" style={styles.menuTitle}>
                      {item.title}
                    </Text>
                    <Text variant="bodySmall" style={styles.menuSubtitle}>
                      {item.subtitle}
                    </Text>
                  </View>
                </View>
                
                {item.showNotificationSettings ? (
                  <View style={styles.notificationSettings}>
                    <View style={styles.notificationRow}>
                      <Text variant="bodySmall">Order Updates</Text>
                      <Switch
                        value={notificationSettings.orderUpdates}
                        onValueChange={(value) => updateNotificationSetting('orderUpdates', value)}
                        thumbColor={notificationSettings.orderUpdates ? theme.colors.primary : theme.colors.outline}
                      />
                    </View>
                    <View style={styles.notificationRow}>
                      <Text variant="bodySmall">Promotions</Text>
                      <Switch
                        value={notificationSettings.promotions}
                        onValueChange={(value) => updateNotificationSetting('promotions', value)}
                        thumbColor={notificationSettings.promotions ? theme.colors.primary : theme.colors.outline}
                      />
                    </View>
                    <View style={styles.notificationRow}>
                      <Text variant="bodySmall">Recommendations</Text>
                      <Switch
                        value={notificationSettings.recommendations}
                        onValueChange={(value) => updateNotificationSetting('recommendations', value)}
                        thumbColor={notificationSettings.recommendations ? theme.colors.primary : theme.colors.outline}
                      />
                    </View>
                  </View>
                ) : (
                  <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={theme.colors.onSurfaceVariant}
                  />
                )}
              </TouchableOpacity>
              
              {index < menuItems.length - 1 && <Divider style={styles.menuDivider} />}
            </View>
          ))}
        </Surface>
      </Animatable.View>

      {/* Sign Out Button */}
      <Animatable.View animation="fadeInUp" duration={600} delay={600}>
        <View style={styles.signOutContainer}>
          <Button
            mode="outlined"
            onPress={handleSignOut}
            style={styles.signOutButton}
            textColor={theme.colors.error}
            icon="logout"
          >
            Sign Out
          </Button>
        </View>
      </Animatable.View>

      {/* App Version */}
      <View style={styles.versionContainer}>
        <Text variant="bodySmall" style={styles.versionText}>
          SHEIN Helper v1.0.0
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  profileHeader: {
    margin: spacing.lg,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
    marginRight: spacing.md,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  userEmail: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  editButton: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  loyaltySection: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.primaryContainer,
  },
  loyaltyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  loyaltyTitle: {
    marginLeft: spacing.sm,
    fontWeight: '600',
    color: theme.colors.onPrimaryContainer,
  },
  loyaltyContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.md,
  },
  pointsCount: {
    fontWeight: '700',
    color: theme.colors.onPrimaryContainer,
    marginRight: spacing.sm,
  },
  pointsLabel: {
    color: theme.colors.onPrimaryContainer,
  },
  tierProgress: {
    gap: spacing.sm,
  },
  tierInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tierText: {
    color: theme.colors.onPrimaryContainer,
    fontWeight: '500',
  },
  tierProgressBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  menuSection: {
    margin: spacing.lg,
    marginTop: 0,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.colors.surface,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    marginRight: spacing.md,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontWeight: '500',
    color: theme.colors.onSurface,
  },
  menuSubtitle: {
    color: theme.colors.onSurfaceVariant,
    marginTop: spacing.xs,
  },
  menuDivider: {
    marginLeft: spacing.lg + 24 + spacing.md,
  },
  notificationSettings: {
    gap: spacing.sm,
    minWidth: 150,
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signOutContainer: {
    padding: spacing.lg,
  },
  signOutButton: {
    borderColor: theme.colors.error,
    borderRadius: borderRadius.lg,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  versionText: {
    color: theme.colors.onSurfaceVariant,
  },
});