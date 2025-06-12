"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import EmailLogin from "./EmailLogin"
import EmailRegister from "./EmailRegistration"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


type Mode = "login" | "signup"

interface AuthFormHomeProps {
  defaultMode?: Mode
}

export default function AuthFormHome({ defaultMode = "signup" }: AuthFormHomeProps) {
  const [mode, setMode] = useState<Mode>(defaultMode)

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
        {/* Tabs without router push */}
        <div className="flex justify-center space-x-2 bg-muted p-1 rounded-md">
          <button
            className={`px-4 py-1 text-sm font-medium rounded-md transition ${
              mode === "login" ? "bg-white shadow-sm" : "text-muted-foreground"
            }`}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            className={`px-4 py-1 text-sm font-medium rounded-md transition ${
              mode === "signup" ? "bg-white shadow-sm" : "text-muted-foreground"
            }`}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        {/* Animated login/signup form */}
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
