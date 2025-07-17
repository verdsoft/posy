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

  const topProducts = [
    { name: "ULTRASONIC BRACKET", value: 400 },
    { name: "Safe Space - Hub", value: 300 },
    { name: "ULTRASOUND SENSOR", value: 300 },
    { name: "ARDUINO MEGA", value: 200 },
  ]

  const productAlerts = [
    { name: "5V HC_SR04 ULTRASONIC SENSOR", warehouse: "Main Store", quantity: 0, alert: 5 },
    { name: "4x4 KEYPAD", warehouse: "Karigamombe", quantity: 2, alert: 5 },
    { name: "HC05 BLUETOOTH MODULE", warehouse: "Centre Branch", quantity: 1, alert: 3 },
  ]

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
                    data={topProducts}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    innerRadius={40}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
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
                  {productAlerts.map((product, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 text-gray-800">{product.name}</td>
                      <td className="p-2 text-gray-500">{product.warehouse}</td>
                      <td className="p-2 text-right font-medium">{product.quantity}</td>
                      <td className="p-2 text-right">
                        <span className="inline-block bg-red-50 text-red-600 px-2 py-0.5 rounded text-xs font-medium">
                          {product.alert}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

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
                  {topProducts.length > 0 ? (
                    topProducts.map((product, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="p-2 text-gray-800">{product.name}</td>
                        <td className="p-2 text-right font-medium">{product.value}</td>
                        <td className="p-2 text-right font-medium text-gray-800">${product.value.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="p-4 text-center text-gray-400 text-xs" colSpan={3}>
                        No sales data available for this period
                      </td>
                    </tr>
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
