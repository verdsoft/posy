"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2 } from "lucide-react"

const backups = [
  {
    id: 1,
    date: "backup_2022-11-04.sql",
    fileSize: "129.61 KB",
  },
]

export default function BackupDatabase() {
  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>Settings</span>
            <span>|</span>
            <span>Backup Database</span>
          </div>
          <h1 className="text-2xl font-bold">Backup Database</h1>
        </div>

        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <Alert className="flex-1 mr-4 bg-red-50 border-red-200">
                <AlertDescription className="text-red-800">
                  You will find your backup on /storage/app/public/backup and save it to your pc
                </AlertDescription>
              </Alert>
              <Button className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap">Generate Backup</Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-left p-4 font-medium">File size</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {backups.map((backup) => (
                  <tr key={backup.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{backup.date}</td>
                    <td className="p-4">{backup.fileSize}</td>
                    <td className="p-4">
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
