"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { authAPI } from "./api"

interface User {
  id: string
  email: string
  name: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>
  register: (name: string, email: string, password: string, passwordConfirmation: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  isLoading: boolean
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        const response = await authAPI.checkAuth()
        setUser(response.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true)
      const response = await authAPI.login({ email, password })

      setUser(response.user)
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed'
      return { success: false, message }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string, passwordConfirmation: string): Promise<{ success: boolean; message?: string }> => {
    try {
      setIsLoading(true)
      const response = await authAPI.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation
      })

      setUser(response.user)
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))

      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed'
      return { success: false, message }
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      await authAPI.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user')
    }
  }

  return (
      <AuthContext.Provider value={{
        user,
        login,
        register,
        logout,
        isLoading,
        checkAuth
      }}>
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