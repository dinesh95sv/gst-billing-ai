import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert, Linking, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus, Search, Users, ChevronLeft, Phone, Mail, Edit2, Trash2 } from 'lucide-react-native';
import { StorageService } from '../services/storage';
import { Customer } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './Customers.scss';

const Customers: React.FC = () => {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [])
  );

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await StorageService.getCustomers();
      const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
      setCustomers(sorted);
    } catch (e) {
      console.error("Failed to load customers", e);
      Alert.alert("Error", "Failed to load customers data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Delete Customer",
      "Are you sure you want to delete this customer?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await StorageService.deleteCustomer(id);
              loadCustomers();
            } catch (e) {
              Alert.alert("Error", "Failed to delete customer");
            }
          }
        }
      ]
    );
  };

  const handleCall = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email: string) => {
    if (email) Linking.openURL(`mailto:${email}`);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.gstin && c.gstin.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (c.phone && c.phone.includes(searchQuery))
  );

  const renderCustomerItem = ({ item }: { item: Customer }) => (
    <TouchableOpacity
      style={styles.customerCard}
      onPress={() => router.push(`/customers/${item.id}/edit`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{item.name}</Text>
          {item.gstin ? <Text style={styles.gstin}>GSTIN: {item.gstin}</Text> : null}
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handleDelete(item.id);
          }}
          style={styles.deleteButton}
        >
          <Trash2 size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.contactDetails}>
        {item.phone ? (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleCall(item.phone);
            }}
            style={styles.contactItem}
          >
            <Phone size={14} color="#9ca3af" />
            <Text style={styles.contactText}>{item.phone}</Text>
          </TouchableOpacity>
        ) : null}
        {item.email ? (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleEmail(item.email);
            }}
            style={styles.contactItem}
          >
            <Mail size={14} color="#9ca3af" />
            <Text style={styles.contactText}>{item.email}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Customers...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Customers</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6b7280" />
          <TextInput
            placeholder="Search customers..."
            placeholderTextColor="#6b7280"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <FlatList
        data={filteredCustomers}
        renderItem={renderCustomerItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.customersList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Users size={64} color="#374151" />
            <Text style={styles.emptyStateText}>No customers found</Text>
            <Text style={styles.emptyStateSubtext}>Add customers to easily select them during invoicing.</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/customers/add')}
      >
        <Plus size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Customers;
