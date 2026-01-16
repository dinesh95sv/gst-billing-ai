
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Home, Box, Users, Factory, BarChart3 } from 'lucide-react-native';
import { usePathname, useRouter } from 'expo-router';

import styles from './Layout.scss';

const NavItem: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <TouchableOpacity
    onPress={onClick}
    style={styles.navItem}
    activeOpacity={0.7}
  >
    <View style={[styles.iconContainer, active && styles.activeIconContainer]}>
      {/* Fix: Cast icon to React.ReactElement<any> to allow additional props like size and color */}
      {React.cloneElement(icon as React.ReactElement<any>, {
        size: 24,
        color: active ? '#3b82f6' : '#64748b',
        strokeWidth: active ? 2.5 : 2
      })}
    </View>
    <Text style={[styles.navLabel, active && styles.activeNavLabel]}>{label}</Text>
  </TouchableOpacity>
);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { path: '/', label: 'Home', icon: <Home /> },
    { path: '/products', label: 'Products', icon: <Box /> },
    { path: '/customers', label: 'Customers', icon: <Users /> },
    { path: '/factories', label: 'Factories', icon: <Factory /> },
    { path: '/reports', label: 'Reports', icon: <BarChart3 /> },
  ];

  const tabBarPaddingBottom = Platform.OS === 'ios' ? 24 : 12;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          {children}
        </View>

        <View style={[styles.tabBar, { paddingBottom: tabBarPaddingBottom }]}>
          {navItems.map((item) => (
            <NavItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              active={pathname === item.path}
              onClick={() => router.push(item.path as any)}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Layout;