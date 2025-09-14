"use client";

import { SignupForm } from "@/components/auth/signup-form"
import Link from "next/link"
import { Suspense, useEffect } from "react"
import { useRouter } from "next/navigation"


export default function SignupPage() {

  useEffect(() => {
    const token = localStorage.getItem('JWTToken');
    if (token) {
      useRouter().push('/feed')
    }
  }, [])
  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SocialConnect</h1>
            <p className="text-gray-600">Connect with friends and share your moments</p>
          </div>
          <SignupForm />
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="cursor-pointer font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
  )
}
