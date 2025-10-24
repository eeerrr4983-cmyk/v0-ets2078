"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Bell, X, Check, MessageSquare } from "lucide-react"

export interface Notification {
  id: string
  type: "mentoring_request" | "mentoring_accepted" | "mentoring_rejected"
  fromUserId: string
  fromUserName: string
  message: string
  createdAt: string
  read: boolean
  chatRoomId?: string
}

export function NotificationCenter() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("notifications")
      if (stored) {
        setNotifications(JSON.parse(stored))
      }
    }
  }

  const markAsRead = (notificationId: string) => {
    const updated = notifications.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    setNotifications(updated)
    localStorage.setItem("notifications", JSON.stringify(updated))
  }

  const deleteNotification = (notificationId: string) => {
    const updated = notifications.filter((n) => n.id !== notificationId)
    setNotifications(updated)
    localStorage.setItem("notifications", JSON.stringify(updated))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  const joinChatRoom = (chatRoomId: string) => {
    // Navigate to chat room
    window.location.href = `/chat/${chatRoomId}`
  }

  return (
    <>
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="fixed top-4 right-4 z-40 p-2.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-[10px] font-bold text-white">{unreadCount}</span>
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-16 right-4 z-50 w-80 max-h-[70vh] overflow-hidden"
          >
            <GlassCard className="p-3 space-y-2 rounded-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">알림</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">알림이 없습니다</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-2.5 rounded-lg border space-y-1.5 ${
                        notification.read ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-900">{notification.fromUserName}</p>
                          <p className="text-xs text-gray-700 mt-0.5">{notification.message}</p>
                          <p className="text-[10px] text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleString("ko-KR")}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                        >
                          <X className="w-3 h-3 text-gray-500" />
                        </button>
                      </div>

                      <div className="flex gap-1.5">
                        {!notification.read && (
                          <Button
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="flex-1 rounded-lg bg-gray-900 text-white h-7 text-[10px] font-medium"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            읽음
                          </Button>
                        )}
                        {notification.type === "mentoring_accepted" && notification.chatRoomId && (
                          <Button
                            size="sm"
                            onClick={() => joinChatRoom(notification.chatRoomId!)}
                            className="flex-1 rounded-lg bg-blue-600 text-white h-7 text-[10px] font-medium"
                          >
                            <MessageSquare className="w-3 h-3 mr-1" />
                            참여
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
