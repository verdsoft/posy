"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import type React from "react"
import AuthGuard from "@/components/AuthGuard"
import DashboardLayout from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Package, RotateCcw, ArrowLeftRight } from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useGetSalesQuery } from '@/lib/slices/salesApi'

const fetchDashboardStats = async () => {
  const res = await axios.get("/api/dashboard")
  return res.data
}

const COLORS = ["#a78bfa", "#8b5cf6", "#c084fc", "#7c3aed"]

export default function Dashboard() {
  const router = useRouter()
  const { isAuthenticated } = useAppSelector((state) => state.auth)

  const { data} = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: fetchDashboardStats,
  })

  const { data: salesData = [], isLoading: isSalesLoading } = useGetSalesQuery()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/")
    }
  }, [isAuthenticated, router])

  const statsData = [
    {
      title: "Sales",
      amount: `$ ${data?.total_sales || "0.00"}`,
      icon: ShoppingCart,
      color: "text-blue-600",
    },
    {
      title: "Purchases",
      amount: `$ ${data?.total_purchases || "0.00"}`,
      icon: Package,
      color: "text-green-600",
    },
    {
      title: "Sales Return",
      amount: "$ 0.00",
      icon: RotateCcw,
      color: "text-orange-600",
    },
    {
      title: "Purchases Return",
      amount: "$ 0.00",
      icon: ArrowLeftRight,
      color: "text-red-600",
    },
  ]

  const chartData = [
    { name: "Sales", value: parseFloat(data?.total_sales || 0) },
    { name: "Purchases", value: parseFloat(data?.total_purchases || 0) },
  ]

  // Remove all dummy arrays for topProducts and productAlerts

  return (
    <AuthGuard>
  <DashboardLayout>
    <div className="p-4 space-y-4">
      {/* Stats Cards - Compact */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.title}</p>
                  <p className="text-xl font-semibold text-gray-800">{stat.amount}</p>
                </div>
                <div className={`p-2 rounded-lg ${stat.color || 'bg-gray-100'}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color || 'text-gray-600'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts - Flat Design */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Sales vs Purchases</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Top Selling Products (2025)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[]} // Placeholder for top selling products data
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={40}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {/* Placeholder for Pie chart cells */}
                    <Cell key="cell-0" fill="#a78bfa" />
                    <Cell key="cell-1" fill="#8b5cf6" />
                    <Cell key="cell-2" fill="#c084fc" />
                    <Cell key="cell-3" fill="#7c3aed" />
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} units`, 'Sales']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables - Compact */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock Alerts Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium text-gray-500">Product</th>
                    <th className="text-left p-2 font-medium text-gray-500">Location</th>
                    <th className="text-right p-2 font-medium text-gray-500">Stock</th>
                    <th className="text-right p-2 font-medium text-gray-500">Alert</th>
                  </tr>
                </thead>
                <tbody>
                  {/* TODO: Replace with real low stock data from API when available */}
                  <tr>
                    <td className="p-4 text-center text-gray-400 text-xs" colSpan={4}>
                      No data available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        {/* Top Sellers Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Top Sellers (July)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium text-gray-500">Product</th>
                    <th className="text-right p-2 font-medium text-gray-500">Units</th>
                    <th className="text-right p-2 font-medium text-gray-500">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {/* TODO: Replace with real top sellers data from API when available */}
                  <tr>
                    <td className="p-4 text-center text-gray-400 text-xs" colSpan={3}>
                      No data available
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        {/* Recent Sales Table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium text-gray-500">Date</th>
                    <th className="text-left p-2 font-medium text-gray-500">Reference</th>
                    <th className="text-left p-2 font-medium text-gray-500">Customer</th>
                    <th className="text-right p-2 font-medium text-gray-500">Total</th>
                    <th className="text-right p-2 font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isSalesLoading ? (
                    <tr><td colSpan={5} className="p-4 text-center text-gray-400 text-xs">Loading...</td></tr>
                  ) : salesData.length === 0 ? (
                    <tr><td colSpan={5} className="p-4 text-center text-gray-400 text-xs">No sales data available</td></tr>
                  ) : (
                    salesData.slice(0, 5).map((sale) => (
                      <tr key={sale.id} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-gray-800">{new Date(sale.date).toLocaleDateString()}</td>
                        <td className="p-2 text-gray-800">{sale.reference}</td>
                        <td className="p-2 text-gray-800">{sale.customer_id || '-'}</td>
                        <td className="p-2 text-right font-medium">${(Number(sale.total) || 0).toFixed(2)}</td>
                        <td className="p-2 text-right font-medium">{sale.status}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </DashboardLayout>
</AuthGuard>
  )
}
