"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { AuthModal } from "@/components/auth-modal"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      setShowAuthModal(true)
    }
  }, [isLoading, user])

  useEffect(() => {
    const handleOpenAuthModal = () => {
      setShowAuthModal(true)
    }

    window.addEventListener("openAuthModal", handleOpenAuthModal)
    return () => window.removeEventListener("openAuthModal", handleOpenAuthModal)
  }, [])

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-3"
        >
          <Loader2 className="w-8 h-8 animate-spin text-gray-900 mx-auto" />
          <p className="text-sm text-gray-600">로딩중...</p>
        </motion.div>
      </div>
    )
  }

  if (!user && showAuthModal) {
    return <AuthModal onClose={() => setShowAuthModal(false)} />
  }

  return (
    <>
      {children}
      {showAuthModal && user?.isGuest && (
        <AuthModal onClose={() => setShowAuthModal(false)} onGuestContinue={() => setShowAuthModal(false)} />
      )}
    </>
  )
}
