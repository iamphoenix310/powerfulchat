"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import EmailLogin from "./EmailLogin"
import EmailRegister from "./EmailRegistration"
import AuthTabs from "./AuthTabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthForm() {
  const searchParams = useSearchParams()
  const router = useRouter()

  // Default to login if no param
  const [mode, setMode] = useState<"login" | "signup">("login")

  // Read mode from URL when page first loads
  useEffect(() => {
    const urlMode = searchParams?.get("mode")
    if (urlMode === "login" || urlMode === "signup") {
      setMode(urlMode)
    }
  }, [searchParams])

  // Handle tab switch
  const handleTabSwitch = (newMode: "login" | "signup") => {
    setMode(newMode)

    if (searchParams) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("mode", newMode)

      router.push(`/auth?${params.toString()}`)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-lg border-gray-200 dark:border-gray-800">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">
          {mode === "login" ? "Welcome Back 👋" : "Create Your Account"}
        </CardTitle>
        <CardDescription className="text-center">
          {mode === "login" ? "Sign in to your account" : "Enter your information to get started"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Tabs */}
        <AuthTabs mode={mode} setMode={handleTabSwitch} />

        {/* Smooth Animate Form Switch */}
        <AnimatePresence mode="wait">
          {mode === "login" ? (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <EmailLogin />
            </motion.div>
          ) : (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <EmailRegister />
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
