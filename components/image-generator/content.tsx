"use client"

import { Badge } from "@/components/ui/badge"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { History, ImageIcon, Sparkles } from "lucide-react"
import type { Session } from "next-auth"
import { CreateImageView } from "./views/create-image-view"
import { ImageHistoryView } from "./views/image-history-view"

interface ImageGeneratorContentProps {
  activeView: "create" | "history"
  setActiveView: (view: "create" | "history") => void
  session: Session | null
  setShowLoginModal: (show: boolean) => void
}

const viewTitles = {
  create: "Create Images",
  history: "My Gallery",
}

const viewIcons = {
  create: Sparkles,
  history: History,
}

export function ImageGeneratorContent({
  activeView,
  setActiveView,
  session,
  setShowLoginModal,
}: ImageGeneratorContentProps) {
  const Icon = viewIcons[activeView]

  return (
    <>
      {/* Header with navigation tabs */}
      <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border/40 px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <div className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-purple-600" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage className="font-medium">AI Image Studio</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="ml-auto flex gap-2">
          <Button
            variant={activeView === "create" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("create")}
            className="h-8"
          >
            <Sparkles className="w-4 h-4 mr-1" />
            Create
            <Badge variant="secondary" className="ml-1 text-xs px-1">
              New
            </Badge>
          </Button>
          <Button
            variant={activeView === "history" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveView("history")}
            className="h-8"
          >
            <History className="w-4 h-4 mr-1" />
            Gallery
          </Button>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-1 overflow-auto bg-background">
        <div className="container mx-auto p-6">
          {/* Page title with icon */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{viewTitles[activeView]}</h1>
              <p className="text-sm text-muted-foreground">
                {activeView === "create" && "Generate stunning AI images with MiniMax technology"}
                {activeView === "history" && "Browse and manage all your generated images"}
              </p>
            </div>
          </div>

          {/* View content */}
          {activeView === "create" && <CreateImageView session={session} setShowLoginModal={setShowLoginModal} />}
          {activeView === "history" && <ImageHistoryView session={session} />}
        </div>
      </main>
    </>
  )
}
