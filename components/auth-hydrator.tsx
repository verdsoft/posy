"use client"

import { useEffect } from "react"
import { useAppDispatch } from "@/lib/hooks"
import { setUser } from "@/lib/slices/authSlice"

export function AuthHydrator() {
  const dispatch = useAppDispatch()
  useEffect(() => {
    const token = localStorage.getItem("token")
    const name = localStorage.getItem("username")
    const email = localStorage.getItem("email")
    if (token && email && name) {
      dispatch(setUser({ id: "", email, name, role: "", avatar: "" }))
      // Optionally, you can also set the token in Redux if needed
    }
  }, [dispatch])
  return null
}