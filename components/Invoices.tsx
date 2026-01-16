import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Plus, Calendar, MoreVertical, Trash2, Eye, ChevronLeft, ChevronRight, AlertTriangle, Share2 } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { StorageService } from '../services/storage';
import { Invoice, InvoiceStatus } from '../types';
import styles from './Invoices.scss';

const Invoices: React.FC = () => {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  const filters = ['All', 'Paid', 'Pending', 'Overdue'];

  useFocusEffect(
    useCallback(() => {
      loadInvoices();
    }, [])
  );

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const data = await StorageService.getInvoices();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load invoices", e);
      Alert.alert("Error", "Could not load invoices");
    } finally {
      setLoading(false);
    }
  };

  const deleteInvoice = async (id: string) => {
    try {
      await StorageService.deleteInvoice(id);
      setInvoiceToDelete(null);
      loadInvoices();
    } catch (e) {
      Alert.alert("Error", "Failed to delete invoice");
    }
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete.id);
    }
  };

  const handleShare = (invoice: Invoice) => {
    router.push(`/invoices/${invoice.id}`);
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch =
        (inv.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (inv.invoiceNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase());

      const matchesStatus = activeFilter === 'All' || inv.status === activeFilter;

      return matchesSearch && matchesStatus;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [invoices, searchQuery, activeFilter]);

  if (loading && invoices.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Invoices...</Text>
      </SafeAreaView>
    );
  }

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Paid': return { badge: styles.statusPaid, text: styles.statusTextPaid };
      case 'Pending': return { badge: styles.statusPending, text: styles.statusTextPending };
      case 'Overdue': return { badge: styles.statusOverdue, text: styles.statusTextOverdue };
      default: return { badge: styles.statusPending, text: styles.statusTextPending };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Invoices</Text>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#6b7280" />
          <TextInput
            placeholder="Search invoices..."
            placeholderTextColor="#6b7280"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <View style={{ height: 50 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filters.map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, activeFilter === f && styles.filterChipActive]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[styles.filterText, activeFilter === f && styles.filterTextActive]}>{f}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      <ScrollView contentContainerStyle={styles.invoiceList} showsVerticalScrollIndicator={false}>
        {filteredInvoices.length > 0 ? (
          filteredInvoices.map((item) => {
            const statusStyles = getStatusStyles(item.status);
            return (
              <TouchableOpacity
                key={item.id}
                style={styles.invoiceCard}
                onPress={() => router.push(`/invoices/${item.id}/edit`)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.customerName}>{item.customerName}</Text>
                    <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
                  </View>
                  <View>
                    <Text style={styles.amount}>₹{item.grandTotal.toFixed(2)}</Text>
                    <Text style={styles.date}>{new Date(item.date).toLocaleDateString('en-IN')}</Text>
                  </View>
                </View>

                <View style={styles.cardFooter}>
                  <View style={[styles.statusBadge, statusStyles.badge]}>
                    <Text style={[styles.statusText, statusStyles.text]}>{item.status}</Text>
                  </View>

                  <View style={styles.cardActions}>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        handleShare(item);
                      }}
                      style={styles.actionButton}
                    >
                      <Share2 size={18} color="#3b82f6" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        setInvoiceToDelete(item);
                      }}
                      style={styles.actionButton}
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </TouchableOpacity>
                    <ChevronRight size={18} color="#4b5563" />
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Calendar size={48} color="#374151" />
            <Text style={styles.emptyStateText}>No invoices found</Text>
            <Text style={styles.emptyStateSubtext}>Try adjusting your search or filters</Text>
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/invoices/create')}
      >
        <Plus size={32} color="#fff" />
      </TouchableOpacity>

      {/* Delete Modal */}
      <Modal transparent animationType="fade" visible={!!invoiceToDelete} onRequestClose={() => setInvoiceToDelete(null)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#1a222e', width: '100%', maxWidth: 320, borderRadius: 24, padding: 32, borderWidth: 1, borderColor: '#1f2937' }}>
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <View style={{ width: 64, height: 64, backgroundColor: 'rgba(244, 63, 94, 0.1)', borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <AlertTriangle size={32} color="#f43f5e" />
              </View>
              <Text style={{ fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 8 }}>Delete Invoice?</Text>
              <Text style={{ color: '#9ca3af', textAlign: 'center', fontSize: 14 }}>Are you sure you want to remove this record? This action cannot be undone.</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <TouchableOpacity onPress={() => setInvoiceToDelete(null)} style={{ flex: 1, paddingVertical: 16, borderRadius: 16, backgroundColor: 'rgba(31, 41, 55, 0.5)', alignItems: 'center' }}>
                <Text style={{ color: '#9ca3af', fontWeight: '700' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmDelete} style={{ flex: 1, paddingVertical: 16, borderRadius: 16, backgroundColor: '#e11d48', alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default Invoices;
