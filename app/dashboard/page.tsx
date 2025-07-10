"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/lib/hooks"
import DashboardLayout from "../../components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Package, RotateCcw, ArrowLeftRight } from "lucide-react"
import AuthGuard from "@/components/AuthGuard"
import type React from "react"

const statsData = [
	{ title: "Sales", amount: "$ 0.00", icon: ShoppingCart, color: "text-blue-600" },
	{ title: "Purchases", amount: "$ 0.00", icon: Package, color: "text-green-600" },
	{ title: "Sales Return", amount: "$ 0.00", icon: RotateCcw, color: "text-orange-600" },
	{ title: "Purchases Return", amount: "$ 0.00", icon: ArrowLeftRight, color: "text-red-600" },
]

const productData = [
	{ name: "5V HC_SR04 ULTRASONIC SENSOR 4PIN", warehouse: "Karigamombe Centre", quantity: 0, alert: 0 },
	{ name: "4*4 KEYPAD", warehouse: "Karigamombe", quantity: 0, alert: 0 },
	{ name: "4*4 KEYPAD", warehouse: "Karigamombe Centre", quantity: 0, alert: 0 },
	{ name: "HC05 BLUETOOTH MODULE", warehouse: "Karigamombe", quantity: 0, alert: 0 },
	{ name: "HC05 BLUETOOTH MODULE", warehouse: "Karigamombe Centre", quantity: 0, alert: 0 },
]

export default function Dashboard() {
	const router = useRouter()
	const { isAuthenticated } = useAppSelector((state) => state.auth)

	useEffect(() => {
		if (!isAuthenticated) {
			router.push("/")
		}
	}, [isAuthenticated, router])

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

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Chart Section */}
					<Card>
						<CardHeader>
							<CardTitle>Sales vs Purchases</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="h-64 bg-gray-50 rounded flex items-center justify-center">
								<div className="text-center">
									<div className="w-full h-32 bg-gradient-to-r from-purple-400 to-purple-600 rounded mb-4 flex items-end justify-center">
										<div className="w-16 h-24 bg-purple-600 rounded-t"></div>
									</div>
									<div className="flex justify-center gap-4 text-sm">
										<div className="flex items-center gap-2">
											<div className="w-3 h-3 bg-purple-400 rounded"></div>
											<span>Sales</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-3 h-3 bg-purple-600 rounded"></div>
											<span>Purchases</span>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Top Selling Products Pie Chart */}
					<Card>
						<CardHeader>
							<CardTitle>Top Selling Products (2025)</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="h-64 flex items-center justify-center">
								<div className="relative">
									<div className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600"></div>
									<div className="absolute top-4 right-0 text-xs space-y-1">
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 bg-purple-400 rounded"></div>
											<span>ULTRASONIC BRACKET</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 bg-purple-500 rounded"></div>
											<span>Safe Space - Community Hub</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 bg-purple-300 rounded"></div>
											<span>5V HC_SR04 ULTRASO...</span>
										</div>
										<div className="flex items-center gap-2">
											<div className="w-2 h-2 bg-purple-600 rounded"></div>
											<span>ARDUINO MEGA 2560</span>
										</div>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Product Tables */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{/* Product Quantity Alerts */}
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
											<th className="text-left p-2">Alert Quantity</th>
										</tr>
									</thead>
									<tbody>
										{productData.map((product, index) => (
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

					{/* Top Selling Products Table */}
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
