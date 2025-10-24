"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export interface User {
  id: string
  name: string
  studentId: string
  email?: string
  isGuest: boolean
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  signup: (name: string, studentId: string, email: string, password: string) => Promise<void>
  loginAsGuest: () => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
      } catch (error) {
        console.error("[v0] Failed to parse stored user:", error)
        localStorage.removeItem("auth_user")
        // Start as guest if stored user is invalid
        initializeAsGuest()
      }
    } else {
      // No stored user, start as guest
      initializeAsGuest()
    }
    setIsLoading(false)
  }, [])

  const initializeAsGuest = () => {
    const guestUser: User = {
      id: "guest-" + Date.now(),
      name: "게스트",
      studentId: "GUEST",
      isGuest: true,
      createdAt: new Date().toISOString(),
    }
    setUser(guestUser)
  }

  const login = async (email: string, password: string, rememberMe = false) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem("registered_users") || "[]")
    const foundUser = users.find((u: any) => u.email === email && u.password === password)

    if (!foundUser) {
      throw new Error("이메일 또는 비밀번호가 올바르지 않습니다.")
    }

    const user: User = {
      id: foundUser.id,
      name: foundUser.name,
      studentId: foundUser.studentId,
      email: foundUser.email,
      isGuest: false,
      createdAt: foundUser.createdAt,
    }

    setUser(user)
    if (rememberMe) {
      localStorage.setItem("auth_user", JSON.stringify(user))
      localStorage.setItem("remember_me", "true")
    } else {
      sessionStorage.setItem("auth_user", JSON.stringify(user))
    }
    sessionStorage.setItem("student_id", user.studentId)
    sessionStorage.setItem("student_name", user.name)
  }

  const signup = async (name: string, studentId: string, email: string, password: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem("registered_users") || "[]")
    const existingUser = users.find((u: any) => u.email === email || u.studentId === studentId)

    if (existingUser) {
      throw new Error("이미 등록된 이메일 또는 학번입니다.")
    }

    const newUser = {
      id: "user-" + Date.now(),
      name,
      studentId,
      email,
      password,
      createdAt: new Date().toISOString(),
    }

    users.push(newUser)
    localStorage.setItem("registered_users", JSON.stringify(users))

    const user: User = {
      id: newUser.id,
      name: newUser.name,
      studentId: newUser.studentId,
      email: newUser.email,
      isGuest: false,
      createdAt: newUser.createdAt,
    }

    setUser(user)
    localStorage.setItem("auth_user", JSON.stringify(user))
    sessionStorage.setItem("student_id", user.studentId)
    sessionStorage.setItem("student_name", user.name)
  }

  const loginAsGuest = () => {
    const guestUser: User = {
      id: "guest-" + Date.now(),
      name: "게스트",
      studentId: "GUEST",
      isGuest: true,
      createdAt: new Date().toISOString(),
    }

    setUser(guestUser)
    sessionStorage.setItem("auth_user", JSON.stringify(guestUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("auth_user")
    localStorage.removeItem("remember_me")
    sessionStorage.removeItem("auth_user")
    sessionStorage.removeItem("student_id")
    sessionStorage.removeItem("student_name")
    initializeAsGuest()
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        loginAsGuest,
        logout,
        isAuthenticated: !!user && !user.isGuest,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
