import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, MoreHorizontal, Download, Share2, ShieldCheck, Factory as FactoryIcon, Receipt } from 'lucide-react-native';
import { StorageService } from '../services/storage';
import { Invoice, Factory, Customer } from '../types';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { WebView } from 'react-native-webview';
import styles from './InvoicePreview.scss';

const numberToWords = (num: number): string => {
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n: number): string => {
    if (n < 20) return a[n];
    const tens = b[Math.floor(n / 10)];
    const units = a[n % 10];
    return tens + (units ? ' ' + units.trim() : '');
  };

  const convert = (n: number): string => {
    if (n === 0) return 'Zero';
    let res = '';
    if (n >= 10000000) {
      res += convert(Math.floor(n / 10000000)) + ' Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      res += convert(Math.floor(n / 100000)) + ' Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      res += inWords(Math.floor(n / 1000)) + ' Thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      res += inWords(Math.floor(n / 100)) + ' Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (res !== '') res += 'and ';
      res += inWords(n);
    }
    return res;
  };

  const amount = Math.floor(num);
  const paise = Math.round((num - amount) * 100);
  let result = convert(amount);

  if (paise > 0) {
    result += ' and ' + convert(paise) + ' Paise Only';
  } else {
    result += ' Only';
  }
  return result;
};

const InvoicePreview: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [factory, setFactory] = useState<Factory | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    if (id) {
      try {
        setLoading(true);
        const inv = await StorageService.getInvoiceById(id);
        if (inv) {
          setInvoice(inv);
          const factories = await StorageService.getFactories();
          const fact = factories.find(f => f.name === inv.branchName);
          if (fact) setFactory(fact);

          const cust = await StorageService.getCustomerById(inv.customerId);
          if (cust) setCustomer(cust);
        }
      } catch (e) {
        console.error("Error loading invoice preview", e);
        Alert.alert("Error", "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const generateHtml = () => {
    if (!invoice) return '';
    const discountAmount = invoice.discount || 0;
    const taxableValue = invoice.subTotal - (discountAmount > 0 ? discountAmount : 0);
    const finalTotal = invoice.grandTotal;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
            
            * { box-sizing: border-box; -webkit-print-color-adjust: exact; }
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #000; font-size: 10px; line-height: 1.4; max-width: 800px; margin: 0 auto; }
            
            /* Utils */
            .flex { display: flex; }
            .flex-col { flex-direction: column; }
            .items-center { align-items: center; }
            .items-start { align-items: flex-start; }
            .items-end { align-items: flex-end; }
            .justify-between { justify-content: space-between; }
            .justify-center { justify-content: center; }
            .justify-end { justify-content: flex-end; }
            .space-x-3 > * + * { margin-left: 12px; }
            .space-y-1 > * + * { margin-top: 4px; }
            .space-y-6 > * + * { margin-top: 24px; }
            .mb-1 { margin-bottom: 4px; }
            .mb-2 { margin-bottom: 8px; }
            .mb-3 { margin-bottom: 12px; }
            .mb-6 { margin-bottom: 24px; }
            .mt-2 { margin-top: 8px; }
            .mt-8 { margin-top: 32px; }
            .p-4 { padding: 16px; }
            .px-3 { padding-left: 12px; padding-right: 12px; }
            .py-2 { padding-top: 8px; padding-bottom: 8px; }
            .py-3 { padding-top: 12px; padding-bottom: 12px; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .uppercase { text-transform: uppercase; }
            .font-bold { font-weight: 700; }
            .font-black { font-weight: 900; }
            .text-white { color: #fff; }
            .text-gray-400 { color: #9ca3af; }
            .text-gray-500 { color: #6b7280; }
            .text-gray-600 { color: #4b5563; }
            .text-gray-800 { color: #1f2937; }
            .text-gray-900 { color: #111827; }
            .text-blue-600 { color: #2563eb; }
            .text-blue-400 { color: #60a5fa; }
            .text-rose-500 { color: #f43f5e; }
            
            /* Components */
            .logo-box { width: 64px; height: 64px; background-color: #1a1c24; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; margin-right: 12px; }
            .logo-img { width: 100%; height: 100%; object-fit: contain; }
            
            .badge { background-color: #000; color: #fff; padding: 4px 8px; font-size: 8px; font-weight: 900; border-radius: 4px; display: inline-block; letter-spacing: 0.1em; }
            
            .divider { height: 1.5px; background-color: #000; width: 100%; margin: 24px 0; }
            
            .card { background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 8px; padding: 16px; flex: 1; }
            .card-label { font-size: 8px; font-weight: 900; color: rgba(59, 130, 246, 0.6); letter-spacing: 0.15em; margin-bottom: 8px; }
            
            table { width: 100%; border-collapse: collapse; }
            th { background-color: #1a1c24; color: #fff; text-align: left; padding: 8px 12px; font-size: 9px; font-weight: 900; letter-spacing: 0.05em; }
            th:first-child { border-top-left-radius: 6px; }
            th:last-child { border-top-right-radius: 6px; }
            tr { border-bottom: 1px solid #f3f4f6; }
            td { padding: 12px; font-size: 10px; }
            
            .total-words-box { background-color: rgba(239, 246, 255, 0.4); border: 1px solid rgba(219, 234, 254, 0.5); padding: 16px; border-radius: 12px; }
            
            .signature-box { width: 144px; height: 80px; background-color: rgba(249, 250, 251, 0.5); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 8px; overflow: hidden; }
          </style>
        </head>
        <body>
          <!-- Header -->
          <div class="flex justify-between items-start mb-6">
            <div class="flex items-start">
              <div class="logo-box">
                ${factory?.logo ? `<img src="${factory.logo}" class="logo-img" />` : '<span class="text-white text-xs">LOGO</span>'}
              </div>
              <div>
                <h1 class="font-black uppercase" style="font-size: 20px; line-height: 1; margin: 0 0 12px 0;">TAX INVOICE</h1>
                <h2 class="font-bold text-gray-900 mb-1" style="font-size: 14px; margin: 0;">${factory?.name || invoice.branchName || 'ABC Factory Pvt Ltd'}</h2>
                <div class="text-gray-500" style="font-size: 9px;">
                  <p style="margin: 2px 0;">${factory?.location || 'Company Address Location'}</p>
                  <p style="margin: 2px 0;">${factory?.pincode ? `Pincode: ${factory.pincode} | ` : ''}<span class="font-bold text-black" style="color: #000;">GSTIN: ${factory?.gstin || ''}</span></p>
                </div>
              </div>
            </div>
            
            <div class="text-right">
              <div class="mb-3">
                 <span class="font-black text-gray-400 uppercase" style="font-size: 8px; letter-spacing: 0.2em;">ORIGINAL COPY</span>
              </div>
              <div class="text-gray-500" style="font-size: 10px; line-height: 1.5;">
                <div>Invoice: <span class="font-bold text-black" style="color: #000;">${invoice.invoiceNumber}</span></div>
                <div>Date: <span class="font-bold text-black" style="color: #000;">${new Date(invoice.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span></div>
                <div>Place: <span class="font-bold text-black" style="color: #000;">${factory?.location?.split(',').pop()?.trim() || 'Internal'}</span></div>
              </div>
            </div>
          </div>
          
          <div class="divider"></div>
          
          <!-- Addresses -->
          <div class="flex space-x-3 mb-6" style="gap: 16px;">
            <div class="card flex-col">
              <div class="card-label">BILL TO</div>
              <div class="font-black text-gray-900 mb-1" style="font-size: 12px;">${invoice.customerName}</div>
              <div class="text-gray-500 mb-3" style="font-size: 10px; flex: 1;">${customer?.address || 'Customer Address Information'}</div>
              <div class="font-bold text-gray-900" style="font-size: 10px;">GSTIN: ${customer?.gstin || 'Unregistered'}</div>
            </div>
            
            <div class="card flex-col">
              <div class="card-label">SHIP TO</div>
              <div class="font-black text-gray-900 mb-1" style="font-size: 12px;">${invoice.shippingAddress?.name || invoice.customerName}</div>
              <div class="text-gray-500 mb-3" style="font-size: 10px; flex: 1;">${invoice.shippingAddress?.address || customer?.address || 'Warehouse Delivery Address'}</div>
              <div class="font-bold text-gray-900" style="font-size: 10px;">Contact: ${customer?.phone || 'N/A'}</div>
            </div>
          </div>
          
          <!-- Items Table -->
          <div class="mb-8">
            <table>
              <thead>
                <tr>
                  <th>Item Description</th>
                  <th class="text-center">Qty</th>
                  <th class="text-right">Rate</th>
                  <th class="text-right">GST%</th>
                  <th class="text-right">Amt</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map(item => `
                  <tr>
                    <td class="font-black text-gray-800">${item.productName}</td>
                    <td class="text-center font-bold text-gray-600">${item.quantity}</td>
                    <td class="text-right font-bold text-gray-600">${item.rate.toFixed(2)}</td>
                    <td class="text-right font-bold text-gray-600">${item.gstRate}%</td>
                    <td class="text-right font-black text-gray-900">${(item.quantity * item.rate).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                `).join('')}
                <!-- Spacer rows like backup -->
                ${Array(Math.max(0, 5 - invoice.items.length)).fill('').map(() =>
      `<tr style="height: 40px; border-bottom: 1px solid rgba(243, 244, 246, 0.5);"><td></td><td></td><td></td><td></td><td></td></tr>`
    ).join('')}
              </tbody>
            </table>
          </div>
          
          <!-- Bottom Section -->
          <div class="mt-8" style="border-top: 1.5px solid #000; padding-top: 24px;">
            <div class="flex" style="gap: 32px;">
              <!-- Left Col: Words & Bank -->
              <div class="flex-col" style="flex: 1;">
                <div class="total-words-box mb-6">
                  <div class="font-black text-blue-400 uppercase mb-2" style="font-size: 7px; letter-spacing: 0.1em;">TOTAL IN WORDS</div>
                  <div class="font-bold text-gray-800 italic" style="font-size: 11px;">${numberToWords(finalTotal)}</div>
                </div>
                
                <div>
                   <div class="font-black text-gray-400 uppercase mb-2" style="font-size: 8px; letter-spacing: 0.1em;">BANK DETAILS</div>
                   ${factory?.bankName ? `
                     <div class="font-bold text-gray-700" style="font-size: 10px;">${factory.bankName} | AC: ${factory.accountNumber}</div>
                     <div class="text-gray-500" style="font-size: 10px;">IFSC: ${factory.ifscCode} | Current Account</div>
                   ` : '<div class="text-gray-400" style="font-size: 10px;">No bank details provided</div>'}
                </div>
              </div>
              
              <!-- Right Col: Totals -->
              <div class="flex-col" style="width: 240px;">
                <div class="flex justify-between items-center mb-2 text-gray-500 font-medium" style="font-size: 10px;">
                  <span>Subtotal:</span><span class="text-black">${invoice.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                ${discountAmount > 0 ? `
                  <div class="flex justify-between items-center mb-2 text-gray-500 font-medium" style="font-size: 10px;">
                    <span>Discount:</span><span class="text-rose-500 font-bold">-${discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                ` : ''}
                <div class="flex justify-between items-center mb-2 text-gray-500 font-medium" style="font-size: 10px; border-top: 1px solid #f9fafb; padding-top: 4px;">
                  <span>Taxable Value:</span><span class="text-black font-bold">${taxableValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div class="flex justify-between items-center mb-2 text-gray-500 font-medium" style="font-size: 10px;">
                  <span>Total GST:</span><span class="text-black font-bold">${invoice.taxTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                
                <div class="flex justify-between items-end mt-2 pt-4" style="border-top: 1px solid #e5e7eb;">
                   <span class="font-black uppercase text-gray-900" style="font-size: 12px;">GRAND TOTAL:</span>
                   <span class="font-black text-blue-600" style="font-size: 20px;">₹${finalTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
            
            <!-- Footer Signature -->
            <div class="mt-8 flex justify-between items-end pt-8" style="border-top: 1px solid #f3f4f6;">
               <div style="max-width: 240px;">
                 <p class="text-gray-400 italic" style="font-size: 8px; line-height: 1.6;">
                   Notes: Goods once sold will not be taken back.<br/>
                   Computer generated invoice, does not require a Signature.
                 </p>
               </div>
               
               <div class="flex-col items-end text-right">
                 <div class="signature-box">
                    ${factory?.signature ? `<img src="${factory.signature}" style="max-width: 100%; max-height: 100%;" />` : ''}
                 </div>
                 <div style="width: 144px; height: 1px; background-color: #d1d5db; margin-bottom: 6px;"></div>
                 <div class="font-black uppercase text-gray-900" style="font-size: 9px;">AUTHORIZED SIGNATORY</div>
               </div>
            </div>
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
      Alert.alert('Error', 'Failed to print invoice');
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
      Alert.alert('Error', 'Failed to share invoice');
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Preview...</Text>
      </SafeAreaView>
    );
  }

  if (!invoice) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Receipt size={64} color="#374151" />
          <Text style={styles.cardSubtitle}>Invoice not found</Text>
          <TouchableOpacity onPress={() => router.back()} style={[styles.actionButton, styles.printButton]}>
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Invoice Preview</Text>
        <TouchableOpacity>
          <MoreHorizontal size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <WebView
        originWhitelist={['*']}
        source={{ html: generateHtml() }}
        style={styles.webViewContainer}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3b82f6" />
          </View>
        )}
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity onPress={handleShare} style={[styles.actionButton, styles.shareButton]}>
          {isProcessing ? <ActivityIndicator color="#fff" /> : <Share2 size={24} color="#fff" />}
          <Text style={styles.buttonText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handlePrint} style={[styles.actionButton, styles.printButton]}>
          {isProcessing ? <ActivityIndicator color="#fff" /> : <Download size={24} color="#fff" />}
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default InvoicePreview;
