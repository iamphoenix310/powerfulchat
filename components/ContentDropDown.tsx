"use client"

import { AnimatePresence, motion } from "framer-motion"
import { ChevronDown, ImageIcon, Music, Package, Users } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"

export const ContentDropdown = () => {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const contentItems = [
    { href: "/people", label: "Famous People", icon: Users, gradient: "from-blue-400 to-cyan-500" },
    { href: "/products", label: "Products", icon: Package, gradient: "from-green-400 to-emerald-500" },
    { href: "/images", label: "Images", icon: ImageIcon, gradient: "from-purple-400 to-violet-500" },
    { href: "/music", label: "Music", icon: Music, gradient: "from-orange-400 to-yellow-500" },
  ]

  return (
    <div ref={dropdownRef} className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-3 py-2.5 text-sm font-medium rounded-xl text-left text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/50 hover:to-gray-700/50 transition-all duration-200 group"
      >
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-400 to-pink-500 shadow-lg">
            <Package className="size-4 text-white" />
          </div>
          <span>Content</span>
        </div>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""} group-hover:text-purple-400`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-2 ml-4 overflow-hidden"
          >
            <div className="flex flex-col gap-1 pl-4 border-l border-gray-700/50">
              {contentItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="group flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/30 hover:to-gray-700/30 transition-all duration-200"
                  >
                    <div
                      className={`p-1 rounded-md bg-gradient-to-r ${item.gradient} opacity-70 group-hover:opacity-100 transition-opacity`}
                    >
                      <item.icon className="size-3 text-white" />
                    </div>
                    <span className="group-hover:translate-x-0.5 transition-transform duration-200">{item.label}</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
