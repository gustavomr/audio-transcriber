"use client";

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';

export function PricingButton() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.emailAddresses[0]?.emailAddress,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const { url } = await response.json();
     // console.log(await response.json())
      window.location.href = url;
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
      variant="outline"
      className="flex items-center justify-center p-2 rounded-lg shadow-lg transition-transform transform hover:scale-105 bg-white border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <span className="font-semibold">Buy Credits</span>
      )}
    </Button>
  );
} 