import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

// Screens
import HomeScreen from '../screens/HomeScreen';
import ProductCodeScreen from '../screens/ProductCodeScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';
import CartScreen from '../screens/CartScreen';
import OrderConfirmationScreen from '../screens/OrderConfirmationScreen';
import OrderTrackingScreen from '../screens/OrderTrackingScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import AccountScreen from '../screens/AccountScreen';
import OrdersScreen from '../screens/OrdersScreen';

import { RootStackParamList, TabParamList } from '../types';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function HomeTabs() {
  const theme = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Cart':
              iconName = focused ? 'shopping' : 'shopping-outline';
              break;
            case 'Orders':
              iconName = focused ? 'package-variant' : 'package-variant-closed';
              break;
            case 'Account':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <MaterialCommunityIcons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ title: 'Cart' }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrdersScreen}
        options={{ title: 'Orders' }}
      />
      <Tab.Screen 
        name="Account" 
        component={AccountScreen}
        options={{ title: 'Account' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const theme = useTheme();

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.surface,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.outline,
          },
          headerTintColor: theme.colors.onSurface,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
          },
          cardStyle: { backgroundColor: theme.colors.background },
        }}
      >
        <Stack.Screen 
          name="Main" 
          component={HomeTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ProductCode" 
          component={ProductCodeScreen}
          options={{ 
            title: 'Enter Product Code',
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen 
          name="ProductDetails" 
          component={ProductDetailsScreen}
          options={{ 
            title: 'Product Details',
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen 
          name="OrderConfirmation" 
          component={OrderConfirmationScreen}
          options={{ 
            title: 'Confirm Order',
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen 
          name="OrderTracking" 
          component={OrderTrackingScreen}
          options={{ 
            title: 'Track Order',
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen 
          name="Recommendations" 
          component={RecommendationsScreen}
          options={{ 
            title: 'Recommended for You',
            headerBackTitleVisible: false,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}