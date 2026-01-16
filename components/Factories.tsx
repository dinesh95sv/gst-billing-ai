import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, UserCircle, MoreVertical, Factory as FactoryIcon, CreditCard, MapPin, ChevronLeft, Trash2, AlertTriangle, Power, Edit2 } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { StorageService } from '../services/storage';
import { Factory } from '../types';
import styles from './Factories.scss';

const Factories: React.FC = () => {
  const router = useRouter();
  const [factories, setFactories] = useState<Factory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [factoryToDelete, setFactoryToDelete] = useState<Factory | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadFactories();
    }, [])
  );

  const loadFactories = async () => {
    try {
      setLoading(true);
      const data = await StorageService.getFactories();
      setFactories(data);
    } catch (e) {
      console.error("Failed to load factories", e);
      Alert.alert("Error", "Failed to load factories");
    } finally {
      setLoading(false);
    }
  };

  const filteredFactories = factories.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.gstin.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async () => {
    if (factoryToDelete) {
      try {
        await StorageService.deleteFactory(factoryToDelete.id);
        setFactoryToDelete(null);
        loadFactories();
      } catch (e) {
        Alert.alert("Error", "Failed to delete factory");
      }
    }
  };

  if (loading && factories.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Factories...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Factories</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6b7280" />
          <TextInput
            placeholder="Search by name or GSTIN..."
            placeholderTextColor="#4b5563"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Factories List */}
      <ScrollView contentContainerStyle={styles.factoriesList} showsVerticalScrollIndicator={false}>
        {filteredFactories.length > 0 ? (
          filteredFactories.map((factory) => (
            <TouchableOpacity
              key={factory.id}
              style={styles.factoryCard}
              onPress={() => router.push(`/factories/${factory.id}/edit`)}
              activeOpacity={0.7}
            >
              <View style={styles.factoryHeader}>
                <View style={[styles.factoryInfo, { flex: 1 }]}>
                  <View style={styles.factoryNameRow}>
                    <Text style={styles.factoryName}>{factory.name}</Text>
                    <View style={[styles.statusIndicator, factory.isActive ? styles.statusActive : styles.statusInactive]} />
                  </View>

                  <View style={styles.factoryDetails}>
                    <View style={styles.factoryDetailItem}>
                      <MapPin size={12} color="#9ca3af" />
                      <Text style={styles.factoryDetailText} numberOfLines={1}>{factory.location || 'No location'}</Text>
                    </View>
                  </View>

                  <Text style={styles.gstinLabel}>GSTIN</Text>
                  <Text style={styles.gstinValue}>{factory.gstin}</Text>
                </View>

                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    setFactoryToDelete(factory);
                  }}
                  style={styles.deleteButton}
                >
                  <Trash2 size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <FactoryIcon size={48} color="#374151" />
            <Text style={styles.emptyStateText}>No factories found</Text>
            <Text style={styles.emptyStateSubtext}>Add manufacturing units or branches.</Text>
          </View>
        )}
      </ScrollView>


      {/* Delete Confirmation Dialog */}
      <Modal transparent animationType="fade" visible={!!factoryToDelete} onRequestClose={() => setFactoryToDelete(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#1a222e', width: '100%', maxWidth: 320, borderRadius: 24, padding: 32, borderWidth: 1, borderColor: '#1f2937' }}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{ width: 64, height: 64, backgroundColor: 'rgba(244, 63, 94, 0.1)', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <AlertTriangle size={32} color="#f43f5e" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 }}>Delete Factory?</Text>
              <Text style={{ color: '#9ca3af', textAlign: 'center', fontSize: 14 }}>Are you sure you want to remove this factory?</Text>
            </View>

            {factoryToDelete && (
              <View style={{ backgroundColor: '#0c0f14', padding: 16, borderRadius: 16, marginBottom: 24, gap: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>Name</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#fff' }}>{factoryToDelete.name}</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase' }}>GSTIN</Text>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: '#3b82f6' }}>{factoryToDelete.gstin}</Text>
                </View>
              </View>
            )}

            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity onPress={() => setFactoryToDelete(null)} style={{ flex: 1, paddingVertical: 16, borderRadius: 16, backgroundColor: 'rgba(31, 41, 55, 0.5)', alignItems: 'center' }}>
                <Text style={{ color: '#9ca3af', fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} style={{ flex: 1, paddingVertical: 16, borderRadius: 16, backgroundColor: '#e11d48', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/factories/add')}
      >
        <Plus size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Factories;
