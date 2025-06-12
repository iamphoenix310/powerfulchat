"use client"

import { LoginModal } from "@/components/GoogleLogin/LoginModel"
import { ImageGeneratorContent } from "@/components/image-generator/content"
import { SidebarInset } from "@/components/ui/sidebar"
import { useSession } from "next-auth/react"
import { useState } from "react"

export default function ImageGeneratorPage() {
  const { data: session } = useSession()
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [activeView, setActiveView] = useState<"create" | "history">("create")

  return (
    <>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} />}
      <SidebarInset className="flex-1">
        <ImageGeneratorContent
          activeView={activeView}
          setActiveView={setActiveView}
          session={session}
          setShowLoginModal={setShowLoginModal}
        />
      </SidebarInset>
    </>
  )
}
