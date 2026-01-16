
import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Plus, FileText, Timer, AlertCircle, ArrowUpRight, ArrowDownRight, Clock, BarChart3 } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { StorageService } from '../services/storage';
import { Invoice, InvoiceStatus } from '../types';
import styles from './Dashboard.scss';

const { width } = Dimensions.get('window');

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const data = await StorageService.getInvoices();
        setInvoices(Array.isArray(data) ? data : []);
      };
      loadData();
    }, [])
  );

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthInvoices = invoices.filter(inv => {
      const d = new Date(inv.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const currentSales = currentMonthInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
    const pendingInvoices = currentMonthInvoices.filter(inv => inv.status === InvoiceStatus.PENDING);
    const pendingAmount = pendingInvoices.reduce((acc, inv) => acc + inv.grandTotal, 0);
    const pendingCount = pendingInvoices.length;

    return {
      currentSales,
      pendingAmount,
      pendingCount,
      growth: 12.5 // Mock for visual
    };
  }, [invoices]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>GST Billing Pro</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/reports')} style={styles.iconButton}>
          <BarChart3 color="#94a3b8" size={24} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, styles.salesCard]}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>MONTHLY SALES</Text>
            <View style={styles.growthBadge}>
              <ArrowUpRight size={12} color="#10b981" />
            </View>
          </View>
          <Text style={styles.statValue}>₹{stats.currentSales.toLocaleString('en-IN')}</Text>
          <Text style={styles.growthText}>+12.5% vs last month</Text>
        </View>

        <View style={[styles.statCard, styles.pendingCard]}>
          <View style={styles.statHeader}>
            <Text style={styles.statLabel}>PENDING</Text>
            <Clock size={14} color="#f59e0b" />
          </View>
          <Text style={styles.statValue}>₹{stats.pendingAmount.toLocaleString('en-IN')}</Text>
          <Text style={styles.pendingText}>{stats.pendingCount} Invoices</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => router.push('/invoices/create')}
        activeOpacity={0.8}
      >
        <View style={styles.plusIcon}>
          <Plus size={20} color="#fff" />
        </View>
        <Text style={styles.createButtonText}>Create New GST Invoice</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity onPress={() => router.push('/invoices')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activityList}>
        {invoices.length > 0 ? (
          invoices.slice(0, 10).map((invoice) => (
            <TouchableOpacity
              key={invoice.id}
              style={styles.invoiceItem}
              onPress={() => router.push(`/invoices/${invoice.id}/edit`)}
              activeOpacity={0.7}
            >
              <View style={[styles.statusIcon, styles[`statusIcon${invoice.status}`]]}>
                {invoice.status === InvoiceStatus.PAID && <FileText size={20} color="#3b82f6" />}
                {invoice.status === InvoiceStatus.PENDING && <Timer size={20} color="#f59e0b" />}
                {invoice.status === InvoiceStatus.OVERDUE && <AlertCircle size={20} color="#ef4444" />}
              </View>

              <View style={styles.invoiceInfo}>
                <Text style={styles.invoiceName} numberOfLines={1}>{invoice.invoiceNumber} - {invoice.customerName}</Text>
                <View style={styles.invoiceMeta}>
                  <Text style={styles.invoiceDate}>{new Date(invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</Text>
                  <Text style={styles.dot}>•</Text>
                  <View style={[styles.statusBadge, styles[`statusBadge${invoice.status}`]]}>
                    <Text style={[styles.statusText, styles[`statusText${invoice.status}`]]}>{invoice.status}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.invoiceAmountContainer}>
                <Text style={styles.invoiceAmount}>₹{invoice.grandTotal.toLocaleString('en-IN')}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <FileText size={48} color="#1e293b" />
            <Text style={styles.emptyText}>No recent invoices</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default Dashboard;