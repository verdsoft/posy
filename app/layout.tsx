
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ReduxProvider } from "@/components/providers/redux-provider"
import { DatabaseSetupWrapper } from "@/components/database-setup-wrapper"
import { AuthHydrator } from "@/components/auth-hydrator"
import { QueryClientProviderWrapper } from "@/components/query-provider"
import { Toaster } from "sonner" 
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Posy",
  description: "Business Management System"
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <AuthHydrator />
          <QueryClientProviderWrapper>
            <DatabaseSetupWrapper>
              {children}
              <Toaster richColors /> 
            </DatabaseSetupWrapper>
          </QueryClientProviderWrapper>
        </ReduxProvider>
      </body>
    </html>
  )
}
