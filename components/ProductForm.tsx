import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, KeyboardAvoidingView, Platform, Alert, Dimensions } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ChevronLeft, HelpCircle, Save, RotateCcw, ChevronRight } from 'lucide-react-native';
import { StorageService } from '../services/storage';
import { Product } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './ProductForm.scss';
import GstDropdown from './GstDropdown';

const ProductForm: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditMode = !!id;

  const initialFormState: Partial<Product> = {
    name: '',
    hsnCode: '',
    price: 0,
    gstRate: 0,
    isInclusive: false
  };

  const [formData, setFormData] = useState<Partial<Product>>(initialFormState);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadProduct();
    }, [id, isEditMode])
  );

  const loadProduct = async () => {
    if (isEditMode && id) {
      setLoading(true);
      try {
        const existingProduct = await StorageService.getProductById(id);
        if (existingProduct) {
          setFormData(existingProduct);
        }
      } catch (e) {
        console.error("Failed to load product", e);
      } finally {
        setLoading(false);
      }
    } else {
      setFormData(initialFormState);
    }
  };

  const handleReset = () => {
    setFormData(initialFormState);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.hsnCode || formData.price === undefined) {
      Alert.alert("Error", "Please fill in Product Name, HSN Code and Price.");
      return;
    }

    const productData: Product = {
      id: formData.id || Date.now().toString(),
      name: formData.name || '',
      hsnCode: formData.hsnCode || '',
      price: formData.price || 0,
      gstRate: formData.gstRate || 0,
      isInclusive: formData.isInclusive || false,
    };

    await StorageService.saveProduct(productData);
    router.replace('/products');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/products')} style={styles.backButton}>
          <ChevronLeft size={24} color="#3b82f6" />
          <Text style={styles.backButtonText}>Products</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit Product' : 'Add New Product'}
        </Text>
        <TouchableOpacity>
          <HelpCircle size={24} color="#3b82f6" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Basic Information Section */}
          <Text style={styles.sectionLabel}>Basic Information</Text>

          <View style={styles.formGroup}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Product Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Industrial Steel Pipe"
                placeholderTextColor="#374151"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>HSN Code</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter 4 or 8 digit HSN"
                placeholderTextColor="#374151"
                value={formData.hsnCode}
                onChangeText={(text) => setFormData({ ...formData, hsnCode: text })}
              />
            </View>
          </View>

          {/* Pricing & Taxation Section */}
          <Text style={styles.sectionLabel}>Pricing & Taxation</Text>

          <View style={styles.row}>
            <View style={styles.column}>
              <Text style={styles.label}>Unit Price</Text>
              <View style={{ position: 'relative', justifyContent: 'center' }}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  keyboardType="numeric"
                  style={[styles.input, styles.inputWithIcon]}
                  placeholder="0.00"
                  placeholderTextColor="#374151"
                  value={formData.price?.toString()}
                  onChangeText={(text) => setFormData({ ...formData, price: parseFloat(text) || 0 })}
                />
              </View>
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>GST %</Text>
              <View style={styles.gstRatesContainer}>
                <GstDropdown
                  label=""
                  value={formData.gstRate || 0}
                  onChange={(rate) => setFormData({ ...formData, gstRate: rate })}
                />
              </View>
            </View>
          </View>

          {/* Inclusive GST Card */}
          <View style={styles.inclusiveCard}>
            <View style={styles.inclusiveTextContainer}>
              <Text style={styles.inclusiveTitle}>Inclusive of GST</Text>
              <Text style={styles.inclusiveSubtitle}>Tax is already included in the unit price</Text>
            </View>

            <Switch
              trackColor={{ false: "#2a3441", true: "#3b82f6" }}
              thumbColor={formData.isInclusive ? "#ffffff" : "#f4f3f4"}
              onValueChange={() => setFormData({ ...formData, isInclusive: !formData.isInclusive })}
              value={formData.isInclusive}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Action Bar */}
      <View style={styles.footer}>
        <TouchableOpacity
          onPress={handleReset}
          style={styles.resetButton}
        >
          <RotateCcw size={22} color="#9ca3af" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
        >
          <Save size={22} color="#fff" />
          <Text style={styles.saveButtonText}>Save Product</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default ProductForm;
