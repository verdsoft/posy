"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Database, CheckCircle, XCircle } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/hooks"
import { testConnection, setupDatabase } from "@/lib/slices/databaseSlice"

export function DatabaseSetup() {
  const dispatch = useAppDispatch()
  const { loading, error, connectionStatus } = useAppSelector((state) => state.database)

  const [dbType, setDbType] = useState<"mysql" | "supabase">("mysql")
  const [config, setConfig] = useState({
    mysql: {
      host: "localhost",
      port: 3306,
      database: "verdsoft_bms",
      username: "root",
      password: "",
    },
    supabase: {
      url: "",
      key: "",
    },
  })

  const handleConfigChange = (field: string, value: string | number) => {
    setConfig((prev) => ({
      ...prev,
      [dbType]: {
        ...prev[dbType],
        [field]: value,
      },
    }))
  }

  const handleTestConnection = async () => {
    const dbConfig =
      dbType === "mysql"
        ? {
            type: "mysql" as const,
            host: config.mysql.host,
            port: config.mysql.port,
            database: config.mysql.database,
            username: config.mysql.username,
            password: config.mysql.password,
          }
        : {
            type: "supabase" as const,
            supabaseUrl: config.supabase.url,
            supabaseKey: config.supabase.key,
          }

    await dispatch(testConnection(dbConfig))
  }

  const handleSetupDatabase = async () => {
    const dbConfig =
      dbType === "mysql"
        ? {
            type: "mysql" as const,
            host: config.mysql.host,
            port: config.mysql.port,
            database: config.mysql.database,
            username: config.mysql.username,
            password: config.mysql.password,
          }
        : {
            type: "supabase" as const,
            supabaseUrl: config.supabase.url,
            supabaseKey: config.supabase.key,
          }

    await dispatch(setupDatabase(dbConfig))
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Database className="text-white h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">Database Setup</CardTitle>
          <p className="text-gray-600">Configure your database connection to get started</p>
        </CardHeader>
        <CardContent>
          <Tabs value={dbType} onValueChange={(value) => setDbType(value as "mysql" | "supabase")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mysql">MySQL</TabsTrigger>
              <TabsTrigger value="supabase">Supabase</TabsTrigger>
            </TabsList>

            <TabsContent value="mysql" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    value={config.mysql.host}
                    onChange={(e) => handleConfigChange("host", e.target.value)}
                    placeholder="localhost"
                  />
                </div>
                <div>
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    type="number"
                    value={config.mysql.port}
                    onChange={(e) => handleConfigChange("port", Number.parseInt(e.target.value))}
                    placeholder="3306"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="database">Database Name</Label>
                <Input
                  id="database"
                  value={config.mysql.database}
                  onChange={(e) => handleConfigChange("database", e.target.value)}
                  placeholder="verdsoft_bms"
                />
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={config.mysql.username}
                  onChange={(e) => handleConfigChange("username", e.target.value)}
                  placeholder="root"
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={config.mysql.password}
                  onChange={(e) => handleConfigChange("password", e.target.value)}
                  placeholder="Enter password"
                />
              </div>
            </TabsContent>

            <TabsContent value="supabase" className="space-y-4">
              <div>
                <Label htmlFor="supabase-url">Supabase URL</Label>
                <Input
                  id="supabase-url"
                  value={config.supabase.url}
                  onChange={(e) => handleConfigChange("url", e.target.value)}
                  placeholder="https://your-project.supabase.co"
                />
              </div>
              <div>
                <Label htmlFor="supabase-key">Supabase Anon Key</Label>
                <Input
                  id="supabase-key"
                  value={config.supabase.key}
                  onChange={(e) => handleConfigChange("key", e.target.value)}
                  placeholder="Your anon key"
                />
              </div>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert className="mt-4" variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {connectionStatus === "connected" && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>Connection successful! You can now setup the database.</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4 mt-6">
            <Button
              onClick={handleTestConnection}
              disabled={loading}
              variant="outline"
              className="flex-1 bg-transparent"
            >
              {loading && connectionStatus === "connecting" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Test Connection
            </Button>
            <Button
              onClick={handleSetupDatabase}
              disabled={loading || connectionStatus !== "connected"}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Setup Database
            </Button>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Database Scripts</h3>
            <p className="text-sm text-gray-600">
              After successful connection, the system will automatically create all necessary tables. You can also run
              the provided SQL scripts manually if needed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
