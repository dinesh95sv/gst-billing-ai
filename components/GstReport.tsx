import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart3, ArrowUpRight, Download, Calendar, X, ChevronLeft, ChevronRight, Eye } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { StorageService } from '../services/storage';
import { Invoice } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MonthYearPicker from './MonthYearPicker';
import styles from './GstReport.scss';

const STATE_KEY = 'reports_page_state';

const GstReport: React.FC = () => {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadStateAndData();
    }, [])
  );

  useEffect(() => {
    saveState();
  }, [selectedDate]);

  const loadStateAndData = async () => {
    try {
      setLoading(true);
      const savedState = await AsyncStorage.getItem(STATE_KEY);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.selectedDate) {
          setSelectedDate(new Date(parsed.selectedDate));
        }
      }
      const data = await StorageService.getInvoices();
      setInvoices(data || []);
    } catch (e) {
      console.error("Failed to load reports data", e);
      Alert.alert("Error", "Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const saveState = async () => {
    try {
      await AsyncStorage.setItem(STATE_KEY, JSON.stringify({
        selectedDate: selectedDate.toISOString()
      }));
    } catch (e) {
      console.error("Failed to save state", e);
    }
  };

  // Filter invoices for selected month
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const d = new Date(inv.date);
      return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
    });
  }, [invoices, selectedDate]);

  const stats = useMemo(() => {
    const totalSales = filteredInvoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
    const totalTax = filteredInvoices.reduce((sum, inv) => sum + (inv.taxTotal || 0), 0);

    // Simple estimation if detailed breakdown isn't available
    const totalCGST = totalTax / 2;
    const totalSGST = totalTax / 2;
    const totalIGST = 0; // Ideally calculate from interstate flag

    return { totalSales, totalTax, cgst: totalCGST, sgst: totalSGST, igst: totalIGST };
  }, [filteredInvoices]);


  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setShowPicker(false);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const currentMonthName = monthNames[selectedDate.getMonth()];

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Report...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GST Reports</Text>
        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.headerDateButton}>
          <Calendar size={18} color="#3b82f6" />
          <Text style={styles.headerDateText}>{currentMonthName} {selectedDate.getFullYear()}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        <MonthYearPicker
          visible={showPicker}
          value={selectedDate}
          onClose={() => setShowPicker(false)}
          onChange={handleDateChange}
        />

        {/* Summary Cards */}
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Sales</Text>
            <Text style={styles.summaryValue}>₹{stats.totalSales.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Tax</Text>
            <Text style={styles.summaryValue}>₹{stats.totalTax.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</Text>
            <Text style={styles.summarySubtext}>+12.5% vs last month</Text>
          </View>
        </View>

        {/* Detailed Breakdown */}
        <Text style={styles.sectionTitle}>Tax Breakdown</Text>
        <View style={styles.breakdownCard}>
          <View style={styles.breakdownHeader}>
            <Text style={[styles.breakdownTitleText, { flex: 2 }]}>Component</Text>
            <Text style={[styles.breakdownTitleText, { textAlign: 'right' }]}>Amount</Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownText}>CGST (Central Tax)</Text>
            <Text style={styles.breakdownText}>{stats.cgst.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</Text>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownText}>SGST (State Tax)</Text>
            <Text style={styles.breakdownText}>{stats.sgst.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</Text>
          </View>
          <View style={[styles.breakdownRow, styles.breakdownRowLast]}>
            <Text style={styles.breakdownText}>IGST (Interstate Tax)</Text>
            <Text style={styles.breakdownText}>{stats.igst.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.downloadButton]} onPress={() => router.push('/reports/preview')}>
            <Eye size={20} color="#fff" />
            <Text style={styles.downloadButtonText}>Preview PDF Report</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default GstReport;
