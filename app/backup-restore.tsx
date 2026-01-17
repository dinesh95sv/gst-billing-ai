import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ChevronLeft, Download, Upload, ShieldCheck, Database } from 'lucide-react-native';
import { StorageService } from '../services/storage';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import * as DocumentPicker from 'expo-document-picker';
import styles from '../components/BackupRestore.scss';

export default function BackupRestore() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        try {
            setLoading(true);
            const data = await StorageService.exportAllData();
            const fileName = `gst_backup_${new Date().toISOString().split('T')[0]}.json`;
            const fileUri = FileSystem.cacheDirectory + fileName;

            await FileSystem.writeAsStringAsync(fileUri, JSON.stringify(data, null, 2), {
                encoding: FileSystem.EncodingType.UTF8,
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(fileUri, {
                    mimeType: 'application/json',
                    dialogTitle: 'Export GST Billing Data',
                    UTI: 'public.json',
                });
            } else {
                Alert.alert('Error', 'Sharing is not available on this device');
            }
        } catch (error) {
            console.error('Export error:', error);
            Alert.alert('Export Failed', 'An error occurred while exporting your data.');
        } finally {
            setLoading(false);
        }
    };

    const handleImport = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });

            if (result.canceled) return;

            setLoading(true);
            const fileContent = await FileSystem.readAsStringAsync(result.assets[0].uri);
            const data = JSON.parse(fileContent);

            await StorageService.importAllData(data);
            Alert.alert('Import Successful', 'Your data has been imported and merged successfully.');
        } catch (error) {
            console.error('Import error:', error);
            Alert.alert('Import Failed', 'The selected file is not a valid backup or contains corrupted data.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Backup & Restore</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.infoCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 }}>
                        <ShieldCheck size={28} color="#10b981" />
                        <Text style={styles.infoTitle}>Secure Your Data</Text>
                    </View>
                    <Text style={styles.infoDescription}>
                        Keep your business data safe. Export all your invoices, customers, and products into a backup file.
                        You can restore this file anytime or move it to another device.
                    </Text>
                </View>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.exportButton]}
                        onPress={handleExport}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : (
                            <>
                                <Download size={24} color="#fff" />
                                <View>
                                    <Text style={styles.actionButtonText}>Export All Data</Text>
                                    <Text style={styles.actionButtonSubtext}>Save your database to a file</Text>
                                </View>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.importButton]}
                        onPress={handleImport}
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator color="#3b82f6" /> : (
                            <>
                                <Upload size={24} color="#3b82f6" />
                                <View>
                                    <Text style={[styles.actionButtonText, { color: '#3b82f6' }]}>Import Data</Text>
                                    <Text style={[styles.actionButtonSubtext, { color: '#94a3b8' }]}>Merge data from a backup file</Text>
                                </View>
                            </>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Database size={40} color="#1e293b" style={{ marginBottom: 16 }} />
                    <Text style={styles.footerText}>
                        Importing data will add new records to your existing database.
                        Existing records with matching IDs will be preserved and not overwritten.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

