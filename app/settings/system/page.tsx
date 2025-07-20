"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard-layout";

import type React from "react";

export default function SystemSettingsPage() {
  const [systemTitle, setSystemTitle] = useState("Ultimate Inventory WMS");
  const [ logoFile, setLogoFile] = useState<File | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setLogoFile(e.target.files[0]);
      console.log(logoFile)
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle system config submission logic here
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-1">System Settings</h2>
        <p className="text-muted-foreground mb-6">Manage system-wide configurations like title and logo</p>

        <Card className="p-6 max-w-2xl">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <Label>System Title *</Label>
              <Input value={systemTitle} onChange={e => setSystemTitle(e.target.value)} />
            </div>

            <div>
              <Label>System Logo</Label>
              <Input type="file" onChange={handleLogoChange} />
            </div>

            <div className="flex justify-start">
              <Button type="submit" className="mt-4">Update Settings</Button>
            </div>
          </form>
        </Card>

     
      </div>
    </DashboardLayout>
  );
}
