"use client"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Home, Compass, Sparkles, LogOut, UserCircle } from "lucide-react"
import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"

export function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [hasResults, setHasResults] = useState(false)
  const { user, logout } = useAuth()
  const [showProfileIcon, setShowProfileIcon] = useState(true)

  useEffect(() => {
    const checkResults = () => {
      if (typeof window !== "undefined") {
        const currentAnalysis = sessionStorage.getItem("current_analysis")
        setHasResults(!!currentAnalysis)
      }
    }

    checkResults()
    const interval = setInterval(checkResults, 500)
    return () => clearInterval(interval)
  }, [pathname])

  useEffect(() => {
    const isAnalysisScreen = pathname === "/results" || pathname.startsWith("/results/")
    const isAnalyzingSession = typeof window !== "undefined" && sessionStorage.getItem("is_analyzing") === "true"
    setShowProfileIcon(!isAnalysisScreen && !isAnalyzingSession)
  }, [pathname])

  const navItems = [
    { href: "/", label: "홈", icon: Home },
    ...(hasResults
      ? [
          {
            href: "/results",
            label: "분석",
            icon: Sparkles,
          },
        ]
      : []),
    {
      href: "/explore",
      label: "탐색",
      icon: Compass,
    },
  ]

  const getActiveState = (href: string) => {
    if (href === "/results") {
      return pathname === "/results" || pathname.startsWith("/results/")
    }
    return pathname === href
  }

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      logout()
      router.push("/")
    }
  }

  const handleGuestProfileClick = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openAuthModal"))
    }
  }

  return (
    <>
      {user?.isGuest && showProfileIcon && (pathname === "/" || pathname === "/explore") && (
        <div className="fixed top-4 right-4 z-50">
          <motion.button
            onClick={handleGuestProfileClick}
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="flex items-center gap-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-full px-3 py-1.5 shadow-sm hover:shadow-md transition-all cursor-pointer"
          >
            <UserCircle className="w-4 h-4 text-gray-600" />
            <span className="text-xs font-medium text-gray-700">비회원</span>
          </motion.button>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 pb-safe pointer-events-none">
        <div className="backdrop-blur-xl bg-white/98 border-t border-gray-200 shadow-[0_-2px_16px_rgba(0,0,0,0.04)] px-3 py-1.5 safe-area-inset-bottom pointer-events-auto">
          <div className="flex items-center justify-around max-w-md mx-auto gap-1.5">
            <AnimatePresence mode="popLayout">
              {navItems.map((item) => {
                const isActive = getActiveState(item.href)
                const Icon = item.icon

                return (
                  <motion.div
                    key={item.href}
                    initial={item.href === "/results" ? { scale: 0, opacity: 0 } : false}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                      mass: 0.8,
                    }}
                    className="flex-1"
                  >
                    <Link href={item.href} className="block">
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={cn(
                          "relative px-3 py-1.5 rounded-xl transition-all duration-200 flex flex-col items-center gap-0.5",
                          isActive
                            ? "bg-gray-900 text-white shadow-md"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                      </motion.div>
                    </Link>
                  </motion.div>
                )
              })}

              {user && !user.isGuest && (
                <motion.div
                  key="logout"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    mass: 0.8,
                  }}
                  className="flex-1"
                >
                  <button onClick={handleLogout} className="block w-full">
                    <motion.div
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className="relative px-3 py-1.5 rounded-xl transition-all duration-200 flex flex-col items-center gap-0.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-[10px] font-medium">로그아웃</span>
                    </motion.div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>
    </>
  )
}
