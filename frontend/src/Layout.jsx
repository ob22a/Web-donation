import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useAuth } from './context/AuthContext';

/**
 * Main layout component that wraps all pages.
 * 
 * Architecture: Provides consistent layout structure (Header, Sidebar, main content)
 * across all routes. Uses React Router's Outlet to render child route components.
 * 
 * Drawer state: Manages sidebar/drawer open/close state. The drawer is only shown
 * when user is logged in (conditional rendering based on isLoggedIn).
 */
const Layout = () => {
    const { isLoggedIn, user } = useAuth();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    /**
     * Toggle drawer open/close state.
     * 
     * Why useCallback: This function is passed to Header and Sidebar components.
     * Without useCallback, it would be recreated on every render, causing those
     * components to re-render unnecessarily (if they're memoized).
     */
    const toggleDrawer = useCallback(() => {
        setIsDrawerOpen(prev => !prev);
    }, []); // No deps: setState function is stable

    return (
        <div className={isDrawerOpen ? 'drawer-open' : ''}>
            {/* Header is always visible */}
            <Header onToggleDrawer={toggleDrawer} />
            
            {/* Sidebar only shown when user is logged in */}
            {isLoggedIn && <Sidebar isOpen={isDrawerOpen} onToggleDrawer={toggleDrawer} />}
            
            {/* Outlet renders the matched child route component */}
            <main className="page-content">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
