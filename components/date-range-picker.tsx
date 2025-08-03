"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronDown } from "lucide-react"
import { DateRange } from "react-day-picker"

interface DateRangePickerProps {
  onDateChange: (range: DateRange | undefined) => void;
  initialDateRange?: DateRange;
}

export function DateRangePicker({ onDateChange, initialDateRange }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(initialDateRange)

  const quickOptions = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "This month", value: "this-month" },
    { label: "This year", value: "this-year" },
    { label: "Last month", value: "last-month" },
  ]

  useEffect(() => {
    onDateChange(selectedRange);
  }, [selectedRange, onDateChange]);

  const handleQuickSelect = (option: string) => {
    const today = new Date()
    let from: Date | undefined;
    let to: Date | undefined;

    switch (option) {
      case "today":
        from = today;
        to = today;
        break
      case "yesterday":
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        from = yesterday;
        to = yesterday;
        break
      case "this-month":
        from = new Date(today.getFullYear(), today.getMonth(), 1)
        to = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case "this-year":
        from = new Date(today.getFullYear(), 0, 1)
        to = new Date(today.getFullYear(), 11, 31)
        break
      case "last-month":
        from = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        to = new Date(today.getFullYear(), today.getMonth(), 0)
        break
    }
    setSelectedRange({ from, to });
    setIsOpen(false)
  }

  const handleApply = () => {
    onDateChange(selectedRange);
    setIsOpen(false)
  }

  const displayValue = selectedRange?.from 
    ? selectedRange.to 
        ? `${selectedRange.from.toLocaleDateString()} - ${selectedRange.to.toLocaleDateString()}`
        : selectedRange.from.toLocaleDateString()
    : "Select a date range";

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="justify-between min-w-[200px] bg-transparent">
          {displayValue}
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
            <Calendar
                mode="range"
                selected={selectedRange}
                onSelect={setSelectedRange}
                numberOfMonths={2}
            />
            <div className="flex justify-between items-center mt-3 pt-3 border-t">
              <span className="text-sm text-gray-500">{displayValue}</span>
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
