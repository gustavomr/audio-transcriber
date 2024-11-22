"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Loader2 } from "lucide-react";
import { userContext } from '@/context/UserContext';


export default function SuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setAmount, setPlan } = userContext();


  useEffect(() => {
    const sessionId = searchParams?.get('session_id');
    
    if (!sessionId || !user) {
      return;
    }

    const verifyPayment = async () => {
        console.log("Verificando pagamento")
      try {
        // Verify the payment and update credits
        const response = await fetch('/api/verify-payment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            userId: user.id,
          }),
        });

        
        const credits = await response.json();
        console.log(credits)
        setAmount(credits.amount)
        setPlan(credits.plan)

        if (!response.ok) {
          throw new Error('Payment verification failed');
        }

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/');
        }, 3000);

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <h1 className="mt-4 text-xl font-semibold">Processing your payment...</h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-xl font-semibold text-red-500">Error: {error}</h1>
        <button 
          onClick={() => router.push('/dashboard')}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-semibold text-green-500">Payment Successful!</h1>
      <p className="mt-2 text-gray-600">Your credits have been added to your account.</p>
      <p className="mt-4 text-sm text-gray-500">Redirecting to dashboard...</p>
    </div>
  );
} 