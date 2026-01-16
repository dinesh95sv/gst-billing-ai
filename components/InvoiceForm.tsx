import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Alert, Modal, KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ChevronLeft, Save, Plus, Trash2, Search, Check, X, Factory as FactoryIcon, Tag, MapPin } from 'lucide-react-native';
import { StorageService } from '../services/storage';
import { Customer, Invoice, InvoiceStatus, InvoiceItem, Product, Factory } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './InvoiceForm.scss';

const SearchableCustomer: React.FC<{
  customers: Customer[];
  selectedId: string;
  onSelect: (customer: Customer) => void;
}> = ({ customers, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selectedCustomer = customers.find(c => c.id === selectedId);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.gstin.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <View style={styles.searchableContainer}>
      <Text style={styles.label}>Customer</Text>
      <TouchableOpacity
        style={styles.searchableButton}
        onPress={() => setIsOpen(true)}
      >
        <Text style={selectedCustomer ? styles.searchableTextSelected : styles.searchableText}>
          {selectedCustomer ? selectedCustomer.name : "Search and select customer..."}
        </Text>
        <Search size={16} color="#6b7280" />
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="slide" transparent>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Customer</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <TextInput
              autoFocus
              placeholder="Type to search..."
              placeholderTextColor="#4b5563"
              style={styles.modalInput}
              value={query}
              onChangeText={setQuery}
            />
            <ScrollView style={{ flex: 1 }}>
              {filtered.length > 0 ? (
                filtered.map(c => (
                  <TouchableOpacity
                    key={c.id}
                    style={styles.modalItem}
                    onPress={() => {
                      onSelect(c);
                      setIsOpen(false);
                      setQuery('');
                    }}
                  >
                    <View>
                      <Text style={styles.modalItemTitle}>{c.name}</Text>
                      <Text style={styles.modalItemSubtitle}>{c.gstin}</Text>
                    </View>
                    {selectedId === c.id && <Check size={16} color="#3b82f6" />}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>No customers found</Text>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const SearchableFactory: React.FC<{
  factories: Factory[];
  selectedId: string;
  onSelect: (factory: Factory) => void;
}> = ({ factories, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedFactory = factories.find(f => f.id === selectedId);

  return (
    <View style={[styles.searchableContainer, { zIndex: 40 }]}>
      <Text style={styles.label}>Source Factory</Text>
      <TouchableOpacity
        style={styles.searchableButton}
        onPress={() => setIsOpen(true)}
      >
        <Text style={selectedFactory ? styles.searchableTextSelected : styles.searchableText}>
          {selectedFactory ? selectedFactory.name : "Select Billing Factory..."}
        </Text>
        <FactoryIcon size={16} color="#6b7280" />
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="slide" transparent>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Factory</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }}>
              {factories.map(f => (
                <TouchableOpacity
                  key={f.id}
                  style={styles.modalItem}
                  onPress={() => {
                    onSelect(f);
                    setIsOpen(false);
                  }}
                >
                  <View>
                    <Text style={styles.modalItemTitle}>{f.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MapPin size={10} color="#6b7280" style={{ marginRight: 4 }} />
                      <Text style={styles.modalItemSubtitle}>{f.location}</Text>
                    </View>
                  </View>
                  {selectedId === f.id && <Check size={16} color="#3b82f6" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};

const SearchableProduct: React.FC<{
  products: Product[];
  value: string;
  onSelect: (product: Product) => void;
  onChange: (val: string) => void;
}> = ({ products, value, onSelect, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(value.toLowerCase()) ||
    p.hsnCode.includes(value)
  );

  return (
    <View style={[styles.searchableContainer, { zIndex: 30 }]}>
      <Text style={styles.label}>Product Description</Text>
      <View style={{ position: 'relative' }}>
        <TextInput
          placeholder="Search and select product..."
          placeholderTextColor="#4b5563"
          style={[styles.input, { paddingRight: 40 }]}
          value={value}
          onFocus={() => setIsOpen(true)}
          onChangeText={(text) => {
            onChange(text);
            setIsOpen(true);
          }}
        />
        <View style={{ position: 'absolute', right: 16, top: 16 }}>
          <Search size={16} color="#6b7280" />
        </View>
      </View>

      {isOpen && value.length > 0 && (
        <View style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 8,
          backgroundColor: '#1a222e',
          borderWidth: 1,
          borderColor: '#1f2937',
          borderRadius: 12,
          zIndex: 50,
          maxHeight: 200,
          overflow: 'hidden'
        }}>
          <ScrollView nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {filtered.length > 0 ? (
              filtered.map(p => (
                <TouchableOpacity
                  key={p.id}
                  style={{ padding: 16, borderBottomWidth: 1, borderColor: 'rgba(31, 41, 55, 0.5)' }}
                  onPress={() => {
                    onSelect(p);
                    setIsOpen(false);
                  }}
                >
                  <View>
                    <Text style={styles.modalItemTitle}>{p.name}</Text>
                    <Text style={styles.modalItemSubtitle}>HSN: {p.hsnCode} • ₹{p.price.toLocaleString()}</Text>
                  </View>
                  <View style={{ marginTop: 4, flexDirection: 'row' }}>
                    <Text style={{ fontSize: 10, fontWeight: '700', color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, textTransform: 'uppercase' }}>{p.gstRate}% GST</Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={{ padding: 16 }}>
                <Text style={{ textAlign: 'center', color: '#4b5563', fontSize: 14, fontStyle: 'italic' }}>New Item (Not in directory)</Text>
                <TouchableOpacity onPress={() => setIsOpen(false)} style={{ marginTop: 8 }}>
                  <Text style={{ color: '#3b82f6', fontSize: 12, textAlign: 'center' }}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const InvoiceForm: React.FC = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const isEditMode = !!id;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [factories, setFactories] = useState<Factory[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedFactoryId, setSelectedFactoryId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [discount, setDiscount] = useState<string>('0');
  const [items, setItems] = useState<Partial<InvoiceItem>[]>([
    { id: Math.random().toString(), productName: '', quantity: 1, rate: 0, gstRate: 18 }
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [id, isEditMode]);

  const loadData = async () => {
    try {
      const [allCustomers, allProducts, allFactories] = await Promise.all([
        StorageService.getCustomers(),
        StorageService.getProducts(),
        StorageService.getFactories()
      ]);

      setCustomers(allCustomers);
      setProducts(allProducts);
      setFactories(allFactories);

      if (isEditMode && id) {
        const existingInvoice = await StorageService.getInvoiceById(id);
        if (existingInvoice) {
          setSelectedCustomerId(existingInvoice.customerId);
          setInvoiceNumber(existingInvoice.invoiceNumber);
          setInvoiceDate(existingInvoice.date);
          setItems(existingInvoice.items);
          setDiscount(existingInvoice.discount?.toString() || '0');

          const f = allFactories.find(fact => fact.name === existingInvoice.branchName);
          if (f) setSelectedFactoryId(f.id);
        }
      } else {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const allInvoices = await StorageService.getInvoices();
        const todayInvoicesCount = allInvoices.filter(inv => inv.date === dateStr).length;
        const sequence = String(todayInvoicesCount + 1).padStart(3, '0');

        setInvoiceNumber(`#INV-${yyyy}-${mm}-${dd}-${sequence}`);
        setInvoiceDate(dateStr);
      }
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setItems([...items, { id: Math.random().toString(), productName: '', quantity: 1, rate: 0, gstRate: 18 }]);
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === itemId ? { ...item, [field]: value } : item));
  };

  const handleProductSelect = (itemId: string, product: Product) => {
    setItems(items.map(item =>
      item.id === itemId ? {
        ...item,
        productId: product.id,
        productName: product.name,
        rate: product.price,
        gstRate: product.gstRate
      } : item
    ));
  };

  const calculateTotals = () => {
    let subTotal = 0;
    let taxTotal = 0;
    items.forEach(item => {
      const lineSub = (item.quantity || 0) * (item.rate || 0);
      const lineTax = lineSub * ((item.gstRate || 0) / 100);
      subTotal += lineSub;
      taxTotal += lineTax;
    });
    const parsedDiscount = parseFloat(discount) || 0;
    const grandTotal = subTotal + taxTotal - parsedDiscount;
    return { subTotal, taxTotal, grandTotal };
  };

  const { subTotal, taxTotal, grandTotal } = calculateTotals();

  const handleSave = async () => {
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    const selectedFactory = factories.find(f => f.id === selectedFactoryId);

    if (!selectedCustomer) {
      Alert.alert("Error", "Please select a customer");
      return;
    }

    if (items.some(item => !item.productName || (item.quantity ?? 0) <= 0)) {
      Alert.alert("Error", "Please ensure all items have a name and quantity greater than zero.");
      return;
    }

    const currentInvoiceStatus = isEditMode && id
      ? (await StorageService.getInvoiceById(id))?.status || InvoiceStatus.PENDING
      : InvoiceStatus.PENDING;

    const invoiceData: Invoice = {
      id: id || Date.now().toString(),
      invoiceNumber: invoiceNumber,
      date: invoiceDate,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      branchName: selectedFactory?.name || 'Default Plant',
      items: items as InvoiceItem[],
      subTotal,
      taxTotal,
      discount: parseFloat(discount) || 0,
      grandTotal,
      status: currentInvoiceStatus
    };

    await StorageService.saveInvoice(invoiceData);
    router.replace('/invoices');
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/invoices')} style={styles.backButton}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEditMode ? 'Edit GST Invoice' : 'New GST Invoice'}
        </Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Basic Info */}
          <View style={styles.section}>
            <View style={{ gap: 16, marginBottom: 16 }}>
              <SearchableFactory
                factories={factories}
                selectedId={selectedFactoryId}
                onSelect={(f) => setSelectedFactoryId(f.id)}
              />
              <SearchableCustomer
                customers={customers}
                selectedId={selectedCustomerId}
                onSelect={(c) => setSelectedCustomerId(c.id)}
              />
            </View>

            <View style={styles.row}>
              <View style={styles.column}>
                <Text style={styles.label}>Invoice No.</Text>
                <TextInput
                  style={styles.input}
                  value={invoiceNumber}
                  onChangeText={setInvoiceNumber}
                />
              </View>
              <View style={styles.column}>
                <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
                <TextInput
                  style={styles.input}
                  value={invoiceDate}
                  onChangeText={setInvoiceDate}
                  placeholder="YYYY-MM-DD"
                />
              </View>
            </View>
          </View>

          {/* Line Items */}
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Line Items</Text>
              <View style={styles.itemCountBadge}>
                <Text style={styles.itemCountText}>{items.length} Total</Text>
              </View>
            </View>

            {items.map((item, index) => (
              <View key={item.id} style={styles.itemCard}>
                {items.length > 1 && (
                  <TouchableOpacity
                    onPress={() => removeItem(item.id!)}
                    style={styles.deleteItemButton}
                  >
                    <Trash2 size={18} color="#f43f5e" />
                  </TouchableOpacity>
                )}

                <SearchableProduct
                  products={products}
                  value={item.productName || ''}
                  onSelect={(p) => handleProductSelect(item.id!, p)}
                  onChange={(val) => updateItem(item.id!, 'productName', val)}
                />

                <View style={styles.itemRow}>
                  <View style={styles.column}>
                    <Text style={styles.label}>Qty</Text>
                    <TextInput
                      keyboardType="numeric"
                      style={styles.input}
                      value={item.quantity?.toString()}
                      onChangeText={(text) => updateItem(item.id!, 'quantity', parseFloat(text) || 0)}
                    />
                  </View>
                  <View style={styles.column}>
                    <Text style={styles.label}>Rate</Text>
                    <TextInput
                      keyboardType="numeric"
                      style={styles.input}
                      value={item.rate?.toString()}
                      onChangeText={(text) => updateItem(item.id!, 'rate', parseFloat(text) || 0)}
                    />
                  </View>
                  <View style={styles.column}>
                    <Text style={styles.label}>GST %</Text>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                      {[0, 5, 12, 18, 28].map((rate) => (
                        <TouchableOpacity
                          key={rate}
                          onPress={() => updateItem(item.id!, 'gstRate', rate)}
                          style={[styles.gstBadge, item.gstRate === rate && styles.gstBadgeActive]}
                        >
                          <Text style={[styles.gstText, item.gstRate === rate && styles.gstTextActive]}>{rate}%</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
                <View style={styles.lineTotalContainer}>
                  <Text style={styles.lineTotalLabel}>
                    Line Total: <Text style={styles.lineTotalValue}>₹{((item.quantity || 0) * (item.rate || 0) * (1 + (item.gstRate || 0) / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
                  </Text>
                </View>
              </View>
            ))}

            <TouchableOpacity
              onPress={handleAddItem}
              style={styles.addItemButton}
            >
              <Plus size={20} color="#6b7280" />
              <Text style={styles.addItemText}>Add Another Item</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Summary Footer */}
      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.grandTotalLabel}>Grand Total</Text>
            <Text style={styles.grandTotalValue}>₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.summaryDetails}>
            <View style={styles.discountRow}>
              <Tag size={12} color="#f43f5e" />
              <Text style={styles.discountLabel}>Discount</Text>
              <TextInput
                keyboardType="numeric"
                style={styles.discountInput}
                placeholder="0"
                value={discount}
                onChangeText={setDiscount}
              />
            </View>
            <View>
              <Text style={styles.summaryText}>Sub: ₹{subTotal.toLocaleString('en-IN')}</Text>
              <Text style={styles.summaryText}>Tax: ₹{taxTotal.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleSave}
          style={styles.saveButton}
        >
          <Save size={20} color="#fff" />
          <Text style={styles.saveButtonText}>{isEditMode ? 'Update Invoice' : 'Generate Invoice'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default InvoiceForm;
