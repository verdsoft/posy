"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard-layout";
import type React from "react";
import { useGetSystemSettingsQuery, useUpdateSystemSettingsMutation } from "@/lib/slices/settingsApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function SystemSettingsPage() {
  const { data: settings, isLoading: settingsLoading, refetch } = useGetSystemSettingsQuery();
  const [updateSystemSettings, { isLoading: isUpdating }] = useUpdateSystemSettingsMutation();

  const [systemTitle, setSystemTitle] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);


  useEffect(() => {
    if (settings) {
      setSystemTitle(settings.system_title || "");
      if(settings.system_logo) {
        setPreviewUrl(settings.system_logo)
      }
    }
  }, [settings]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
        const file = e.target.files[0];
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
      }
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('system_title', systemTitle);
    if(logoFile) {
        formData.append('logo', logoFile);
    }

    try {
        await updateSystemSettings(formData).unwrap();
        toast.success("Settings updated successfully!");
        refetch();
    } catch (error) {
        toast.error("Failed to update settings.");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-1">System Settings</h2>
        <p className="text-muted-foreground mb-6">Manage system-wide configurations like title and logo</p>

        {settingsLoading ? (
             <Card className="p-6 max-w-2xl">
                <Loader2 className="mx-auto h-10 w-10 animate-spin" />
             </Card>
        ) : (
            <Card className="p-6 max-w-2xl">
            <form onSubmit={handleSubmit} className="grid gap-4">
              <div>
                <Label>System Title *</Label>
                <Input value={systemTitle} onChange={e => setSystemTitle(e.target.value)} />
              </div>
  
              <div>
                <Label>System Logo</Label>
                <Input type="file" onChange={handleLogoChange} accept="image/*"/>
              </div>

              {previewUrl && (
                <div>
                    <Label>Logo Preview</Label>
                    <img src={previewUrl} alt="Logo Preview" className="mt-2 h-20 w-auto object-contain border p-2 rounded-md" />
                </div>
              )}
  
              <div className="flex justify-start">
                <Button type="submit" className="mt-4" disabled={isUpdating}>
                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Update Settings
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
