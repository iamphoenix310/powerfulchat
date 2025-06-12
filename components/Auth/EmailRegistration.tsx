"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import bcrypt from "bcryptjs"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle2, Eye, EyeOff } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"


export default function EmailRegister() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)

  const [usernameAvailable, setUsernameAvailable] = useState(true)
  const [emailAvailable, setEmailAvailable] = useState(true)
  const [usernameChecking, setUsernameChecking] = useState(false)
  const [emailChecking, setEmailChecking] = useState(false)

  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()

  useEffect(() => {
    const delayCheck = setTimeout(async () => {
      if (username.length > 2) {
        setUsernameChecking(true)
        const res = await fetch(`/api/check-username?username=${username}`)
        const data = await res.json()
        setUsernameAvailable(data.available)
        setUsernameChecking(false)
      }
    }, 400)
    return () => clearTimeout(delayCheck)
  }, [username])

  useEffect(() => {
    const delayCheck = setTimeout(async () => {
      if (email.length > 5 && email.includes("@")) {
        setEmailChecking(true)
        const res = await fetch(`/api/check-email?email=${email}`)
        const data = await res.json()
        setEmailAvailable(data.available)
        setEmailChecking(false)
      }
    }, 400)
    return () => clearTimeout(delayCheck)
  }, [email])

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return 0
    if (pwd.length < 6) return 25

    let score = 25

    // Add points for length
    if (pwd.length >= 8) score += 15
    if (pwd.length >= 10) score += 10

    // Add points for complexity
    if (/[A-Z]/.test(pwd)) score += 10
    if (/[0-9]/.test(pwd)) score += 10
    if (/[^A-Za-z0-9]/.test(pwd)) score += 15

    return Math.min(score, 100)
  }

  const getStrengthLabel = (strength: number) => {
    if (strength === 0) return ""
    if (strength < 30) return "Weak"
    if (strength < 60) return "Medium"
    if (strength < 80) return "Good"
    return "Strong"
  }

  const strengthScore = getPasswordStrength(password)
  const strengthLabel = getStrengthLabel(strengthScore)

  const getStrengthColor = (strength: number) => {
    if (strength < 30) return "bg-red-500"
    if (strength < 60) return "bg-yellow-500"
    if (strength < 80) return "bg-green-400"
    return "bg-green-600"
  }

  // Poll to wait until user is indexed in Sanity
const waitForUser = async (email: string, tries = 5) => {
  for (let i = 0; i < tries; i++) {
    const res = await fetch(`/api/check-email?email=${encodeURIComponent(email)}`)
    const data = await res.json()
    if (!data.available) return true // ✅ user exists now
    await new Promise((r) => setTimeout(r, 1000)) // wait 1 second
  }
  return false
}


const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault()
  setError("")
  setLoading(true)

  if (!usernameAvailable) {
    setError("Username is already taken.")
    setLoading(false)
    return
  }

  if (!emailAvailable) {
    setError("Email is already in use.")
    setLoading(false)
    return
  }

  if (password !== confirmPassword) {
  setError("Passwords do not match.")
  setLoading(false)
  return
}


  try {
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, name, username, password }),
    })

    const data = await res.json()

    if (res.ok) {
      setShowSuccess(true)
      await waitForUser(email) // ✅ Ensure user is available in Sanity

      const loginResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (loginResult?.ok) {
        router.push("/images") // ✅ Redirect to home or dashboard
      } else {
        setError("Account created, but login failed. Please try manually.")
      }
    } else {
      setError(data.error || "Something went wrong.")
    }
  } catch (err) {
    console.error("Signup error:", err)
    setError("Something went wrong.")
  }

  setLoading(false)
}
  if (showSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-center">Account Created!</h3>
        <p className="text-gray-500 text-center">Taking you to wonderful Images!</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Pankaj Sharma"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">
          Username
          {username.length > 2 && (
            <span className="ml-2">
              {usernameChecking ? (
                <Loader2 className="inline h-3 w-3 animate-spin text-gray-500" />
              ) : usernameAvailable ? (
                <span className="text-green-600 text-xs">✓ Available</span>
              ) : (
                <span className="text-red-500 text-xs">Already taken</span>
              )}
            </span>
          )}
        </Label>
        <Input
          id="username"
          type="text"
          placeholder="galaxydancer"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          required
          className={!usernameAvailable ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">
          Email
          {email.length > 5 && email.includes("@") && (
            <span className="ml-2">
              {emailChecking ? (
                <Loader2 className="inline h-3 w-3 animate-spin text-gray-500" />
              ) : emailAvailable ? (
                <span className="text-green-600 text-xs">✓ Available</span>
              ) : (
                <span className="text-red-500 text-xs">Already in use</span>
              )}
            </span>
          )}
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className={!emailAvailable ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
      </div>

      <div className="space-y-2">
       <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2 text-gray-500"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-2 text-gray-500"
            >
              {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {password && (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Strength: </span>
              <span
                className={`text-xs ${
                  strengthScore < 30 ? "text-red-500" : strengthScore < 60 ? "text-yellow-500" : "text-green-600"
                }`}
              >
                {strengthLabel}
              </span>
            </div>
            <div className="relative h-1 w-full bg-gray-200 rounded">
              <div
                className={`absolute top-0 left-0 h-full rounded transition-all duration-300 ${getStrengthColor(
                  strengthScore
                )}`}
                style={{ width: `${strengthScore}%` }}
              />
            </div>
            <Progress value={strengthScore} className="h-1" color={getStrengthColor(strengthScore)} />
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

        <p className="text-xs text-gray-500 text-center">
          By continuing, you agree to our{" "}
          <Link href="/n/terms" className="underline text-blue-600 hover:text-blue-800">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/n/privacy" className="underline text-blue-600 hover:text-blue-800">
            Privacy Policy
          </Link>.
        </p>



      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating Account...
          </>
        ) : (
          "Sign Up"
        )}
      </Button>
    </form>
  )
}
