import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import styles from './MonthYearPicker.scss';

interface MonthYearPickerProps {
    visible: boolean;
    value: Date;
    onClose: () => void;
    onChange: (date: Date) => void;
}

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({ visible, value, onClose, onChange }) => {
    const [selectedYear, setSelectedYear] = useState(value.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(value.getMonth());

    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const handleYearChange = (delta: number) => {
        setSelectedYear(prev => prev + delta);
    };

    const handleConfirm = () => {
        const newDate = new Date(selectedYear, selectedMonth, 1);
        onChange(newDate);
        onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.modalOverlay} onPress={onClose}>
                <Pressable style={styles.pickerContainer}>
                    <View style={styles.header}>
                        <Text style={styles.yearText}>{selectedYear}</Text>
                        <View style={styles.yearControls}>
                            <TouchableOpacity onPress={() => handleYearChange(-1)} style={styles.controlButton}>
                                <ChevronLeft size={20} color="#fff" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleYearChange(1)} style={styles.controlButton}>
                                <ChevronRight size={20} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.monthsGrid}>
                        {months.map((month, index) => (
                            <TouchableOpacity
                                key={month}
                                style={[
                                    styles.monthItem,
                                    selectedMonth === index && styles.monthItemSelected
                                ]}
                                onPress={() => setSelectedMonth(index)}
                            >
                                <Text style={[
                                    styles.monthText,
                                    selectedMonth === index && styles.monthTextSelected
                                ]}>
                                    {month}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <View style={styles.footer}>
                        <TouchableOpacity onPress={onClose} style={[styles.footerButton, styles.cancelButton]}>
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleConfirm} style={[styles.footerButton, styles.confirmButton]}>
                            <Text style={styles.confirmButtonText}>Select Period</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

export default MonthYearPicker;
