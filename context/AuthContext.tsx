import React, { createContext, useContext, useState } from 'react';
import { UserRole, ElectoralLocation } from '../types/election';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  assignedLocation?: ElectoralLocation;
  assignedPollingUnitCode?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (role: UserRole, email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 'usr_001',
    fullName: 'Aluya Ehijator',
    email: 'agent@aquila.ng',
    role: 'POLLING_UNIT_AGENT',
    assignedPollingUnitCode: 'PU-09-12-004',
    assignedLocation: {
      stateId: 'Lagos',
      lgaId: 'Ikeja',
      wardId: 'Oregun',
      pollingUnitId: 'PU-09-12-004',
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = (role: UserRole, email: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setUser({
        id: `usr_${Math.floor(Math.random() * 1000)}`,
        fullName: 'Authenticated User',
        email,
        role,
        assignedPollingUnitCode: role === 'POLLING_UNIT_AGENT' ? 'PU-09-12-004' : undefined,
        assignedLocation: {
          stateId: 'Lagos',
          lgaId: 'Ikeja',
          wardId: 'Oregun',
        },
      });
      setIsLoading(false);
    }, 600);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};