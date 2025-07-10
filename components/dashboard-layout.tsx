"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Package,
  Settings,
  FileText,
  ShoppingCart,
  Users,
  ArrowLeftRight,
  DollarSign,
  RotateCcw,
  Menu,
  Bell,
  Globe,
  Zap,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useAppDispatch } from "@/lib/hooks"
import { logout } from "@/lib/slices/authSlice"
import AuthGuard from "./AuthGuard"

const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: BarChart3,
    href: "/dashboard",
  },
  {
    id: "products",
    label: "Products",
    icon: Package,
    submenu: [
      { label: "Create Product", href: "/products/create" },
      { label: "Product List", href: "/products/list" },
      { label: "Print Barcode", href: "/products/barcode" },
    ],
  },
  {
    id: "adjustment",
    label: "Adjustment",
    icon: Settings,
    submenu: [
      { label: "Create Adjustment", href: "/adjustment/create" },
      { label: "Adjustment List", href: "/adjustment/list" },
    ],
  },
  {
    id: "quotations",
    label: "Quotations",
    icon: FileText,
    submenu: [
      { label: "Create Quotation", href: "/quotations/create" },
      { label: "Quotation List", href: "/quotations/list" },
    ],
  },
  {
    id: "purchases",
    label: "Purchases",
    icon: ShoppingCart,
    submenu: [
      { label: "Create Purchase", href: "/purchases/create" },
      { label: "Purchase List", href: "/purchases/list" },
    ],
  },
  {
    id: "sales",
    label: "Sales",
    icon: DollarSign,
    submenu: [
      { label: "Create Sale", href: "/sales/create" },
      { label: "Sale List", href: "/sales/list" },
    ],
  },
  {
    id: "hrm",
    label: "HRM",
    icon: Users,
    submenu: [
      { label: "Company", href: "/hrm/company" },
      { label: "Departments", href: "/hrm/departments" },
      { label: "Office Shift", href: "/hrm/shifts" },
      { label: "Employees", href: "/hrm/employees" },
      { label: "Attendance", href: "/hrm/attendance" },
      {
        label: "Leave Request",
        href: "#",
        submenu: [
          { label: "Leave Request", href: "/hrm/leave-request" },
          { label: "Leave Type", href: "/hrm/leave-type" },
        ],
      },
      { label: "Holidays", href: "/hrm/holidays" },
    ],
  },
  {
    id: "transfer",
    label: "Transfer",
    icon: ArrowLeftRight,
    submenu: [
      { label: "Create Transfer", href: "/transfer/create" },
      { label: "Transfer List", href: "/transfer/list" },
    ],
  },
  {
    id: "expenses",
    label: "Expenses",
    icon: DollarSign,
    submenu: [
      { label: "Create Expense", href: "/expenses/create" },
      { label: "Expense List", href: "/expenses/list" },
      { label: "Expense Category", href: "/expenses/category" },
    ],
  },
  {
    id: "sales-return",
    label: "Sales Return",
    icon: RotateCcw,
    submenu: [
      { label: "Create Sales Return", href: "/sales-return/create" },
      { label: "Sales Return List", href: "/sales-return/list" },
    ],
  },
  {
    id: "purchases-return",
    label: "Purchases Return",
    icon: RotateCcw,
    submenu: [
      { label: "Create Purchase Return", href: "/purchases-return/create" },
      { label: "Purchase Return List", href: "/purchases-return/list" },
    ],
  },
  {
    id: "people",
    label: "People",
    icon: Users,
    submenu: [
      { label: "Customer List", href: "/people/customers" },
      { label: "Supplier List", href: "/people/suppliers" },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    submenu: [
      { label: "Warehouse", href: "/settings/warehouses" },
      { label: "Category", href: "/settings/categories" },
      { label: "Brand", href: "/settings/brands" },
      { label: "Currency", href: "/settings/currencies" },
      { label: "Unit", href: "/settings/units" },
      { label: "Backup", href: "/settings/backup" },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    icon: BarChart3,
    submenu: [
      {
        label: "Payments",
        href: "#",
        submenu: [
          { label: "Sales", href: "/reports/payments/sales" },
          { label: "Purchases", href: "/reports/payments/purchases" },
          { label: "Sales Returns", href: "/reports/payments/sales-returns" },
          { label: "Purchase Returns", href: "/reports/payments/purchase-returns" },
        ],
      },
      { label: "Profit and Loss", href: "/reports/profit-loss" },
      { label: "Product Quantity Alerts", href: "/reports/quantity-alerts" },
      { label: "Warehouse Report", href: "/reports/warehouse" },
      {
        label: "Sale Report",
        href: "/reports/sales",
        submenu: [
          { label: "Sales", href: "/reports/sales" },
          { label: "Sales Returns", href: "/reports/sales-returns" },
        ],
      },
      {
        label: "Purchase Report",
        href: "/reports/purchases",
        submenu: [
          { label: "Purchases", href: "/reports/purchases" },
          { label: "Purchase Returns", href: "/reports/purchase-returns" },
        ],
      },
      { label: "Customer Report", href: "/reports/customers" },
      { label: "Supplier Report", href: "/reports/suppliers" },
      { label: "Top Selling Products", href: "/reports/top-selling" },
      { label: "Best Customers", href: "/reports/best-customers" },
    ],
  },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [ hoveredSubItem,setHoveredSubItem] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)




  const [profileOpen, setProfileOpen] = useState(false)
  const router = useRouter()
  const dispatch = useAppDispatch()
  const pathname = usePathname()

  const handleLogout = () => {
    dispatch(logout())
    router.push("/")
  }

  // Helper to check if a menu or submenu is active
  const isActive = (href?: string) => {
    if (!href) return false
    // Exact match or startsWith for parent sections
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <AuthGuard>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className={`${sidebarOpen ? "w-64" : "w-16"} bg-white border-r transition-all duration-300 flex flex-col h-full`}>
          {/* Sidebar Header */}
          <div
            className=" p-4  flex items-center gap-3"
            style={{
              fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif",
              fontSize: "14px",
              background: "#fff",
              boxShadow: "none"
            }}
          >
            <Link href="/dashboard">
              <div className="w-10 h-10 bg-[#1a237e] rounded-lg flex items-center justify-center cursor-pointer">
                <div className="text-white font-bold text-lg">B</div>
              </div>
            </Link>
            {sidebarOpen && (
              <span className="font-semibold text-lg text-[#1a237e]" style={{ letterSpacing: "0.02em" }}>
                BMS
              </span>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4">
            {menuItems.map((item) => {
              // Check if any submenu is active
              const submenuActive = item.submenu?.some(sub => isActive(sub.href))
              const active = isActive(item.href) || submenuActive

              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item.id)}
                  onMouseLeave={() => {
                    setHoveredItem(null)
                    setHoveredSubItem(null)
                  }}
                >
                  <Link href={item.href || "#"}>
                    <div
                      className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 cursor-pointer
                        ${active ? "bg-purple-50 border-r-2 border-purple-600 font-semibold text-purple-900" : ""}`}
                    >
                      <item.icon className="h-5 w-5" />
                      {sidebarOpen && (
                        <>
                          <span className="flex-1">{item.label}</span>
                          {item.submenu && <ChevronRight className="h-4 w-4" />}
                        </>
                      )}
                    </div>
                  </Link>

                  {/* Submenu */}
                  {item.submenu && hoveredItem === item.id && (
                    <div className="absolute left-full top-0 w-64 bg-white border border-gray-200 shadow-lg rounded-md z-50 ml-1">
                      <div className="py-2">
                        {item.submenu.map((subItem, index) => {
                          const subActive = isActive(subItem.href)
                          return (
                            <div
                              key={index}
                              className="relative"
                              onMouseEnter={() => setHoveredSubItem(subItem.label)}
                              onMouseLeave={() => setHoveredSubItem(null)}
                            >
                              <Link href={subItem.href}>
                                <div className={`px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center justify-between
                                  ${subActive ? "bg-purple-100 text-purple-900 font-semibold" : ""}
                                `}>
                                  <span>{subItem.label}</span>
                                  {subItem.submenu && <ChevronRight className="h-3 w-3" />}
                                </div>
                              </Link>
                              {/* Third level submenu ... */}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-none" style={{ fontFamily: "'Inter', 'Segoe UI', Arial, sans-serif", fontSize: "14px" }}>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="rounded bg-transparent hover:bg-blue-50 text-blue-900" style={{ fontSize: "13px" }} onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Link href="/pos">
                <Button className="bg-[#1a237e] hover:bg-[#23308c] text-white rounded shadow-none" style={{ fontSize: "13px" }}>
                  POS
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="rounded bg-transparent hover:bg-blue-50 text-blue-900" style={{ fontSize: "13px" }}>
                <Globe className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="rounded bg-transparent hover:bg-blue-50 text-blue-900" style={{ fontSize: "13px" }}>
                <Zap className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="sm" className="relative rounded bg-transparent hover:bg-blue-50 text-blue-900" style={{ fontSize: "13px" }}>
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-[#1a237e] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  1
                </span>
              </Button>
              {/* Profile Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 rounded bg-transparent hover:bg-blue-50"
                  style={{ fontSize: "13px" }}
                  onClick={() => setProfileOpen((open) => !open)}
                >
                  <div className="w-8 h-8 bg-[#1a237e] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">U</span>
                  </div>
                </Button>
                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-50">
                    <div className="px-4 py-3">
                      <div className="font-semibold text-gray-800">{typeof window !== "undefined" ? localStorage.getItem("username") || "Username" : "Username"}</div>
                      <div className="text-sm text-gray-500">{typeof window !== "undefined" ? localStorage.getItem("email") || "user@email.com" : "user@email.com"}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 border-t"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>


          {/* Page Content */}
          <main className="flex-1 overflow-auto">{children}</main>

          {/* Footer */}
          <footer className="bg-gray-100 px-6 py-3 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
                <div className="text-white text-xs font-bold">B</div>
              </div>
              <span>© 2025 Developed by Verdsoft </span>
              <span className="ml-auto">All rights reserved</span>
            </div>
          </footer>
        </div>
      </div>
    </AuthGuard>
  )
}
