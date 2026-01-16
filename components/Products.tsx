import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Alert, Modal, ActivityIndicator } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Plus, Search, Package, ChevronRight, Edit2, Trash2, ChevronLeft, AlertTriangle } from 'lucide-react-native';
import { StorageService } from '../services/storage';
import { Product } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './Products.scss';

const Products: React.FC = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [])
  );

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await StorageService.getProducts();
      // Sort by name
      const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
      setProducts(sorted);
    } catch (e) {
      console.error("Failed to load products", e);
      Alert.alert("Error", "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (productToDelete) {
      try {
        await StorageService.deleteProduct(productToDelete.id);
        setProductToDelete(null);
        loadProducts();
      } catch (e) {
        Alert.alert("Error", "Failed to delete product");
      }
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.hsnCode && p.hsnCode.includes(searchQuery))
  );

  const renderProductItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productDetails}>
          <Text style={styles.productPrice}>₹{item.price.toFixed(2)}</Text>
          <Text style={styles.productTax}>• {item.gstRate}% GST</Text>
          {item.hsnCode ? <Text style={styles.productTax}>• HSN: {item.hsnCode}</Text> : null}
        </View>
      </View>

      <View style={styles.productActions}>
        <TouchableOpacity onPress={() => router.push(`/products/${item.id}/edit`)}>
          <Edit2 size={18} color="#3b82f6" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setProductToDelete(item)}>
          <Trash2 size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Products...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6b7280" />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#6b7280"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* List */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.productsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Package size={64} color="#374151" />
            <Text style={styles.emptyStateText}>No products found</Text>
            <Text style={styles.emptyStateSubtext}>Add products to speed up invoice creation.</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/products/add')}
      >
        <Plus size={32} color="#fff" />
      </TouchableOpacity>

      {/* Delete Confirmation Dialog */}
      <Modal transparent animationType="fade" visible={!!productToDelete} onRequestClose={() => setProductToDelete(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#1a222e', width: '100%', maxWidth: 320, borderRadius: 24, padding: 32, borderWidth: 1, borderColor: '#1f2937' }}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{ width: 64, height: 64, backgroundColor: 'rgba(244, 63, 94, 0.1)', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <AlertTriangle size={32} color="#f43f5e" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 }}>Delete Product?</Text>
              <Text style={{ color: '#9ca3af', textAlign: 'center', fontSize: 14 }}>Are you sure you want to remove this record?</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity onPress={() => setProductToDelete(null)} style={{ flex: 1, paddingVertical: 16, borderRadius: 16, backgroundColor: 'rgba(31, 41, 55, 0.5)', alignItems: 'center' }}>
                <Text style={{ color: '#9ca3af', fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={{ flex: 1, paddingVertical: 16, borderRadius: 16, backgroundColor: '#e11d48', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default Products;
