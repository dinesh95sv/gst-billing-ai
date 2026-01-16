import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ChevronLeft, User, MapPin, Smartphone, Mail, FileText, Save, CheckCircle2 } from 'lucide-react-native';
import { StorageService } from '../services/storage';
import { Customer } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './CustomerForm.scss';

const CustomerForm: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    gstin: '',
    address: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const loadData = async () => {
    if (isEditMode && id) {
      setLoading(true);
      try {
        const existing = await StorageService.getCustomerById(id);
        if (existing) {
          setFormData(existing);
        }
      } catch (e) {
        console.error("Failed to load customer", e);
        Alert.alert("Error", "Failed to load customer data");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!formData.name) {
      Alert.alert("Error", "Please enter Customer Name.");
      return;
    }

    setLoading(true);
    try {
      const customerData: Customer = {
        id: formData.id || Date.now().toString(),
        name: formData.name || '',
        gstin: formData.gstin || '',
        address: formData.address || '',
        phone: formData.phone || '',
        email: formData.email || '',
        contactPerson: formData.contactPerson || '',
        isActive: formData.isActive ?? true,
        logoUrl: formData.logoUrl || `https://picsum.photos/seed/${formData.id || Date.now()}/100/100`
      };

      await StorageService.saveCustomer(customerData);
      router.back();
    } catch (e) {
      console.error("Failed to save customer", e);
      Alert.alert("Error", "Failed to save customer");
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={styles.sectionTitle}>{label}</Text>
    </View>
  );

  if (loading && isEditMode && !formData.id) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/customers')} style={styles.backButton}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Customer' : 'New Customer'}</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

          {/* Basic Info */}
          <SectionHeader icon={<User size={18} color="#3b82f6" />} label="Basic Information" />

          <View style={styles.formGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Business Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter customer or business name"
                placeholderTextColor="#4b5563"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>GSTIN (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 29ABCDE1234F1Z5"
                placeholderTextColor="#4b5563"
                value={formData.gstin}
                onChangeText={(text) => setFormData({ ...formData, gstin: text.toUpperCase() })}
                autoCapitalize="characters"
              />
              {formData.gstin?.length === 15 && (
                <View style={styles.verifiedBadge}>
                  <Text style={styles.verifiedText}>VALID FORMAT</Text>
                </View>
              )}
            </View>
          </View>

          {/* Contact Details */}
          <SectionHeader icon={<Smartphone size={18} color="#3b82f6" />} label="Contact Details" />

          <View style={styles.formGroup}>
            <View style={[styles.row, { display: 'flex' }]}>
              <View style={styles.column}>
                <Text style={styles.label}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  placeholderTextColor="#4b5563"
                  value={formData.phone}
                  onChangeText={(text) => setFormData({ ...formData, phone: text })}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="billing@company.com"
                placeholderTextColor="#4b5563"
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Address */}
          <SectionHeader icon={<MapPin size={18} color="#3b82f6" />} label="Billing Address" />

          <View style={styles.formGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Complete Address</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Enter complete office or factory address"
                placeholderTextColor="#4b5563"
                value={formData.address}
                onChangeText={(text) => setFormData({ ...formData, address: text })}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Save size={20} color="#fff" />
            <Text style={styles.saveButtonText}>{isEditMode ? 'Update Customer' : 'Save Customer'}</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>GST Billing AI • Secure Customer Data</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CustomerForm;
