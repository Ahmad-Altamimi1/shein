import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  default: {
    regular: {
      fontFamily: 'System',
      fontWeight: '400' as const,
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '500' as const,
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300' as const,
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100' as const,
    },
  },
};

export const theme = {
  ...MD3LightTheme,
  fonts: configureFonts({ config: fontConfig }),
  colors: {
    ...MD3LightTheme.colors,
    primary: '#FF6B6B',
    primaryContainer: '#FFE8E8',
    secondary: '#4ECDC4',
    secondaryContainer: '#E8F9F8',
    tertiary: '#45B7D1',
    tertiaryContainer: '#E8F4F8',
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    background: '#FAFAFA',
    error: '#FF5252',
    errorContainer: '#FFEBEE',
    onPrimary: '#FFFFFF',
    onSecondary: '#FFFFFF',
    onSurface: '#1A1A1A',
    onBackground: '#1A1A1A',
    outline: '#E0E0E0',
    shadow: '#000000',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
  },
  h2: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 36,
  },
  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
  },
  h4: {
    fontSize: 20,
    fontWeight: '500' as const,
    lineHeight: 28,
  },
  body1: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  body2: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 10,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10.32,
    elevation: 15,
  },
};