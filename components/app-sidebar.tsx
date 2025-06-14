"use client"

import { ContentDropdown } from "@/components/ContentDropDown"
import SignIn from "@/components/GoogleLogin/singIn"
import GlobalSearchBar from "@/components/Search/GlobalSearchBar"
import { ToolsDropdown } from "@/components/ToolsDropdown"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { faXTwitter } from "@fortawesome/free-brands-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { motion } from "framer-motion"
import { Crown, Instagram, MoreVertical, Plus, Send, Sparkles, Star, Upload } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Suspense } from "react"
import { ChatHistorySkeleton } from "./sidebar/chat-history-skeleton"
import { ChatHistorySectionWrapper } from "./sidebar/chat-history-wrapper"

export default function AppSidebar() {
  const pathname = usePathname()

  const getLinkClasses = (path: string) =>
    `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
      pathname === path
        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-white shadow-lg shadow-blue-500/10 border border-blue-500/30"
        : "text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 hover:shadow-md"
    }`

  const menuItems = [
    { href: "/", label: "New Chat", icon: Plus, gradient: "from-green-400 to-blue-500" },
    { href: "/famous-people-born-today", label: "Born Today", icon: Star, gradient: "from-yellow-400 to-orange-500" },
    { href: "/upload", label: "Upload", icon: Upload, gradient: "from-purple-400 to-pink-500" },
    { href: "/subscription", label: "Subscribe", icon: Crown, gradient: "from-amber-400 to-yellow-500" },
  ]

  return (
    <Sidebar side="left" variant="sidebar" collapsible="offcanvas" className="border-r border-gray-800/50">
      {/* Header */}
      <SidebarHeader className="border-b border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-gray-800/30 backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Image
                src="/images/logo-powerful.png"
                alt="Powerful"
                width={130}
                height={30}
                className="w-130 h-30 object-contain transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <SidebarTrigger className="h-8 w-8 rounded-lg hover:bg-gray-800/50 transition-colors" />

            {/* Three Dots Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-lg hover:bg-gray-800/50 transition-colors flex items-center justify-center text-gray-400 hover:text-white mr-2">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-64 bg-gray-900/95 border-gray-800/50 backdrop-blur-sm"
                sideOffset={8}
              >
                {/* Brand Section */}
                <div className="p-4 text-center border-b border-gray-800/50">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Sparkles className="size-4 text-blue-400" />
                    <p className="text-sm font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      Powerful
                    </p>
                    <Sparkles className="size-4 text-purple-400" />
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center gap-3 mb-4">
                    {[
                      { href: "https://x.com/powerfulcreat", icon: "twitter", color: "hover:text-blue-400" },
                      { href: "https://instagram.com/powerfulcrea", icon: "instagram", color: "hover:text-pink-400" },
                      { href: "https://t.me/powerfulcrea", icon: "telegram", color: "hover:text-blue-400" },
                    ].map((social, index) => (
                      <Link
                        key={index}
                        href={social.href}
                        target="_blank"
                        className={`p-2 rounded-lg bg-gray-800/50 text-gray-400 ${social.color} transition-all duration-200 hover:bg-gray-700/50 hover:scale-110 hover:shadow-lg`}
                      >
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                          {social.icon === "twitter" ? (
                            <FontAwesomeIcon icon={faXTwitter} size="sm" />
                          ) : social.icon === "instagram" ? (
                            <Instagram size={16} />
                          ) : (
                            <Send size={16} />
                          )}
                        </motion.div>
                      </Link>
                    ))}
                  </div>

                  {/* Legal Links */}
                  <div className="flex justify-center gap-4 text-[10px] text-gray-500">
                    {[
                      { href: "/n/privacy", label: "Privacy" },
                      { href: "/n/terms", label: "Terms" },
                      { href: "/n/refund", label: "Refund" },
                    ].map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="hover:text-gray-300 transition-colors duration-200 hover:underline"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-gray-800/50" />

               
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="flex flex-col h-full bg-gradient-to-b from-gray-900/30 to-gray-900/60 backdrop-blur-sm">
           {/* Sign In Section */}
          <div className="p-4">
                  <div className="relative">
                    <SignIn />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            </div>
        {/* Search Bar */}
        <div className="px-4 py-4">
          <div className="relative">
            <GlobalSearchBar />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        </div>

        {/* Main Menu */}
        <div className="px-4 space-y-2">
          <SidebarMenu className="space-y-1">
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild className="p-0">
                  <Link href={item.href} className={getLinkClasses(item.href)}>
                    <div className={`p-1.5 rounded-lg bg-gradient-to-r ${item.gradient} shadow-lg`}>
                      <item.icon className="size-4 text-white" />
                    </div>
                    <span className="font-medium">{item.label}</span>
                    {pathname === item.href && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute right-2 w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full shadow-lg"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>

          <SidebarSeparator className="bg-gray-800/50 my-4" />

          {/* Dropdowns */}
          <div className="space-y-2">
            <div className="relative group">
              <ToolsDropdown />
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <div className="relative group">
              <ContentDropdown />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
          </div>
        </div>

        <SidebarSeparator className="bg-gray-800/50 my-4" />

        {/* Chat History - Now takes up much more space */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <div className="mb-3">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">Chat History</h3>
          </div>
          <div className="relative">
            <Suspense fallback={<ChatHistorySkeleton />}>
              <ChatHistorySectionWrapper />
            </Suspense>
          </div>
        </div>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
