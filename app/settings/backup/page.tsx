"use client"

import DashboardLayout from "../../../components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription as AlertDialogDescriptionComponent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Loader2, Trash2, Download } from "lucide-react"
import { useGetBackupsQuery, useCreateBackupMutation, useDeleteBackupMutation } from "@/lib/slices/settingsApi"
import { toast } from "sonner"
import Link from "next/link"

function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


export default function BackupDatabase() {
  const { data: backups, isLoading: backupsLoading, refetch } = useGetBackupsQuery();
  const [createBackup, { isLoading: isCreating }] = useCreateBackupMutation();
  const [deleteBackup, { isLoading: isDeleting }] = useDeleteBackupMutation();

  const handleCreateBackup = async () => {
    try {
      await createBackup().unwrap();
      toast.success("Backup generated successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to generate backup.");
    }
  }

  const handleDeleteBackup = async (fileName: string) => {
    try {
      await deleteBackup(fileName).unwrap();
      toast.success("Backup deleted successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to delete backup.");
    }
  }

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
              <Alert className="flex-1 mr-4 bg-blue-50 border-blue-200">
                <AlertDescription className="text-blue-800">
                  Click the download icon to save a backup to your computer. Backups are stored in <code>public/storage/backups/</code>.
                </AlertDescription>
              </Alert>
              <Button onClick={handleCreateBackup} className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap" disabled={isCreating}>
                {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isCreating ? 'Generating...' : 'Generate Backup'}
                </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4 font-medium">File Name</th>
                  <th className="text-left p-4 font-medium">File Size</th>
                  <th className="text-left p-4 font-medium">Date Created</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {backupsLoading ? (
                    <tr>
                        <td colSpan={4} className="text-center p-4">
                            <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                        </td>
                    </tr>
                ) : backups && backups.length > 0 ? (
                  backups.map((backup) => (
                    <tr key={backup.name} className="border-b hover:bg-gray-50">
                      <td className="p-4">{backup.name}</td>
                      <td className="p-4">{formatBytes(backup.size)}</td>
                      <td className="p-4">{new Date(backup.date).toLocaleString()}</td>
                      <td className="p-4 flex items-center gap-2">
                        <Link href={`/storage/backups/${backup.name}`} download>
                          <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4 text-blue-600" />
                          </Button>
                        </Link>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" disabled={isDeleting}>
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescriptionComponent>
                                    This action cannot be undone. This will permanently delete the backup file.
                                </AlertDialogDescriptionComponent>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteBackup(backup.name)} disabled={isDeleting}>
                                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    Delete
                                </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))
                ) : (
                    <tr>
                        <td colSpan={4} className="text-center p-4">No backups found.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
