"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter, useSearchParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { LOGIN_MUTATION } from "@/lib/graphQL/queries"
import { useMutation } from "@apollo/client"

export function SignupForm() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [loginUser] = useMutation(LOGIN_MUTATION);


  const router = useRouter()
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");


  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {

      const fetchData = fetch('http://localhost:8000/create-user',
        {
          method: 'POST',
          headers: {
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            ...formData
          }),
        }
      )

      const response = await fetchData

      const data = await response.json()

      console.log("my data ", data);


      if (response.status === 201) {
        const response = await loginUser({
          variables: { username: formData.username, password: formData.password },
        });

        // Check if there were GraphQL errors
        if (response.errors) {
          console.error("GraphQL errors:", response.errors);
          throw new Error(response.errors[0].message);
        }

        if (!response.data) {
          throw new Error("No data received from server");
        }

        const token = response.data.tokenAuth.token;

        localStorage.setItem('JWTToken', token);

        router.push(callbackUrl || '/feed')
      }
      else {
        toast({
          title: "Account Hasn't been Created!",
          description: data.message[0] || "Try Again Later !",
        })
      }

    } catch (error) {
      toast({
        title: "Account Hasn't been Created!",
        description: String(error) || "Try Again Later !",
      })
    }
    finally {
      setIsLoading(false)
    }
    // Mock registration - in real app, this would call your auth API
    // setTimeout(() => {
    //   const newUser = {
    //     id: `550e8400-e29b-41d4-a716-${Date.now()}`,
    //     username: formData.username,
    //     email: formData.email,
    //     first_name: formData.firstName,
    //     last_name: formData.lastName,
    //   }

    //   localStorage.setItem("isAuthenticated", "true")
    //   localStorage.setItem("currentUser", JSON.stringify(newUser))

    //   toast({
    //     title: "Account created!",
    //     description: "Welcome to our social platform.",
    //   })
    //   router.push("/feed")
    //   setIsLoading(false)
    // }, 1000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }


  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
        <CardDescription>Join our community today</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
              // required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
              // required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              placeholder="johndoe"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
            // required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create Account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
