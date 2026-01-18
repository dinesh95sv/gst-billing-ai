import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ChevronLeft, User, MapPin, Smartphone, Mail, Save, Plus, Trash2, Check } from 'lucide-react-native';
import { StorageService } from '../services/storage';
import { Customer, ShippingAddress } from '../types';
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
    email: '',
    contactPerson: '',
    isActive: true,
    shippingAddresses: []
  });
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const initialFormState: Partial<Customer> = {
    name: '',
    gstin: '',
    address: '',
    phone: '',
    email: '',
    contactPerson: '',
    isActive: true,
    shippingAddresses: []
  };

  const loadData = async () => {
    if (isEditMode && id) {
      setLoading(true);
      try {
        const existing = await StorageService.getCustomerById(id);
        if (existing) {
          setFormData({
            ...existing,
            shippingAddresses: existing.shippingAddresses || []
          });
        }
      } catch (e) {
        console.error("Failed to load customer", e);
        Alert.alert("Error", "Failed to load customer data");
      } finally {
        setLoading(false);
      }
    } else {
      setFormData(initialFormState);
    }
  };

  const handleAddShippingAddress = () => {
    const newAddress: ShippingAddress = {
      id: Date.now().toString(),
      name: '',
      address: '',
      isSameAsBilling: false,
    };
    setFormData({
      ...formData,
      shippingAddresses: [...(formData.shippingAddresses || []), newAddress]
    });
  };

  const handleRemoveShippingAddress = (index: number) => {
    const addresses = [...(formData.shippingAddresses || [])];
    addresses.splice(index, 1);
    setFormData({ ...formData, shippingAddresses: addresses });
  };

  const handleUpdateShippingAddress = (index: number, field: keyof ShippingAddress, value: any) => {
    const addresses = [...(formData.shippingAddresses || [])];
    if (field === 'isSameAsBilling') {
      if (value === true) {
        // Uncheck other same as billing
        addresses.forEach((addr, i) => {
          addr.isSameAsBilling = i === index;
          if (i === index) addr.address = formData.address || '';
        });
      } else {
        // Clear address if unchecking "Same as Billing"
        addresses[index] = { ...addresses[index], isSameAsBilling: false, address: '' };
      }
    } else {
      addresses[index] = { ...addresses[index], [field]: value };
    }
    setFormData({ ...formData, shippingAddresses: addresses });
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
        logoUrl: formData.logoUrl || `https://picsum.photos/seed/${formData.id || Date.now()}/100/100`,
        shippingAddresses: formData.shippingAddresses || []
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
            </View>
          </View>

          {/* Contact Details */}
          <SectionHeader icon={<Smartphone size={18} color="#3b82f6" />} label="Contact Details" />

          <View style={styles.formGroup}>
            <View style={styles.inputWrapper}>
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

          {/* Billing Address */}
          <SectionHeader icon={<MapPin size={18} color="#3b82f6" />} label="Billing Address" />

          <View style={styles.formGroup}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Complete Address</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                placeholder="Enter billing address"
                placeholderTextColor="#4b5563"
                value={formData.address}
                onChangeText={(text) => {
                  setFormData({ ...formData, address: text });
                  // Sync if "Same as Billing" is checked
                  const addresses = [...(formData.shippingAddresses || [])];
                  addresses.forEach(addr => {
                    if (addr.isSameAsBilling) addr.address = text;
                  });
                  setFormData(prev => ({ ...prev, address: text, shippingAddresses: addresses }));
                }}
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Shipping Addresses */}
          <SectionHeader icon={<MapPin size={18} color="#3b82f6" />} label="Shipping Addresses" />

          {formData.shippingAddresses?.map((addr, index) => (
            <View key={addr.id} style={styles.addressItem}>
              <View style={styles.addressHeader}>
                <TextInput
                  style={[styles.addressName, { flex: 1 }]}
                  placeholder="Address Name (e.g. Warehouse 1)"
                  placeholderTextColor="#4b5563"
                  value={addr.name}
                  onChangeText={(text) => handleUpdateShippingAddress(index, 'name', text)}
                />
                <TouchableOpacity onPress={() => handleRemoveShippingAddress(index)} style={styles.removeButton}>
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>

              {/* Show checkbox only for the first address or let user toggle any but ensure singleton */}
              {/* Requirement: Only once User can check 'Same as Billing Address' and remaining Shipping addresses do not show the Checkbox. */}
              {/* Interpretation: If one is already checked, others don't show it? Or only one can be checked at a time. */}
              {/* "remaining Shipping addresses do not show the Checkbox" suggests only one address CAN have this state. */}
              {(!formData.shippingAddresses?.some((a, i) => a.isSameAsBilling && i !== index)) && (
                <TouchableOpacity
                  style={styles.checkboxContainer}
                  onPress={() => handleUpdateShippingAddress(index, 'isSameAsBilling', !addr.isSameAsBilling)}
                >
                  <View style={[styles.checkbox, addr.isSameAsBilling && styles.checkboxChecked]}>
                    {addr.isSameAsBilling && <Check size={14} color="#fff" />}
                  </View>
                  <Text style={styles.checkboxLabel}>Same as Billing Address</Text>
                </TouchableOpacity>
              )}

              <TextInput
                style={[styles.input, styles.inputMultiline, addr.isSameAsBilling && { opacity: 0.6 }]}
                placeholder="Enter shipping address"
                placeholderTextColor="#4b5563"
                value={addr.address}
                onChangeText={(text) => !addr.isSameAsBilling && handleUpdateShippingAddress(index, 'address', text)}
                multiline
                textAlignVertical="top"
                editable={!addr.isSameAsBilling}
              />
            </View>
          ))}

          <TouchableOpacity style={styles.addButton} onPress={handleAddShippingAddress}>
            <Plus size={18} color="#3b82f6" />
            <Text style={styles.addButtonText}>Add Shipping Address</Text>
          </TouchableOpacity>


          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Save size={20} color="#fff" />
            <Text style={styles.saveButtonText}>{isEditMode ? 'Update Customer' : 'Save Customer'}</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>Smart Yedu • Secure Customer Data</Text>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default CustomerForm;
