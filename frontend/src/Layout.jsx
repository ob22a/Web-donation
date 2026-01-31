import React, { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import { useAuth } from './context/AuthContext';
const Layout = () => {
    const { isLoggedIn, user } = useAuth();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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
