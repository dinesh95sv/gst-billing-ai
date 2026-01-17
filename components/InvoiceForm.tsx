import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Alert, Modal, KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { ChevronLeft, Save, Plus, Trash2, Search, Check, X, Factory as FactoryIcon, Tag, MapPin } from 'lucide-react-native';
import { StorageService } from '../services/storage';
import { Customer, Invoice, InvoiceStatus, InvoiceItem, Product, Factory, ShippingAddress } from '../types';
import { SafeAreaView } from 'react-native-safe-area-context';
import styles from './InvoiceForm.scss';
import GstDropdown from './GstDropdown';

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

const SearchableShippingAddress: React.FC<{
  addresses: ShippingAddress[];
  selectedId: string;
  onSelect: (address: ShippingAddress) => void;
}> = ({ addresses, selectedId, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedAddress = addresses.find(a => a.id === selectedId);

  return (
    <View style={styles.searchableContainer}>
      <Text style={styles.label}>Shipping Address</Text>
      <TouchableOpacity
        style={styles.searchableButton}
        onPress={() => setIsOpen(true)}
      >
        <Text style={selectedAddress ? styles.searchableTextSelected : styles.searchableText}>
          {selectedAddress ? `${selectedAddress.name}` : "Select shipping address..."}
        </Text>
        <MapPin size={16} color="#6b7280" />
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="slide" transparent>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Shipping Address</Text>
              <TouchableOpacity onPress={() => setIsOpen(false)}>
                <X size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ flex: 1 }}>
              {addresses.length > 0 ? (
                addresses.map(a => (
                  <TouchableOpacity
                    key={a.id}
                    style={styles.modalItem}
                    onPress={() => {
                      onSelect(a);
                      setIsOpen(false);
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalItemTitle}>{a.name}</Text>
                      <Text style={styles.modalItemSubtitle} numberOfLines={2}>{a.address}</Text>
                    </View>
                    {selectedId === a.id && <Check size={16} color="#3b82f6" />}
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.emptyText}>No shipping addresses found for this customer.</Text>
              )}
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
  const [query, setQuery] = useState('');

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(query.toLowerCase()) ||
    p.hsnCode.includes(query)
  );

  return (
    <View style={styles.searchableContainer}>
      <Text style={styles.label}>Product Description</Text>
      <TouchableOpacity
        style={styles.searchableButton}
        onPress={() => {
          setIsOpen(true);
          setQuery('');
        }}
      >
        <Text style={value ? styles.searchableTextSelected : styles.searchableText}>
          {value || "Search and select product..."}
        </Text>
        <Search size={16} color="#6b7280" />
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="slide" transparent>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Product</Text>
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
            <ScrollView style={{ flex: 1 }} keyboardShouldPersistTaps="handled">
              {query.length > 0 && (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    onChange(query);
                    setIsOpen(false);
                  }}
                >
                  <View>
                    <Text style={styles.modalItemTitle}>{query}</Text>
                    <Text style={[styles.modalItemSubtitle, { color: '#3b82f6' }]}>Use as custom product</Text>
                  </View>
                  <Plus size={16} color="#3b82f6" />
                </TouchableOpacity>
              )}

              {filtered.length > 0 ? (
                filtered.map(p => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.modalItem}
                    onPress={() => {
                      onSelect(p);
                      setIsOpen(false);
                    }}
                  >
                    <View>
                      <Text style={styles.modalItemTitle}>{p.name}</Text>
                      <Text style={styles.modalItemSubtitle}>₹{p.price.toLocaleString('en-IN')} • {p.gstRate}% GST</Text>
                    </View>
                    <Check size={16} color={value === p.name ? "#3b82f6" : "transparent"} />
                  </TouchableOpacity>
                ))
              ) : (
                query.length === 0 && (
                  <Text style={styles.emptyText}>Start typing to search products...</Text>
                )
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
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
  const [selectedShippingAddress, setSelectedShippingAddress] = useState<ShippingAddress | null>(null);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [discount, setDiscount] = useState<string>('0');
  const [items, setItems] = useState<Partial<InvoiceItem>[]>([
    { id: Math.random().toString(), productName: '', quantity: 1, rate: 0, gstRate: 0 }
  ]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [id])
  );

  const scrollViewRef = useRef<ScrollView>(null);
  const itemPositions = useRef<{ [key: string]: number }>({});

  const loadData = async () => {
    try {
      setLoading(true);
      const [allCustomers, allProducts, allFactories] = await Promise.all([
        StorageService.getCustomers(),
        StorageService.getProducts(),
        StorageService.getFactories()
      ]);

      setCustomers(allCustomers);
      setProducts(allProducts);
      setFactories(allFactories);

      if (id) {
        const existingInvoice = await StorageService.getInvoiceById(id);
        if (existingInvoice) {
          setSelectedCustomerId(existingInvoice.customerId);
          setSelectedShippingAddress(existingInvoice.shippingAddress || null);
          setInvoiceNumber(existingInvoice.invoiceNumber);
          setInvoiceDate(existingInvoice.date);
          setItems(existingInvoice.items);
          setDiscount(existingInvoice.discount?.toString() || '0');

          const f = allFactories.find(fact => fact.name === existingInvoice.branchName);
          if (f) setSelectedFactoryId(f.id);
        } else {
          Alert.alert("Error", "Invoice not found");
          router.back();
          return;
        }
      } else {
        setSelectedCustomerId('');
        setSelectedFactoryId('');
        setSelectedShippingAddress(null);
        setItems([{ id: Math.random().toString(), productName: '', quantity: 1, rate: 0, gstRate: 0 }]);
        setDiscount('0');

        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        const dateStr = `${yyyy}-${mm}-${dd}`;

        const allInvoices = await StorageService.getInvoices();
        const todayCount = allInvoices.filter(inv => inv.date === dateStr).length;
        setInvoiceNumber(`#INV-${yyyy}-${mm}-${dd}-${String(todayCount + 1).padStart(3, '0')}`);
        setInvoiceDate(dateStr);
      }
    } catch (error) {
      console.error("Error loading data", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleAddItem = () => {
    setItems([...items, { id: Math.random().toString(), productName: '', quantity: 1, rate: 0, gstRate: 0 }]);
  };

  const removeItem = (itemId: string) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  const updateItem = (itemId: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => item.id === itemId ? { ...item, [field]: value } : item));
  };

  const handleProductSelect = (itemId: string, product: Product) => {
    const existingIndex = items.findIndex(i => i.productId === product.id && i.id !== itemId);
    if (existingIndex !== -1) {
      const existing = items[existingIndex];
      const current = items.find(i => i.id === itemId);
      const newItems = items.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: (existing.quantity || 0) + (current?.quantity || 1) } : item
      ).filter(item => item.id !== itemId);
      setItems(newItems);
      if (existing.id && itemPositions.current[existing.id] !== undefined && scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: itemPositions.current[existing.id], animated: true });
      }
    } else {
      setItems(items.map(item =>
        item.id === itemId ? {
          ...item,
          productId: product.id,
          productName: product.name,
          rate: product.price,
          gstRate: product.gstRate
        } : item
      ));
    }
  };

  const calculateTotals = () => {
    let subTotal = 0;
    let taxTotal = 0;
    items.forEach(item => {
      const lineSub = (item.quantity || 0) * (item.rate || 0);
      subTotal += lineSub;
      taxTotal += lineSub * ((item.gstRate || 0) / 100);
    });
    const parsedDiscount = parseFloat(discount) || 0;
    const grandTotal = subTotal + taxTotal - parsedDiscount;
    return { subTotal, taxTotal, grandTotal };
  };

  const { subTotal, taxTotal, grandTotal } = calculateTotals();

  const handleSave = async () => {
    if (!selectedCustomer) {
      Alert.alert("Error", "Please select a customer");
      return;
    }

    if (items.some(item => !item.productName || (item.quantity ?? 0) <= 0)) {
      Alert.alert("Error", "All items must have a product name and quantity > 0");
      return;
    }

    const currentStatus = isEditMode && id
      ? (await StorageService.getInvoiceById(id))?.status || InvoiceStatus.PENDING
      : InvoiceStatus.PENDING;

    const invoiceData: Invoice = {
      id: id || Date.now().toString(),
      invoiceNumber,
      date: invoiceDate,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      branchName: factories.find(f => f.id === selectedFactoryId)?.name || 'Default Plant',
      items: items as InvoiceItem[],
      subTotal,
      taxTotal,
      discount: parseFloat(discount) || 0,
      grandTotal,
      status: currentStatus,
      shippingAddress: selectedShippingAddress || undefined
    };

    await StorageService.saveInvoice(invoiceData);
    router.replace('/invoices');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/invoices')} style={styles.backButton}>
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditMode ? 'Edit Invoice' : 'New Invoice'}</Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        <View style={{ flex: 1 }}>
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View>
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
                    onSelect={(c) => {
                      setSelectedCustomerId(c.id);
                      const sameAsBilling = c.shippingAddresses?.find(a => a.isSameAsBilling);
                      setSelectedShippingAddress(sameAsBilling || null);
                    }}
                  />
                  {selectedCustomer && (
                    <SearchableShippingAddress
                      addresses={selectedCustomer.shippingAddresses || []}
                      selectedId={selectedShippingAddress?.id || ''}
                      onSelect={(a) => setSelectedShippingAddress(a)}
                    />
                  )}
                </View>

                <View style={styles.row}>
                  <View style={[styles.column, { flex: 65 }]}>
                    <Text style={styles.label}>Invoice No.</Text>
                    <TextInput style={styles.input} value={invoiceNumber} onChangeText={setInvoiceNumber} />
                  </View>
                  <View style={[styles.column, { flex: 35 }]}>
                    <Text style={styles.label}>Date</Text>
                    <TextInput style={styles.input} value={invoiceDate} onChangeText={setInvoiceDate} />
                  </View>
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Line Items</Text>
                <View style={styles.itemCountBadge}>
                  <Text style={styles.itemCountText}>{items.length} Total</Text>
                </View>
              </View>

              {items.map((item) => (
                <View
                  key={item.id}
                  style={styles.itemCard}
                  onLayout={(e) => { if (item.id) itemPositions.current[item.id] = e.nativeEvent.layout.y; }}
                >
                  {items.length > 1 && (
                    <TouchableOpacity onPress={() => removeItem(item.id!)} style={styles.deleteItemButton}>
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
                      <TextInput keyboardType="numeric" style={styles.input} value={item.quantity?.toString()} onChangeText={(t) => updateItem(item.id!, 'quantity', parseFloat(t) || 0)} />
                    </View>
                    <View style={styles.column}>
                      <Text style={styles.label}>Rate</Text>
                      <TextInput keyboardType="numeric" style={styles.input} value={item.rate?.toString()} onChangeText={(t) => updateItem(item.id!, 'rate', parseFloat(t) || 0)} />
                    </View>
                    <View style={styles.column}>
                      <GstDropdown label="GST %" value={item.gstRate || 0} onChange={(r) => updateItem(item.id!, 'gstRate', r)} />
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity onPress={handleAddItem} style={styles.addItemButton}>
                <Plus size={20} color="#6b7280" />
                <Text style={styles.addItemText}>Add Another Item</Text>
              </TouchableOpacity>

            </View>
          </ScrollView>
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
                  <TextInput keyboardType="numeric" style={styles.discountInput} placeholder="0" value={discount} onChangeText={setDiscount} />
                </View>
                <View>
                  <Text style={styles.summaryText}>Sub: ₹{subTotal.toLocaleString('en-IN')}</Text>
                  <Text style={styles.summaryText}>Tax: ₹{taxTotal.toLocaleString('en-IN')}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
              <Save size={20} color="#fff" />
              <Text style={styles.saveButtonText}>{isEditMode ? 'Update Invoice' : 'Generate Invoice'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default InvoiceForm;
