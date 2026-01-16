
import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InvoiceForm from './components/InvoiceForm';
import Products from './components/Products';
import ProductForm from './components/ProductForm';
import Customers from './components/Customers';
import CustomerForm from './components/CustomerForm';
import Factories from './components/Factories';
import FactoryForm from './components/FactoryForm';
import SignaturePad from './components/SignaturePad';
import Invoices from './components/Invoices';
import GstReport from './components/GstReport';
import GstReportPreview from './components/GstReportPreview';
import InvoicePreview from './components/InvoicePreview';

const App: React.FC = () => {
  return (
    <View style={styles.root}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create-invoice" element={<InvoiceForm />} />
            <Route path="/edit-invoice/:id" element={<InvoiceForm />} />
            <Route path="/products" element={<Products />} />
            <Route path="/add-product" element={<ProductForm />} />
            <Route path="/edit-product/:id" element={<ProductForm />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/add-customer" element={<CustomerForm />} />
            <Route path="/edit-customer/:id" element={<CustomerForm />} />
            <Route path="/factories" element={<Factories />} />
            <Route path="/add-factory" element={<FactoryForm />} />
            <Route path="/edit-factory/:id" element={<FactoryForm />} />
            <Route path="/draw-signature" element={<SignaturePad />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/invoice/:id" element={<InvoicePreview />} />
            <Route path="/reports" element={<GstReport />} />
            <Route path="/report-preview" element={<GstReportPreview />} />
          </Routes>
        </Layout>
      </Router>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0c0f14',
    // In web, ensure full height
    // Fix: cast the web specific style to any because '100vh' is not valid in standard RN DimensionValue types
    ...(Platform.OS === 'web' ? ({ minHeight: '100vh' } as any) : {}),
  },
});

export default App;