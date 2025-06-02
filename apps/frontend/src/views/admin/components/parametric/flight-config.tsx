"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Check, Plane, Plus, Save, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for flight delay configurations
const mockFlightConfigs = [
  { id: 1, flightNumber: "UA123", date: "2025-05-15", delayHours: 4, status: "Delayed" },
  { id: 2, flightNumber: "BA456", date: "2025-05-16", delayHours: 0, status: "On Time" },
  { id: 3, flightNumber: "SQ789", date: "2025-05-17", delayHours: 2, status: "Delayed" },
]

export function FlightConfig() {
  const [flightConfigs, setFlightConfigs] = useState(mockFlightConfigs)
  const [newConfig, setNewConfig] = useState({
    flightNumber: "",
    date: "",
    delayHours: 0,
    status: "On Time",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleAddConfig = () => {
    if (!newConfig.flightNumber || !newConfig.date) return

    const newId = Math.max(0, ...flightConfigs.map((c) => c.id)) + 1
    setFlightConfigs([...flightConfigs, { ...newConfig, id: newId }])
    setNewConfig({
      flightNumber: "",
      date: "",
      delayHours: 0,
      status: "On Time",
    })

    // Show success message
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleEditConfig = (id: number) => {
    const configToEdit = flightConfigs.find((c) => c.id === id)
    if (!configToEdit) return

    setNewConfig({ ...configToEdit })
    setIsEditing(true)
    setEditingId(id)
  }

  const handleUpdateConfig = () => {
    if (!editingId) return

    setFlightConfigs(flightConfigs.map((c) => (c.id === editingId ? { ...newConfig, id: editingId } : c)))

    setNewConfig({
      flightNumber: "",
      date: "",
      delayHours: 0,
      status: "On Time",
    })
    setIsEditing(false)
    setEditingId(null)

    // Show success message
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleDeleteConfig = (id: number) => {
    setFlightConfigs(flightConfigs.filter((c) => c.id !== id))
  }

  const handleCancelEdit = () => {
    setNewConfig({
      flightNumber: "",
      date: "",
      delayHours: 0,
      status: "On Time",
    })
    setIsEditing(false)
    setEditingId(null)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="h-5 w-5" />
          Flight Delay Oracle Configuration
        </CardTitle>
        <CardDescription>Configure mock flight delay data for testing parametric flight insurance</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="configurations">
          <TabsList className="mb-4">
            <TabsTrigger value="configurations">Configurations</TabsTrigger>
            <TabsTrigger value="add">Add New Configuration</TabsTrigger>
          </TabsList>

          <TabsContent value="configurations">
            {flightConfigs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Flight Number</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Delay (Hours)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flightConfigs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell className="font-medium">{config.flightNumber}</TableCell>
                      <TableCell>{config.date}</TableCell>
                      <TableCell>{config.delayHours}</TableCell>
                      <TableCell>
                        <Badge variant={config.status === "Delayed" ? "destructive" : "success"}>{config.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditConfig(config.id)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteConfig(config.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No configurations found</h3>
                <p className="text-muted-foreground mt-1">Add a new flight delay configuration to get started</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="add">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="flightNumber">Flight Number</Label>
                  <Input
                    id="flightNumber"
                    placeholder="e.g. UA123"
                    value={newConfig.flightNumber}
                    onChange={(e) => setNewConfig({ ...newConfig, flightNumber: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Flight Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newConfig.date}
                    onChange={(e) => setNewConfig({ ...newConfig, date: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="delayHours">Delay Hours</Label>
                  <Input
                    id="delayHours"
                    type="number"
                    min="0"
                    value={newConfig.delayHours}
                    onChange={(e) => setNewConfig({ ...newConfig, delayHours: Number.parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={newConfig.status}
                    onValueChange={(value) => setNewConfig({ ...newConfig, status: value })}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="On Time">On Time</SelectItem>
                      <SelectItem value="Delayed">Delayed</SelectItem>
                      <SelectItem value="Cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {saveSuccess && (
          <Alert variant="success" className="mt-4">
            <Check className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Flight configuration has been saved successfully.</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleUpdateConfig}>
              <Save className="h-4 w-4 mr-2" />
              Update Configuration
            </Button>
          </>
        ) : (
          <Button onClick={handleAddConfig}>
            <Plus className="h-4 w-4 mr-2" />
            Add Configuration
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
