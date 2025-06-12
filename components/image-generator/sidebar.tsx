"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import { CreditCard, History, ImageIcon, LogOut, Palette, Settings, Sparkles, User } from "lucide-react"
import type { Session } from "next-auth"
import { signOut } from "next-auth/react"

interface ImageGeneratorSidebarProps {
  activeView: "create" | "history" | "anime" | "advanced"
  setActiveView: (view: "create" | "history" | "anime" | "advanced") => void
  session: Session | null
}

const menuItems = [
  {
    id: "create" as const,
    title: "Create Images",
    icon: Sparkles,
    description: "Generate AI images",
    badge: "New",
  },
  {
    id: "history" as const,
    title: "My Gallery",
    icon: History,
    description: "View generated images",
  },
  {
    id: "anime" as const,
    title: "Anime Studio",
    icon: Palette,
    description: "Transform to anime style",
  },
  {
    id: "advanced" as const,
    title: "Advanced Mode",
    icon: Settings,
    description: "Fine-tune generation",
  },
]

export function ImageGeneratorSidebar({ activeView, setActiveView, session }: ImageGeneratorSidebarProps) {
  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="border-b border-border/40 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-blue-600">
            <ImageIcon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-semibold">AI Studio</h1>
            <p className="text-sm text-muted-foreground">Create & Transform</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Generation Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => setActiveView(item.id)}
                    isActive={activeView === item.id}
                    className="w-full justify-start h-12 px-3"
                  >
                    <item.icon className="h-5 w-5" />
                    <div className="flex flex-col items-start flex-1 min-w-0">
                      <div className="flex items-center gap-2 w-full">
                        <span className="font-medium truncate">{item.title}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground truncate">{item.description}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="my-4" />

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Quick Stats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="space-y-3 p-3 rounded-lg bg-muted/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Credits</span>
                <span className="font-medium">∞</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Generated</span>
                <span className="font-medium">24</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">This Month</span>
                <span className="font-medium">12</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-border/40 p-4">
        {session?.user ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback className="text-xs">{session.user.name?.charAt(0) || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session.user.name || "User"}</p>
                <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1">
                <CreditCard className="h-4 w-4 mr-1" />
                Billing
              </Button>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button className="w-full">
            <User className="h-4 w-4 mr-2" />
            Sign In
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
