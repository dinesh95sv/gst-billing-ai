import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, MoreHorizontal, Download, Share2, ClipboardList, Info, FileText, ShieldCheck } from 'lucide-react-native';
import { StorageService } from '../services/storage';
import { Invoice, Factory } from '../types';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from './GstReportPreview.scss';

const GstReportPreview: React.FC = () => {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const savedState = await AsyncStorage.getItem('reports_page_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        if (parsed.selectedDate) setSelectedDate(new Date(parsed.selectedDate));
      }

      const invs = await StorageService.getInvoices();
      setInvoices(invs);

      const facts = await StorageService.getFactories();
      if (facts.length > 0) setSelectedFactory(facts[0]);
    } catch (e) {
      console.error("Error loading preview data", e);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const periodStr = `${monthNames[selectedDate.getMonth()].toUpperCase()} ${selectedDate.getFullYear()}`;

  const reportData = useMemo(() => {
    const filtered = invoices.filter(inv => {
      const d = new Date(inv.date);
      return d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
    });

    let outputGst = 0;
    let interstate = { cgst: 0, sgst: 0, igst: 0, total: 0 };
    let local18 = { cgst: 0, sgst: 0, igst: 0, total: 0 };
    let local12 = { cgst: 0, sgst: 0, igst: 0, total: 0 };

    filtered.forEach(inv => {
      outputGst += inv.taxTotal || 0;
      const isInterstate = false; // logic to determine interstate vs local

      inv.items.forEach(item => {
        const itemTax = (item.quantity * item.rate) * (item.gstRate / 100);
        if (isInterstate) {
          interstate.igst += itemTax;
          interstate.total += itemTax;
        } else if (item.gstRate === 18) {
          local18.cgst += itemTax / 2;
          local18.sgst += itemTax / 2;
          local18.total += itemTax;
        } else if (item.gstRate === 12) {
          local12.cgst += itemTax / 2;
          local12.sgst += itemTax / 2;
          local12.total += itemTax;
        }
      });
    });

    return {
      period: periodStr,
      business: {
        name: selectedFactory?.name || 'My Business',
        address: selectedFactory?.location || 'No Address',
        gstin: selectedFactory?.gstin || ''
      },
      generated: {
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        ref: `#GST-${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}`,
        status: 'FINAL'
      },
      summary: {
        outputGst,
        inputItc: 0.00,
        netPayable: outputGst
      },
      breakdown: [
        { description: 'Interstate Sales', ...interstate },
        { description: 'Local Sales (18%)', ...local18 },
        { description: 'Local Sales (12%)', ...local12 }
      ]
    };
  }, [invoices, selectedDate, selectedFactory, periodStr]);

  const generateHtml = () => {
    return `
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; align-items: flex-start; }
            .title { font-size: 24px; font-weight: 900; margin-bottom: 5px; text-transform: uppercase; }
            .subtitle { font-size: 10px; font-weight: bold; color: #666; text-transform: uppercase; letter-spacing: 1px; }
            .badge { background: #000; color: #fff; padding: 8px 12px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; border-radius: 4px; }
            .divider { height: 2px; background: #000; margin: 20px 0; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
            .label { font-size: 10px; font-weight: bold; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; }
            .value { font-size: 12px; font-weight: bold; }
            .value-large { font-size: 14px; font-weight: 900; }
            .summary-box { display: flex; border: 1px solid #eee; border-radius: 8px; margin-bottom: 30px; overflow: hidden; }
            .summary-item { flex: 1; padding: 15px; border-right: 1px solid #eee; background: #fff; }
            .summary-item:last-child { border-right: none; background: #f0f9ff; color: #0066cc; }
            .summary-val { font-size: 18px; font-weight: 900; margin-top: 5px; }
            table { width: 100%; border-collapse: collapse; font-size: 10px; }
            th { background: #1a1c24; color: #fff; text-align: left; padding: 10px; text-transform: uppercase; letter-spacing: 1px; }
            td { padding: 12px 10px; border-bottom: 1px solid #eee; font-weight: bold; color: #555; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .footer { position: fixed; bottom: 30px; left: 40px; right: 40px; text-align: center; font-size: 9px; color: #999; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="title">GST Tax Liability</div>
              <div class="subtitle">Report Period: ${reportData.period}</div>
            </div>
            <div class="badge">Official Copy</div>
          </div>
          <div class="divider"></div>
          
          <div class="grid" style="display: flex; justify-content: space-between;">
            <div>
              <div class="label">From Business</div>
              <div class="value-large">${reportData.business.name}</div>
              <div class="value">${reportData.business.address}</div>
              <div class="value">GSTIN: ${reportData.business.gstin}</div>
            </div>
            <div style="text-align: right;">
               <div class="label">Generated On</div>
               <div class="value">${reportData.generated.date}</div>
               <div class="label" style="margin-top: 10px;">Reference</div>
               <div class="value">${reportData.generated.ref}</div>
            </div>
          </div>

          <div class="label">Tax Summary</div>
          <div class="summary-box">
             <div class="summary-item">
                <div class="label">Total Output GST</div>
                <div class="summary-val">₹${reportData.summary.outputGst.toFixed(2)}</div>
             </div>
             <div class="summary-item">
                <div class="label">Input Tax Credit</div>
                <div class="summary-val">₹${reportData.summary.inputItc.toFixed(2)}</div>
             </div>
             <div class="summary-item">
                <div class="label">Net Payable</div>
                <div class="summary-val">₹${reportData.summary.netPayable.toFixed(2)}</div>
             </div>
          </div>

          <div class="label">Detailed Breakdown</div>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th class="text-right">CGST</th>
                <th class="text-right">SGST</th>
                <th class="text-right">IGST</th>
                <th class="text-right">Total Tax</th>
              </tr>
            </thead>
            <tbody>
              ${reportData.breakdown.map(item => `
                <tr>
                  <td>${item.description}</td>
                  <td class="text-right">₹${item.cgst.toFixed(2)}</td>
                  <td class="text-right">₹${item.sgst.toFixed(2)}</td>
                  <td class="text-right">₹${item.igst.toFixed(2)}</td>
                  <td class="text-right">₹${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="footer">
            This is a computer generated report and does not require a physical signature.
            Generated by GST Billing AI
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = async () => {
    try {
      setIsProcessing(true);
      const html = generateHtml();
      await Print.printAsync({ html });
    } catch (e) {
      Alert.alert('Error', 'Failed to print report');
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsProcessing(true);
      const html = generateHtml();
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (e) {
      Alert.alert('Error', 'Failed to share report');
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isProcessing) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Generating Report...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/reports')} style={styles.backButton}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Report Preview</Text>
        <TouchableOpacity>
          <MoreHorizontal size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <ShieldCheck size={48} color="#3b82f6" />
          <Text style={styles.cardTitle}>GST Liability Report</Text>
          <Text style={styles.cardSubtitle}>{reportData.period}</Text>

          <View style={styles.actions}>
            <TouchableOpacity onPress={handlePrint} style={[styles.actionButton, styles.printButton]}>
              <Download size={20} color="#fff" />
              <Text style={styles.buttonText}>Print / Save</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleShare} style={[styles.actionButton, styles.shareButton]}>
              <Share2 size={20} color="#fff" />
              <Text style={styles.buttonText}>Share PDF</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={{ marginTop: 20, color: '#6b7280', fontSize: 12 }}>Ready to export</Text>
      </View>
    </SafeAreaView>
  );
};

export default GstReportPreview;
