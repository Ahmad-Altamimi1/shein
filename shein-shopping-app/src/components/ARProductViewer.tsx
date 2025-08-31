import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Alert } from 'react-native';
import { Text, Button, Surface, IconButton } from 'react-native-paper';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Animatable from 'react-native-animatable';

import { theme, spacing, borderRadius } from '../constants/theme';
import { Product } from '../types';

const { width, height } = Dimensions.get('window');

interface ARProductViewerProps {
  product: Product;
  visible: boolean;
  onClose: () => void;
}

export default function ARProductViewer({ product, visible, onClose }: ARProductViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!visible) {
      cleanup();
    }
  }, [visible]);

  const cleanup = () => {
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    if (sceneRef.current) {
      // Dispose of scene objects
      sceneRef.current.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      sceneRef.current = null;
    }
    cameraRef.current = null;
  };

  const onContextCreate = async (gl: any) => {
    try {
      setIsLoading(true);
      setError(null);

      // Create renderer
      const renderer = new Renderer({ gl });
      renderer.setSize(width, height * 0.7);
      renderer.setClearColor(0xffffff, 0);
      rendererRef.current = renderer;

      // Create scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Create camera
      const camera = new THREE.PerspectiveCamera(75, width / (height * 0.7), 0.1, 1000);
      camera.position.set(0, 0, 5);
      cameraRef.current = camera;

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      scene.add(directionalLight);

      // Create a simple 3D representation of the product
      // In a real app, you would load actual 3D models
      const geometry = createProductGeometry(product.category);
      const material = new THREE.MeshPhongMaterial({ 
        color: getProductColor(product.colors?.[0] || 'white'),
        shininess: 30,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Add rotation animation
      let rotation = 0;
      const animate = () => {
        requestAnimationFrame(animate);
        
        rotation += 0.01;
        mesh.rotation.y = rotation;
        mesh.rotation.x = Math.sin(rotation) * 0.1;
        
        renderer.render(scene, camera);
        gl.endFrameEXP();
      };

      setIsLoading(false);
      animate();

    } catch (err) {
      console.error('Error creating 3D scene:', err);
      setError('Failed to load 3D view');
      setIsLoading(false);
    }
  };

  const createProductGeometry = (category?: string): THREE.BufferGeometry => {
    switch (category?.toLowerCase()) {
      case 'tops':
      case 'shirts':
        // Create a simple shirt-like shape
        return new THREE.CylinderGeometry(0.8, 1.2, 2, 8);
      
      case 'bottoms':
      case 'jeans':
        // Create pants-like shape
        return new THREE.CylinderGeometry(0.6, 0.8, 2.5, 8);
      
      case 'dresses':
        // Create dress-like shape
        return new THREE.ConeGeometry(1.5, 3, 8);
      
      case 'shoes':
        // Create shoe-like shape
        return new THREE.BoxGeometry(2, 0.5, 3);
      
      case 'accessories':
        // Create accessory-like shape
        return new THREE.SphereGeometry(0.8, 16, 16);
      
      default:
        // Default box shape
        return new THREE.BoxGeometry(1.5, 2, 0.5);
    }
  };

  const getProductColor = (colorName: string): number => {
    const colorMap: { [key: string]: number } = {
      'white': 0xffffff,
      'black': 0x333333,
      'red': 0xff4444,
      'blue': 0x4444ff,
      'green': 0x44ff44,
      'yellow': 0xffff44,
      'pink': 0xff44ff,
      'purple': 0x8844ff,
      'orange': 0xff8844,
      'navy': 0x000080,
      'brown': 0x8b4513,
      'gray': 0x808080,
      'grey': 0x808080,
    };

    const normalizedColor = colorName.toLowerCase().split(' ')[0];
    return colorMap[normalizedColor] || 0x888888;
  };

  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animatable.View animation="slideInUp" duration={500} style={styles.modal}>
        {/* Header */}
        <Surface style={styles.header} elevation={2}>
          <View style={styles.headerContent}>
            <Text variant="titleLarge" style={styles.headerTitle}>
              3D Product View
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={onClose}
              style={styles.closeButton}
            />
          </View>
          <Text variant="bodyMedium" style={styles.headerSubtitle}>
            {product.name}
          </Text>
        </Surface>

        {/* 3D Viewer */}
        <View style={styles.viewerContainer}>
          {isLoading && (
            <View style={styles.loadingOverlay}>
              <Text variant="bodyMedium" style={styles.loadingText}>
                Loading 3D view...
              </Text>
            </View>
          )}

          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons 
                name="alert-circle" 
                size={48} 
                color={theme.colors.error} 
              />
              <Text variant="bodyLarge" style={styles.errorText}>
                {error}
              </Text>
              <Button
                mode="outlined"
                onPress={() => {
                  setError(null);
                  setIsLoading(true);
                }}
                style={styles.retryButton}
              >
                Retry
              </Button>
            </View>
          ) : (
            <GLView
              style={styles.glView}
              onContextCreate={onContextCreate}
            />
          )}
        </View>

        {/* Controls */}
        <Surface style={styles.controls} elevation={1}>
          <Text variant="bodySmall" style={styles.controlsText}>
            Rotate and zoom to explore the product in 3D
          </Text>
          
          <View style={styles.controlButtons}>
            <Button
              mode="outlined"
              onPress={onClose}
              style={styles.controlButton}
              icon="arrow-left"
            >
              Back to Product
            </Button>
            
            <Button
              mode="contained"
              onPress={() => {
                // In a real app, this could open a more detailed AR view
                Alert.alert(
                  'AR Feature',
                  'Full AR experience coming soon! This will allow you to place the product in your real environment.',
                  [{ text: 'OK' }]
                );
              }}
              style={styles.controlButton}
              icon="augmented-reality"
            >
              Full AR
            </Button>
          </View>
        </Surface>
      </Animatable.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    zIndex: 1000,
  },
  modal: {
    flex: 1,
    backgroundColor: theme.colors.background,
    marginTop: 50,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  header: {
    padding: spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontWeight: '600',
    color: theme.colors.onSurface,
  },
  closeButton: {
    backgroundColor: theme.colors.surfaceVariant,
  },
  headerSubtitle: {
    color: theme.colors.onSurfaceVariant,
  },
  viewerContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  glView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    zIndex: 10,
  },
  loadingText: {
    color: theme.colors.onSurface,
    marginTop: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  retryButton: {
    borderColor: theme.colors.primary,
  },
  controls: {
    padding: spacing.lg,
    backgroundColor: theme.colors.surface,
  },
  controlsText: {
    color: theme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  controlButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  controlButton: {
    flex: 1,
    borderRadius: borderRadius.md,
  },
});