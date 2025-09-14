import { useState, useCallback } from 'react';

/**
 * Navigation state type
 */
export type NavigationPage = 'main' | 'eda' | 'ml' | 'history';

/**
 * Custom hook for managing navigation state
 * 
 * This hook encapsulates navigation logic and provides a clean interface
 * for components to handle page navigation and sidebar state.
 */
export const useNavigation = () => {
  const [currentPage, setCurrentPage] = useState<NavigationPage>('main');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Navigation handlers
  const navigateToMain = useCallback(() => {
    setCurrentPage('main');
  }, []);

  const navigateToEDA = useCallback(() => {
    setCurrentPage('eda');
  }, []);

  const navigateToML = useCallback(() => {
    setCurrentPage('ml');
  }, []);

  const navigateToHistory = useCallback(() => {
    setCurrentPage('history');
  }, []);

  // Sidebar handlers
  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const collapseSidebar = useCallback(() => {
    setSidebarCollapsed(true);
  }, []);

  const expandSidebar = useCallback(() => {
    setSidebarCollapsed(false);
  }, []);

  return {
    // State
    currentPage,
    sidebarCollapsed,
    
    // Navigation functions
    navigateToMain,
    navigateToEDA,
    navigateToML,
    navigateToHistory,
    
    // Sidebar functions
    toggleSidebar,
    collapseSidebar,
    expandSidebar,
    
    // Direct state setters (for external control)
    setCurrentPage,
    setSidebarCollapsed
  };
};
