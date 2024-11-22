"use client"
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserContextType {
  amount: number;
  setAmount: (amount: number) => void;
  plan: string;
  setPlan: (plan: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [amount, setAmount] = useState(0);
  const [plan, setPlan] = useState<string>("");

  return (
    <UserContext.Provider value={{ amount, setAmount, plan, setPlan }}>
      {children}
    </UserContext.Provider>
  );
};

export const userContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}; 