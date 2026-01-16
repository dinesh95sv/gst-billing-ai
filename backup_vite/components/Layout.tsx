
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Home, Box, Users, Factory, BarChart3 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

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
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Home', icon: <Home /> },
    { path: '/products', label: 'Products', icon: <Box /> },
    { path: '/customers', label: 'Customers', icon: <Users /> },
    { path: '/factories', label: 'Factories', icon: <Factory /> },
    { path: '/reports', label: 'Reports', icon: <BarChart3 /> },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.content}>
          {children}
        </View>

        <View style={styles.tabBar}>
          {navItems.map((item) => (
            <NavItem 
              key={item.path}
              icon={item.icon}
              label={item.label}
              active={location.pathname === item.path}
              onClick={() => navigate(item.path)}
            />
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0c0f14',
  },
  container: {
    flex: 1,
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
    backgroundColor: '#0c0f14',
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#1e293b',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    justifyContent: 'space-around',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 64,
  },
  iconContainer: {
    marginBottom: 4,
    opacity: 0.6,
  },
  activeIconContainer: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'capitalize',
  },
  activeNavLabel: {
    color: '#3b82f6',
  },
});

export default Layout;