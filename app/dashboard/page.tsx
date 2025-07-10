"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

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

  const { data, isLoading, isError } = useQuery({
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
        <div className="p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-purple-600">{stat.amount}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales vs Purchases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products (2025)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={topProducts}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {topProducts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Product Alerts Table */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Product Quantity Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Product</th>
                        <th className="text-left p-2">Warehouse</th>
                        <th className="text-left p-2">Quantity</th>
                        <th className="text-left p-2">Alert Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productAlerts.map((product, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{product.name}</td>
                          <td className="p-2">{product.warehouse}</td>
                          <td className="p-2">{product.quantity}</td>
                          <td className="p-2">
                            <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
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

            <Card>
              <CardHeader>
                <CardTitle>Top Selling Products (July)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Product</th>
                        <th className="text-left p-2">Quantity</th>
                        <th className="text-left p-2">Grand Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="p-2" colSpan={3}>
                          <div className="text-center text-gray-500 py-8">
                            No data for table
                          </div>
                        </td>
                      </tr>
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
