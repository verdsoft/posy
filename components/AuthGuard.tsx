"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"

import React from "react"

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    if (!isAuthenticated && !localStorage.getItem("token")) {
      router.replace("/") // Use replace instead of push
    }
  }, [isAuthenticated, router])

  // Don't render anything until we're on the client side
  if (!isClient) {
    return null
  }

  // If not authenticated, don't render children at all
  if (!isAuthenticated && !localStorage.getItem("token")) {
    return null
  }

  // Only render children if authenticated
  return <>{children}</>
}