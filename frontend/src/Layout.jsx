import React, { useState, useCallback } from "react";
import { Outlet } from "react-router-dom";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import { useAuth } from "./context/AuthContext";

const Layout = () => {
  const { isLoggedIn, user } = useAuth();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const toggleDrawer = useCallback(() => {
    setIsDrawerOpen((prev) => !prev);
  }, []);
  return (
    <div className={isDrawerOpen ? "drawer-open" : ""}>
      <Header onToggleDrawer={toggleDrawer} />

      {isLoggedIn && (
        <Sidebar isOpen={isDrawerOpen} onToggleDrawer={toggleDrawer} />
      )}

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
