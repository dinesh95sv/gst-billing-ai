
import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Plus, FileText, Timer, AlertCircle, ArrowUpRight, ArrowDownRight, Clock, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../services/storage';
import { Invoice, InvoiceStatus } from '../types';

const { width } = Dimensions.get('window');

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  
  useEffect(() => {
    setInvoices(StorageService.getInvoices());
  }, []);

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
        <TouchableOpacity onPress={() => navigate('/reports')} style={styles.iconButton}>
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
        onPress={() => navigate('/create-invoice')}
        activeOpacity={0.8}
      >
        <View style={styles.plusIcon}>
          <Plus size={20} color="#fff" />
        </View>
        <Text style={styles.createButtonText}>Create New GST Invoice</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <TouchableOpacity onPress={() => navigate('/invoices')}>
          <Text style={styles.viewAll}>View All</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.activityList}>
        {invoices.length > 0 ? (
          invoices.slice(0, 10).map((invoice) => (
            <TouchableOpacity 
              key={invoice.id} 
              style={styles.invoiceItem}
              onPress={() => navigate(`/edit-invoice/${invoice.id}`)}
              activeOpacity={0.7}
            >
              <View style={[styles.statusIcon, styles[`statusIcon${invoice.status}` as keyof typeof styles]]}>
                {invoice.status === InvoiceStatus.PAID && <FileText size={20} color="#3b82f6" />}
                {invoice.status === InvoiceStatus.PENDING && <Timer size={20} color="#f59e0b" />}
                {invoice.status === InvoiceStatus.OVERDUE && <AlertCircle size={20} color="#ef4444" />}
              </View>
              
              <View style={styles.invoiceInfo}>
                <Text style={styles.invoiceName} numberOfLines={1}>{invoice.invoiceNumber} - {invoice.customerName}</Text>
                <View style={styles.invoiceMeta}>
                  <Text style={styles.invoiceDate}>{new Date(invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</Text>
                  <Text style={styles.dot}>•</Text>
                  <View style={[styles.statusBadge, styles[`statusBadge${invoice.status}` as keyof typeof styles]]}>
                    <Text style={[styles.statusText, styles[`statusText${invoice.status}` as keyof typeof styles]]}>{invoice.status}</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c0f14',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginTop: 2,
  },
  iconButton: {
    padding: 10,
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 14,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#151c27',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(30, 41, 59, 0.5)',
  },
  /* Fix: Added missing style property salesCard */
  salesCard: {},
  /* Fix: Added missing style property pendingCard */
  pendingCard: {},
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748b',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 4,
  },
  growthBadge: {
    padding: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
  },
  growthText: {
    fontSize: 11,
    color: '#10b981',
    fontWeight: '700',
  },
  pendingText: {
    fontSize: 11,
    color: '#f59e0b',
    fontWeight: '700',
  },
  createButton: {
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 24,
    marginBottom: 32,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  plusIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 2,
    borderRadius: 20,
    marginRight: 10,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  viewAll: {
    color: '#3b82f6',
    fontWeight: '700',
    fontSize: 14,
  },
  activityList: {
    gap: 12,
  },
  invoiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151c27',
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(30, 41, 59, 0.3)',
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  statusIconPAID: { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
  statusIconPENDING: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  statusIconOVERDUE: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  invoiceInfo: {
    flex: 1,
  },
  invoiceName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  invoiceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  invoiceDate: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: '600',
  },
  dot: {
    color: '#1e293b',
    marginHorizontal: 6,
    fontSize: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgePAID: { backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  statusBadgePENDING: { backgroundColor: 'rgba(245, 158, 11, 0.1)' },
  statusBadgeOVERDUE: { backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statusTextPAID: { color: '#10b981' },
  statusTextPENDING: { color: '#f59e0b' },
  statusTextOVERDUE: { color: '#ef4444' },
  invoiceAmountContainer: {
    alignItems: 'flex-end',
  },
  invoiceAmount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#151c27',
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#1e293b',
  },
  emptyText: {
    color: '#475569',
    marginTop: 12,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default Dashboard;