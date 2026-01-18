import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Switch, Image, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ChevronLeft, Camera, Briefcase, MapPin, Smartphone, Landmark, Edit3, Trash2, CheckCircle2, UploadCloud, Power } from 'lucide-react-native';
import { StorageService } from '../services/storage';
import { Factory } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import styles from './FactoryForm.scss';

const FactoryForm: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditMode = !!id;

  const [formData, setFormData] = useState<Partial<Factory>>({
    name: '',
    gstin: '',
    location: '',
    phone: '',
    pincode: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    isActive: true,
    logo: '',
    signature: ''
  });
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [id, isEditMode])
  );

  const initialFormState: Partial<Factory> = {
    name: '',
    gstin: '',
    location: '',
    phone: '',
    pincode: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    isActive: true,
    logo: '',
    signature: ''
  };

  const loadData = async () => {
    try {
      if (isEditMode && id) {
        setLoading(true);
        const existing = await StorageService.getFactoryById(id);
        if (existing) {
          setFormData(existing);
        }
        setLoading(false);
      } else {
        setFormData(initialFormState);
      }
    } catch (e) {
      console.error("Error loading factory data", e);
      setLoading(false);
    }
  };

  const [status, requestPermission] = ImagePicker.useMediaLibraryPermissions();

  const pickImage = async (field: 'logo' | 'signature') => {
    try {
      if (!status?.granted) {
        const permission = await requestPermission();
        if (!permission.granted) {
          Alert.alert(
            "Permission Required",
            "This app needs access to your photo library to select a logo or signature."
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: field === 'logo', // Disable editing for signature to preserve transparency
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        if (field === 'signature') {
          // Strict PNG validation for signatures
          const isPng = asset.uri.toLowerCase().endsWith('.png') || asset.mimeType === 'image/png';
          if (!isPng) {
            Alert.alert("Invalid Format", "Please upload a PNG image for the signature (transparent background recommended).");
            return;
          }
        }

        // Use correct mime type
        const fileType = asset.uri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
        const base64Img = `data:${fileType};base64,${asset.base64}`;

        setFormData(prev => ({ ...prev, [field]: base64Img }));
      }
    } catch (e) {
      Alert.alert("Error", "Failed to pick image");
    }
  };



  const handleSave = async () => {
    if (!formData.name || !formData.gstin) {
      Alert.alert("Error", "Please enter Business Name and GSTIN.");
      return;
    }

    const factoryData: Factory = {
      id: formData.id || Date.now().toString(),
      name: formData.name || '',
      gstin: formData.gstin || '',
      location: formData.location || '',
      phone: formData.phone || '',
      pincode: formData.pincode || '',
      bankName: formData.bankName || '',
      accountNumber: formData.accountNumber || '',
      ifscCode: formData.ifscCode || '',
      logo: formData.logo,
      signature: formData.signature,
      isActive: formData.isActive ?? true
    };

    await StorageService.saveFactory(factoryData);
    await AsyncStorage.removeItem('temp_factory_draft');
    router.replace('/factories');
  };

  const SectionHeader = ({ icon, label }: { icon: React.ReactNode, label: string }) => (
    <View style={styles.sectionHeader}>
      {icon}
      <Text style={styles.sectionTitle}>{label}</Text>
    </View>
  );

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
        <TouchableOpacity onPress={() => router.push('/factories')} style={styles.backButton}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Factory Details</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Status Toggle */}
          <View style={styles.statusCard}>
            <View style={styles.statusInfo}>
              <View style={[styles.statusIconContainer, formData.isActive ? styles.statusIconActive : styles.statusIconInactive]}>
                <Power size={20} color={formData.isActive ? '#10b981' : '#6b7280'} />
              </View>
              <View>
                <Text style={styles.statusLabel}>Factory Status</Text>
                <Text style={[styles.statusValue, formData.isActive ? styles.statusValueActive : styles.statusValueInactive]}>
                  {formData.isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <Switch
              trackColor={{ false: "#374151", true: "#2563eb" }}
              thumbColor={formData.isActive ? "#ffffff" : "#f4f3f4"}
              onValueChange={() => setFormData({ ...formData, isActive: !formData.isActive })}
              value={formData.isActive || false}
            />
          </View>

          {/* Logo Section */}
          <View style={styles.logoSection}>
            <TouchableOpacity onPress={() => pickImage('logo')} style={{ overflow: 'hidden' }}>
              <View style={styles.logoUploadBox}>
                {formData.logo ? (
                  <Image source={{ uri: formData.logo }} style={styles.logoImage} resizeMode="cover" />
                ) : (
                  <Camera size={32} color="#4b5563" />
                )}
              </View>
            </TouchableOpacity>
            <View style={styles.logoTextContainer}>
              <Text style={styles.logoTitle}>Upload Business Logo</Text>
              <Text style={styles.logoSubtitle}>Tap to select image</Text>
            </View>
          </View>

          {/* Business Identity */}
          <SectionHeader icon={<Briefcase size={16} color="#3b82f6" />} label="Business Identity" />
          <View style={styles.formGroup}>
            <View>
              <Text style={styles.label}>Business Name</Text>
              <TextInput
                placeholder="Acme Factory Solutions"
                placeholderTextColor="#4b5563"
                style={styles.input}
                value={formData.name}
                onChangeText={text => setFormData(prev => ({ ...prev, name: text }))}
              />
            </View>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>GSTIN</Text>
              <TextInput
                placeholder="27AAACA0000A1Z5"
                placeholderTextColor="#4b5563"
                style={styles.input}
                value={formData.gstin}
                onChangeText={text => setFormData(prev => ({ ...prev, gstin: text }))}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Contact & Address */}
          <SectionHeader icon={<MapPin size={16} color="#3b82f6" />} label="Contact & Address" />
          <View style={styles.formGroup}>
            <View>
              <Text style={styles.label}>Full Address</Text>
              <TextInput
                multiline
                numberOfLines={3}
                placeholder="Industrial Area Phase II, Plot No. 45, Near Metro Pillar 120, Mumbai, Maharashtra"
                placeholderTextColor="#4b5563"
                style={[styles.input, styles.inputMultiline]}
                textAlignVertical="top"
                value={formData.location}
                onChangeText={text => setFormData(prev => ({ ...prev, location: text }))}
              />
            </View>
            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Phone</Text>
                <TextInput
                  placeholder="+91 22 4500 9000"
                  placeholderTextColor="#4b5563"
                  style={styles.input}
                  value={formData.phone}
                  onChangeText={text => setFormData(prev => ({ ...prev, phone: text }))}
                  keyboardType="phone-pad"
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Pincode</Text>
                <TextInput
                  placeholder="400013"
                  placeholderTextColor="#4b5563"
                  style={styles.input}
                  value={formData.pincode}
                  onChangeText={text => setFormData(prev => ({ ...prev, pincode: text }))}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Bank Details */}
          <SectionHeader icon={<Landmark size={16} color="#3b82f6" />} label="Settlement Bank Details" />
          <Text style={styles.sectionDescription}>These details will be printed on generated invoices for payments.</Text>
          <View style={styles.formGroup}>
            <View>
              <Text style={styles.label}>Bank Name</Text>
              <TextInput
                placeholder="HDFC Bank"
                placeholderTextColor="#4b5563"
                style={styles.input}
                value={formData.bankName}
                onChangeText={text => setFormData(prev => ({ ...prev, bankName: text }))}
              />
            </View>
            <View>
              <Text style={styles.label}>Account Number</Text>
              <TextInput
                placeholder="50200012345678"
                placeholderTextColor="#4b5563"
                style={styles.input}
                value={formData.accountNumber}
                onChangeText={text => setFormData(prev => ({ ...prev, accountNumber: text }))}
                keyboardType="numeric"
              />
            </View>
            <View>
              <Text style={styles.label}>IFSC Code</Text>
              <TextInput
                placeholder="HDFC0000012"
                placeholderTextColor="#4b5563"
                style={styles.input}
                value={formData.ifscCode}
                onChangeText={text => setFormData(prev => ({ ...prev, ifscCode: text }))}
                autoCapitalize="characters"
              />
            </View>
          </View>

          {/* Signature Section */}
          <SectionHeader icon={<Edit3 size={16} color="#3b82f6" />} label="Authorized Signature" />
          <Text style={styles.sectionDescription}>This signature will be automatically applied to all future invoices.</Text>

          <View style={styles.signatureCard}>
            <View style={styles.signaturePreview}>
              {formData.signature ? (
                <Image source={{ uri: formData.signature }} style={styles.signatureImage} resizeMode="contain" />
              ) : (
                <View style={styles.noSignatureContainer}>
                  <Edit3 size={48} color="#f43f5e" />
                  <Text style={styles.noSignatureText}>NO SIGNATURE FOUND</Text>
                </View>
              )}
            </View>

            {formData.signature ? (
              <View style={styles.activeSignatureBadge}>
                <Text style={styles.activeSignatureText}>Currently Active</Text>
              </View>
            ) : null}

            <View style={styles.signatureActions}>
              <TouchableOpacity
                style={styles.signatureButton}
                onPress={() => pickImage('signature')}
              >
                <UploadCloud size={16} color="#d1d5db" />
                <Text style={styles.signatureButtonText}>Upload Image</Text>
              </TouchableOpacity>
            </View>

            {formData.signature ? (
              <TouchableOpacity
                onPress={() => setFormData(prev => ({ ...prev, signature: '' }))}
                style={styles.removeSignatureButton}
              >
                <Trash2 size={16} color="#f43f5e" />
                <Text style={styles.removeSignatureText}>Remove Current Signature</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <Text style={styles.complianceText}>Ensure the signature matches official records for GST compliance.</Text>

          {/* Final Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            style={styles.saveProfileButton}
          >
            <CheckCircle2 size={24} color="#fff" />
            <Text style={styles.saveProfileText}>Save Business Profile</Text>
          </TouchableOpacity>

          <Text style={styles.footerText}>Verified Profile • Tax Compliant</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default FactoryForm;
