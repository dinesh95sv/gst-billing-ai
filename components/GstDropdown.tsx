import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, SafeAreaView } from 'react-native';
import { ChevronDown, Check, X, Percent } from 'lucide-react-native';
import styles from './GstDropdown.scss';

interface GstDropdownProps {
    value: number;
    onChange: (rate: number) => void;
    label?: string;
}

const GST_RATES = [0, 5, 12, 18, 28, 40];

const GstDropdown: React.FC<GstDropdownProps> = ({ value, onChange, label = "GST Rate" }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}

            <TouchableOpacity
                style={styles.dropdownButton}
                onPress={() => setIsOpen(true)}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={styles.dropdownText}>{value}</Text>
                    <Percent size={16} color="#6b7280" />
                </View>
                <ChevronDown size={16} color="#6b7280" />
            </TouchableOpacity>

            <Modal visible={isOpen} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Select GST Rate</Text>
                            <TouchableOpacity onPress={() => setIsOpen(false)}>
                                <X size={20} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView>
                            {GST_RATES.map((rate) => (
                                <TouchableOpacity
                                    key={rate}
                                    style={styles.optionItem}
                                    onPress={() => {
                                        onChange(rate);
                                        setIsOpen(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.optionText,
                                        value === rate && styles.optionTextSelected
                                    ]}>
                                        {rate}% GST
                                    </Text>

                                    {value === rate && (
                                        <View style={styles.optionBadge}>
                                            <Text style={styles.optionBadgeText}>SELECTED</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default GstDropdown;
