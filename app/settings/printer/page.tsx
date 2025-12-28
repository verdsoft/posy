"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DashboardLayout from "@/components/dashboard-layout"
import { toast } from "sonner"
import { Printer, FileText } from "lucide-react"

export default function PrinterSettingsPage() {
    const [printerType, setPrinterType] = useState("thermal-80mm")
    const [autoPrint, setAutoPrint] = useState(false)
    const [headerText, setHeaderText] = useState("")
    const [footerText, setFooterText] = useState("Thank you for your business!")

    const handleSave = () => {
        // Save to localStorage
        localStorage.setItem("printer_type", printerType)
        localStorage.setItem("auto_print", autoPrint.toString())
        localStorage.setItem("receipt_header", headerText)
        localStorage.setItem("receipt_footer", footerText)

        toast.success("Printer settings saved successfully")
    }

    const handleTestPrint = () => {
        const testReceipt = {
            reference: "TEST-001",
            date: new Date().toISOString(),
            items: [
                { name: "Test Product 1", quantity: 2, price: 10.00, subtotal: 20.00 },
                { name: "Test Product 2", quantity: 1, price: 15.50, subtotal: 15.50 }
            ],
            subtotal: 35.50,
            tax: 5.33,
            total: 40.83,
            payment_method: "Cash",
            cashier: "Test User"
        }

        // Create a temporary print window
        const printWindow = window.open('', '_blank')
        if (!printWindow) {
            toast.error("Please allow popups to print")
            return
        }

        const receiptHTML = generateReceiptHTML(testReceipt)
        printWindow.document.write(receiptHTML)
        printWindow.document.close()

        setTimeout(() => {
            printWindow.print()
            printWindow.close()
        }, 250)

        toast.success("Test print sent to printer")
    }

    const generateReceiptHTML = (data: any) => {
        const width = printerType === "thermal-58mm" ? "58mm" : "80mm"

        return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Test Receipt</title>
        <style>
          @page {
            size: ${width} auto;
            margin: 0;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
          }
          body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            padding: 10px;
            max-width: ${width};
            margin: 0 auto;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-top: 1px dashed #000; margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; }
          td { padding: 2px 0; }
          .right { text-align: right; }
        </style>
      </head>
      <body>
        <div class="center bold">
          ${headerText || "POSy System"}
        </div>
        <div class="center">Test Receipt</div>
        <div class="line"></div>
        <div>Date: ${new Date(data.date).toLocaleString()}</div>
        <div>Receipt: ${data.reference}</div>
        <div>Cashier: ${data.cashier}</div>
        <div class="line"></div>
        <table>
          ${data.items.map((item: any) => `
            <tr>
              <td colspan="2">${item.name}</td>
            </tr>
            <tr>
              <td>${item.quantity} x $${item.price.toFixed(2)}</td>
              <td class="right">$${item.subtotal.toFixed(2)}</td>
            </tr>
          `).join('')}
        </table>
        <div class="line"></div>
        <table>
          <tr>
            <td>Subtotal:</td>
            <td class="right">$${data.subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Tax:</td>
            <td class="right">$${data.tax.toFixed(2)}</td>
          </tr>
          <tr class="bold">
            <td>TOTAL:</td>
            <td class="right">$${data.total.toFixed(2)}</td>
          </tr>
        </table>
        <div class="line"></div>
        <div>Payment: ${data.payment_method}</div>
        <div class="line"></div>
        <div class="center">
          ${footerText}
        </div>
      </body>
      </html>
    `
    }

    // Load settings on mount
    useState(() => {
        if (typeof window !== 'undefined') {
            const savedType = localStorage.getItem("printer_type")
            const savedAutoPrint = localStorage.getItem("auto_print")
            const savedHeader = localStorage.getItem("receipt_header")
            const savedFooter = localStorage.getItem("receipt_footer")

            if (savedType) setPrinterType(savedType)
            if (savedAutoPrint) setAutoPrint(savedAutoPrint === "true")
            if (savedHeader) setHeaderText(savedHeader)
            if (savedFooter) setFooterText(savedFooter)
        }
    })

    return (
        <DashboardLayout>
            <div className="p-4 md:p-6">
                <div className="mb-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <span>Settings</span>
                        <span>|</span>
                        <span>Printer</span>
                    </div>
                </div>

                <div className="max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Printer className="h-5 w-5" />
                                Printer Settings
                            </CardTitle>
                            <CardDescription>
                                Configure your thermal printer settings for receipts and invoices
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Printer Type */}
                            <div className="space-y-2">
                                <Label htmlFor="printer-type">Printer Type</Label>
                                <Select value={printerType} onValueChange={setPrinterType}>
                                    <SelectTrigger id="printer-type">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="thermal-80mm">Thermal 80mm</SelectItem>
                                        <SelectItem value="thermal-58mm">Thermal 58mm</SelectItem>
                                        <SelectItem value="standard-a4">Standard A4</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground">
                                    Select your printer type. Most thermal receipt printers use 80mm paper.
                                </p>
                            </div>

                            {/* Auto Print */}
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="auto-print">Auto-print receipts</Label>
                                    <p className="text-xs text-muted-foreground">
                                        Automatically print receipt after completing a sale
                                    </p>
                                </div>
                                <Switch
                                    id="auto-print"
                                    checked={autoPrint}
                                    onCheckedChange={setAutoPrint}
                                />
                            </div>

                            {/* Header Text */}
                            <div className="space-y-2">
                                <Label htmlFor="header">Receipt Header</Label>
                                <Input
                                    id="header"
                                    placeholder="Store name or header text"
                                    value={headerText}
                                    onChange={(e) => setHeaderText(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Text to display at the top of receipts
                                </p>
                            </div>

                            {/* Footer Text */}
                            <div className="space-y-2">
                                <Label htmlFor="footer">Receipt Footer</Label>
                                <Input
                                    id="footer"
                                    placeholder="Thank you message"
                                    value={footerText}
                                    onChange={(e) => setFooterText(e.target.value)}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Text to display at the bottom of receipts
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <Button onClick={handleSave} className="bg-[#1a237e] hover:bg-purple-700">
                                    Save Settings
                                </Button>
                                <Button onClick={handleTestPrint} variant="outline">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Test Print
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    )
}
