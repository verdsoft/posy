"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown } from "lucide-react"

interface DateRangePickerProps {
  value: string
  onChange: (value: string) => void
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState<{ from?: Date; to?: Date }>({})

  const quickOptions = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "This month", value: "this-month" },
    { label: "This year", value: "this-year" },
    { label: "Last month", value: "last-month" },
  ]

  const handleQuickSelect = (option: string) => {
    const today = new Date()
    let newValue = ""

    switch (option) {
      case "today":
        newValue = today.toISOString().split("T")[0] + " - " + today.toISOString().split("T")[0]
        break
      case "yesterday":
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        newValue = yesterday.toISOString().split("T")[0] + " - " + yesterday.toISOString().split("T")[0]
        break
      case "this-month":
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        newValue = startOfMonth.toISOString().split("T")[0] + " - " + endOfMonth.toISOString().split("T")[0]
        break
      case "this-year":
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        const endOfYear = new Date(today.getFullYear(), 11, 31)
        newValue = startOfYear.toISOString().split("T")[0] + " - " + endOfYear.toISOString().split("T")[0]
        break
      case "last-month":
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        newValue = lastMonth.toISOString().split("T")[0] + " - " + endOfLastMonth.toISOString().split("T")[0]
        break
    }

    onChange(newValue)
    setIsOpen(false)
  }

  const handleApply = () => {
    if (selectedRange.from && selectedRange.to) {
      const fromStr = selectedRange.from.toISOString().split("T")[0]
      const toStr = selectedRange.to.toISOString().split("T")[0]
      onChange(`${fromStr} - ${toStr}`)
    }
    setIsOpen(false)
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[200px] bg-transparent">
          {value}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="p-3 border-r">
            <div className="space-y-1">
              {quickOptions.map((option) => (
                <Button
                  key={option.value}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => handleQuickSelect(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="p-3">
            <div className="flex gap-3">
              <div>
                <p className="text-sm font-medium mb-2">Jun 2025</p>
                <Calendar mode="range" selected={selectedRange} onSelect={setSelectedRange} numberOfMonths={1} />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Jul 2025</p>
                <Calendar mode="range" selected={selectedRange} onSelect={setSelectedRange} numberOfMonths={1} />
              </div>
            </div>
            <div className="flex justify-between items-center mt-3 pt-3 border-t">
              <span className="text-sm text-gray-500">01/01/1970 - 07/01/2025</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleApply}>
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
