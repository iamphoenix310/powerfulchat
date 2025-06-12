"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Props = {
  mode: "login" | "signup"
  setMode: (mode: "login" | "signup") => void
}

export default function AuthTabs({ mode, setMode }: Props) {
  return (
    <Tabs value={mode} onValueChange={(value) => setMode(value as "login" | "signup")} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="login">Login</TabsTrigger>
        <TabsTrigger value="signup">Sign Up</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
