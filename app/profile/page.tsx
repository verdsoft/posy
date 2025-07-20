"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/dashboard-layout";

import type React from "react";

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("Merjury");
  const [lastName, setLastName] = useState("Mature");
  const [username, setUsername] = useState("Merjury");
  const [email, setEmail] = useState("admin@kimtronix.com");
  const [phone, setPhone] = useState("0774882645");
  const [password, setPassword] = useState("");
  const [userImage, setUserImage] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setUserImage(e.target.files[0]);
      console.log(userImage)
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here (e.g. API call)
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <h2 className="text-2xl font-semibold mb-1">Profile</h2>
        <p className="text-muted-foreground mb-6">Settings | Profile</p>

        <Card className="p-6">
          {/* <div className="relative h-40 w-full bg-muted rounded-md overflow-hidden">
            <Image
              src="/cover-placeholder.png"
              alt="cover"
              layout="fill"
              objectFit="cover"
              className="opacity-60"
            />
          </div> */}

          <div className="-mt-12 flex flex-col items-center">
            <div className="w-24 h-24 bg-primary text-white flex items-center justify-center rounded-full text-3xl font-bold border-4 border-white shadow-md">
              {firstName.charAt(0)}
            </div>
            <h3 className="mt-2 text-lg font-semibold">{firstName}</h3>
            <span className="text-sm text-muted-foreground">{username}</span>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>First name *</Label>
              <Input value={firstName} onChange={e => setFirstName(e.target.value)} />
            </div>

            <div>
              <Label>Last name *</Label>
              <Input value={lastName} onChange={e => setLastName(e.target.value)} />
            </div>

            <div>
              <Label>Username *</Label>
              <Input value={username} onChange={e => setUsername(e.target.value)} />
            </div>

            <div>
              <Label>Phone *</Label>
              <Input value={phone} onChange={e => setPhone(e.target.value)} />
            </div>

            <div>
              <Label>Email *</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div>
              <Label>User Image</Label>
              <Input type="file" onChange={handleFileChange} />
            </div>

            <div className="col-span-1 md:col-span-2">
              <Label>New password</Label>
              <Input
                type="password"
                placeholder="Please leave this field blank if you haven’t changed it"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <div className="col-span-1 md:col-span-2 flex justify-start">
              <Button type="submit" className="mt-4">Submit</Button>
            </div>
          </form>
        </Card>

    
      </div>
    </DashboardLayout>
  );
}
