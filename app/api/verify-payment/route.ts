import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client'


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: Request) {
  const prisma = new PrismaClient();
  try {
    const { sessionId, userId } = await req.json();
    console.log(sessionId, userId)
    // Verify the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Get the price ID from the session
    const lineItems = await stripe.checkout.sessions.listLineItems(sessionId);
    const priceId = lineItems.data[0].price?.id;

    // Define credits for each price tier
    const creditsByPriceId: Record<string, number> = {
      'price_1QNheYAJJQd7Uk6TIin2lJkf': 10,  // Replace with your actual price IDs and credit amounts
    //  'price_yyyyy': 500,
  //    'price_zzzzz': 1000,
    };


    // Update user's credits in your database
    const user = await prisma.user.update({
      where: { clerkId: userId },
      data: {
        amount: {
          increment: process.env.PAID_CREDITS_IN_SECONDS
        },
        plan: "PAID"
      }
    });

    // Log the transaction
   // await prisma.transaction.create({
    //  data: {
    //    userId,
   //     amount: creditsToAdd,
   //     type: 'CREDIT',
   //     stripeSessionId: sessionId
   //   }
  //  });

    return NextResponse.json(user);

  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}  