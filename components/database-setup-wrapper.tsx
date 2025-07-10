"use client"

import type React from "react"



export function DatabaseSetupWrapper({ children }: { children: React.ReactNode }) {
  // const { isConfigured } = useAppSelector((state) => state.database)
  // const dispatch = useAppDispatch()

  // useEffect(() => {
  //   // Check if database is already configured
  //   const savedConfig = localStorage.getItem("dbConfig")
  //   if (savedConfig) {
  //     try {
  //       const config = JSON.parse(savedConfig)
  //       dispatch(setDatabaseConfig(config))
  //     } catch (error) {
  //       console.error("Failed to parse saved database config:", error)
  //     }
  //   }
  // }, [dispatch])

  // if (!isConfigured) {
  //   return <DatabaseSetup />
  // }

  return <>{children}</>
}
