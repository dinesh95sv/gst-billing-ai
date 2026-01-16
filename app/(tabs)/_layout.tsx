import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
                tabBarInactiveTintColor: '#9BA1A6',
                headerShown: false,
                tabBarButton: HapticTab,
                tabBarLabelPosition: 'below-icon',
                tabBarStyle: {
                    backgroundColor: 'rgba(12, 15, 20, 0.95)',
                    position: 'absolute',
                    borderTopWidth: 0,
                    elevation: 0,
                    height: Platform.OS === 'ios' ? 90 : 72,
                    paddingBottom: Platform.OS === 'ios' ? 30 : 12,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                    marginTop: 0,
                },
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="products/index"
                options={{
                    title: 'Products',
                    tabBarIcon: ({ color }) => <IconSymbol size={24} name="archivebox.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="customers/index"
                options={{
                    title: 'Customers',
                    tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.2.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="factories/index"
                options={{
                    title: 'Factories',
                    tabBarIcon: ({ color }) => <IconSymbol size={24} name="building.2.fill" color={color} />,
                }}
            />
            <Tabs.Screen
                name="reports/index"
                options={{
                    title: 'Reports',
                    tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.bar.fill" color={color} />,
                }}
            />

            {/* Hidden routes to keep bottom tab bar visible */}
            <Tabs.Screen name="invoices/index" options={{ href: null }} />
            <Tabs.Screen name="customers/add" options={{ href: null }} />
            <Tabs.Screen name="factories/add" options={{ href: null }} />
            <Tabs.Screen name="products/add" options={{ href: null }} />
            <Tabs.Screen name="invoices/create" options={{ href: null }} />
            <Tabs.Screen name="reports/preview" options={{ href: null }} />



            <Tabs.Screen name="customers/[id]/edit" options={{ href: null }} />
            <Tabs.Screen name="factories/[id]/edit" options={{ href: null }} />
            <Tabs.Screen name="invoices/[id]/edit" options={{ href: null }} />
            <Tabs.Screen name="products/[id]/edit" options={{ href: null }} />
            <Tabs.Screen name="invoices/[id]/index" options={{ href: null }} />
        </Tabs>
    );


}
