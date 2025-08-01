"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useState, useEffect } from "react";

export default function CreateExpense() {
  const [date, setDate] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [details, setDetails] = useState("");
  const [warehouses, setWarehouses] = useState<{id: string, name: string}[]>([]);
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);

  useEffect(() => {
    fetch("/api/settings/warehouses")
      .then(res => res.json())
      .then(setWarehouses);
    fetch("/api/expenses-categories")
      .then(res => res.json())
      .then(setCategories);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        warehouse_id: warehouse,
        category_id: category,
        amount: parseFloat(amount),
        description: details,
        reference: `EXP_${Date.now()}`
      })
    });
    alert("Expense created!");
  };
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Expenses</span>
            <span>|</span>
            <span>Create Expense</span>
          </div>
          <h1 className="text-2xl font-bold">Create Expense</h1>
        </div>
        <form className="bg-white rounded-lg shadow p-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="text-sm font-medium">Date *</label>
              <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="mt-1" required />
            </div>
            <div>
              <label className="text-sm font-medium">Warehouse *</label>
              <Select value={warehouse} onValueChange={setWarehouse}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose Warehouse" />
                </SelectTrigger>
                <SelectContent>
                  {warehouses.map(w => (
                    <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Expense Category *</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mb-6">
            <label className="text-sm font-medium">Amount *</label>
            <Input placeholder="Amount" className="mt-1" value={amount} onChange={e => setAmount(e.target.value)} required />
          </div>
          <div className="mb-6">
            <label className="text-sm font-medium">Details *</label>
            <Textarea placeholder="A few words ..." className="mt-1" rows={4} value={details} onChange={e => setDetails(e.target.value)} required />
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700" type="submit">Submit</Button>
        </form>
      </div>
    </DashboardLayout>
  );
}
