"use client"
import React, {useState, useEffect} from 'react';
import { Headphones } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, useAuth, UserButton } from '@clerk/nextjs';
import { PricingButton } from './pricing-button';
import { Button } from './ui/button';
import { Badge } from "@/components/ui/badge"; // Make sure you have this shadcn/ui component
import { userContext } from '../context/UserContext';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Header({ children }: LayoutProps) {

 // const [amount, setAmount] = useState(0);
 // const [plan, setPlan] = useState<string>("");
  const { getToken} = useAuth();

  const { amount, plan, setAmount, setPlan } = userContext();


  useEffect(() => {
    loadUser();
  }, []);

  const formatTimeFromSeconds = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    }
    return `${minutes}m ${remainingSeconds}s`;
  };

  const loadUser = async () => {
    const response = await fetch('/api/user', {
      method: "GET",
      headers: {
        'Authorization': 'Bearer ' + await getToken()
      }
    });

    const user = await response.json();
    setAmount(user?.amount)
    setPlan(user?.plan)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Headphones className="w-6 h-6 text-blue-500" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Audio Transcribe</h1>
            </div>
            <SignedOut>
              <div className="flex items-center space-x-4">
                <SignInButton>
                  <Button>Sign In</Button>
                </SignInButton>
              </div>
            </SignedOut>

            <SignedIn>
              <div className="flex items-center space-x-4">
                <div className="flex items-center px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={plan === "Free" ? "secondary" : "default"}
                        className={`
                          ${plan === "Free" 
                            ? "bg-gray-100 text-gray-900 hover:bg-gray-100" 
                            : "bg-blue-100 text-blue-900 hover:bg-blue-100"
                          }
                          text-xs py-0.5 px-2
                        `}
                      >
                        {plan === "FREE" ? "Free" : "Pro"}
                      </Badge>
                      <div className="flex items-center text-gray-900">
                        <span className="text-sm font-semibold">{formatTimeFromSeconds(amount)}</span>
                        <span className="text-xs text-gray-500 ml-1">left</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <PricingButton />
                <UserButton />
              </div>
            </SignedIn>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}