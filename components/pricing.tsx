import { Button } from "@/components/ui/button";
import {SignInButton } from "@clerk/nextjs";
import { Check } from "lucide-react";
import Link from "next/link";

export default function Pricing() {
  return (
    <div className=" bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Simple and transparent pricing
          </h2>
        </div>

        {/* Pricing Cards */}
        <div className="mt-8 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-900">Free Plan</h3>
            <p className="mt-4 text-gray-500">Perfect for getting started</p>
            <p className="mt-8">
              <span className="text-4xl font-extrabold text-gray-900">$0</span>
              <span className="text-gray-500">/month</span>
            </p>
            <ul className="mt-8 space-y-4">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500" />
                <span className="ml-3 text-gray-600">2 hours of transcription</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500" />
                <span className="ml-3 text-gray-600">Basic support</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500" />
                <span className="ml-3 text-gray-600">Standard quality</span>
              </li>
            </ul>
            <Button asChild className="mt-8 w-full">
            <SignInButton>
                  <Button>Get Started</Button>
                </SignInButton>
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-blue-500">
            <h3 className="text-2xl font-semibold text-gray-900">Pro Plan</h3>
            <p className="mt-4 text-gray-500">For serious transcription needs</p>
            <p className="mt-8">
              <span className="text-4xl font-extrabold text-gray-900">$10</span>
              <span className="text-gray-500">/10 hours</span>
            </p>
            <ul className="mt-8 space-y-4">
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500" />
                <span className="ml-3 text-gray-600">10 hours of transcription</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500" />
                <span className="ml-3 text-gray-600">Priority support</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500" />
                <span className="ml-3 text-gray-600">High-quality transcription</span>
              </li>
              <li className="flex items-center">
                <Check className="h-5 w-5 text-green-500" />
                <span className="ml-3 text-gray-600">Advanced features</span>
              </li>
            </ul>
            <Button asChild className="mt-8 w-full bg-blue-500 hover:bg-blue-600">
              <Link href="/sign-up?plan=pro">Upgrade Now</Link>
            </Button>
          </div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Need more hours? Contact us for custom enterprise plans.
          </p>
        </div>
      </div>
    </div>
  );
}