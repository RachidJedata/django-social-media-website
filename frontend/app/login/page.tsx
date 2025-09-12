'use client'

import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {

  const signUpPush = () => {
    const router = useRouter()
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const currentUrl = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "");
    const target = `/signup?callbackUrl=${encodeURIComponent(currentUrl)}`;
    router.push(target)
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">SocialConnect</h1>
          <p className="text-gray-600">Connect with friends and share your moments</p>
        </div>
        <LoginForm />
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/signup" className="cursor-pointer font-medium text-blue-600 hover:text-blue-500">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
