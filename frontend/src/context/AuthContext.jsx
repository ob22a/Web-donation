import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { name: 'Donor User', role: 'donor' }

  const login = (role = 'donor') => {
    setUser({
      name: role === 'donor' ? 'Obssa Degefu' : 'Ethiopian NGO Founders',
      role
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
