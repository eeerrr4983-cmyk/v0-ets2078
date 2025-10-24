"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { X, Users, Send, Check, XCircle, MessageCircle, Bell, Mail } from "lucide-react"

interface MentoringMatch {
  id: string
  studentId: string
  studentName: string
  careerGoal: string
  matchScore: number
  profileSummary: string
}

interface Notification {
  id: string
  type: "request" | "accepted" | "rejected" | "chat"
  from: string
  message: string
  timestamp: string
  chatRoomId?: string
  read: boolean
}

export function AIMentoring({ onClose }: { onClose: () => void }) {
  const [currentMatch, setCurrentMatch] = useState<MentoringMatch | null>(null)
  const [isMatching, setIsMatching] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

  useEffect(() => {
    // Simulate AI matching
    setTimeout(() => {
      const mockMatch: MentoringMatch = {
        id: "match-" + Date.now(),
        studentId: "1407",
        studentName: "김**",
        careerGoal: "AI 및 데이터 과학 분야",
        matchScore: 92,
        profileSummary: "AI와 데이터 분석에 관심이 많으며, 수학과 과학 세특이 우수한 학생입니다.",
      }
      setCurrentMatch(mockMatch)
      setIsMatching(false)
    }, 2000)

    // Load notifications from localStorage
    const savedNotifications = localStorage.getItem("mentoring_notifications")
    if (savedNotifications) {
      setNotifications(JSON.parse(savedNotifications))
    }
  }, [])

  const handleSendRequest = () => {
    if (!currentMatch) return

    const newNotification: Notification = {
      id: "notif-" + Date.now(),
      type: "request",
      from: currentMatch.studentName,
      message: `${currentMatch.studentId}${currentMatch.studentName}님의 도움이 필요한 학생과 멘토링이 매칭되었어요!`,
      timestamp: new Date().toISOString(),
      read: false,
    }

    const updatedNotifications = [newNotification, ...notifications]
    setNotifications(updatedNotifications)
    localStorage.setItem("mentoring_notifications", JSON.stringify(updatedNotifications))

    setRequestSent(true)

    // Simulate response after 3 seconds
    setTimeout(() => {
      const responseNotification: Notification = {
        id: "notif-" + Date.now(),
        type: "accepted",
        from: currentMatch.studentName,
        message: "성공적으로 멘토링이 성사되었어요!",
        timestamp: new Date().toISOString(),
        chatRoomId: "chat-" + Date.now(),
        read: false,
      }

      const updatedNotifications = [responseNotification, ...notifications]
      setNotifications(updatedNotifications)
      localStorage.setItem("mentoring_notifications", JSON.stringify(updatedNotifications))
    }, 3000)
  }

  const handleSkip = () => {
    setIsMatching(true)
    setRequestSent(false)
    setTimeout(() => {
      const mockMatch: MentoringMatch = {
        id: "match-" + Date.now(),
        studentId: "1" + Math.floor(Math.random() * 900 + 100),
        studentName: ["박**", "이**", "최**", "정**"][Math.floor(Math.random() * 4)],
        careerGoal: ["AI 및 데이터 과학", "의학 및 생명과학", "공학 및 기술", "경영 및 경제"][
          Math.floor(Math.random() * 4)
        ],
        matchScore: Math.floor(Math.random() * 20 + 75),
        profileSummary: "진로 목표가 유사하며 생기부 성향이 잘 맞는 학생입니다.",
      }
      setCurrentMatch(mockMatch)
      setIsMatching(false)
    }, 1500)
  }

  const markAsRead = (notifId: string) => {
    const updatedNotifications = notifications.map((n) => (n.id === notifId ? { ...n, read: true } : n))
    setNotifications(updatedNotifications)
    localStorage.setItem("mentoring_notifications", JSON.stringify(updatedNotifications))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <>
      {/* Notification Icon - Fixed in top right */}
      <div className="fixed top-4 right-4 z-[60]">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2.5 bg-white rounded-full shadow-lg hover:shadow-xl transition-all border border-gray-200"
        >
          <Mail className="w-5 h-5 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications Panel */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed top-16 right-4 z-[60] w-80"
          >
            <GlassCard className="p-3 space-y-2 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900">알림</h3>
                <button onClick={() => setShowNotifications(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-4">알림이 없습니다</p>
              ) : (
                <div className="space-y-1.5">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markAsRead(notif.id)}
                      className={`p-2.5 rounded-lg border cursor-pointer transition-all ${
                        notif.read ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 mt-0.5">
                          {notif.type === "accepted" ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : notif.type === "rejected" ? (
                            <XCircle className="w-4 h-4 text-red-600" />
                          ) : (
                            <Bell className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-900 font-medium">{notif.message}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {new Date(notif.timestamp).toLocaleString("ko-KR")}
                          </p>
                          {notif.type === "accepted" && notif.chatRoomId && (
                            <Button
                              size="sm"
                              className="mt-1.5 w-full rounded-lg bg-black text-white h-7 text-[10px]"
                              onClick={(e) => {
                                e.stopPropagation()
                                alert("채팅방 기능은 곧 출시됩니다!")
                              }}
                            >
                              <MessageCircle className="w-3 h-3 mr-1" />
                              멘토링 대화방 참여
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Mentoring Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-4 space-y-3 rounded-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-black flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                AI 멘토링 매칭
              </h3>
              <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {isMatching ? (
              <div className="py-12 text-center space-y-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center mx-auto"
                >
                  <Users className="w-8 h-8 text-purple-600" />
                </motion.div>
                <div>
                  <h4 className="text-base font-bold text-gray-900">AI가 최적의 멘토를 찾는 중...</h4>
                  <p className="text-xs text-gray-600 mt-1">진로 목표와 생기부 성향을 분석하고 있습니다</p>
                </div>
              </div>
            ) : currentMatch ? (
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white font-bold">
                        {currentMatch.studentName[0]}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">
                          {currentMatch.studentId} {currentMatch.studentName}
                        </h4>
                        <p className="text-[10px] text-gray-600">{currentMatch.careerGoal}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">{currentMatch.matchScore}%</div>
                      <p className="text-[9px] text-gray-500">매칭도</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">{currentMatch.profileSummary}</p>
                </div>

                {requestSent ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <Check className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-bold text-green-900">멘토링 요청을 보냈습니다!</p>
                    <p className="text-xs text-green-700 mt-1">상대방의 응답을 기다리고 있습니다...</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSkip}
                      variant="outline"
                      className="flex-1 rounded-full border-2 border-gray-200 hover:bg-gray-50 h-10 text-sm font-medium bg-transparent"
                    >
                      다음
                    </Button>
                    <Button
                      onClick={handleSendRequest}
                      className="flex-1 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-10 text-sm font-medium shadow-lg"
                    >
                      <Send className="w-4 h-4 mr-1.5" />
                      멘토링 요청
                    </Button>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-[10px] text-blue-900 leading-relaxed">
                    💡 AI가 진로 목표와 생기부 성향을 분석하여 가장 적합한 멘토를 추천합니다. 멘토링 요청 시 상대방에게
                    알림이 전송됩니다.
                  </p>
                </div>
              </div>
            ) : null}
          </GlassCard>
        </motion.div>
      </div>
    </>
  )
}
