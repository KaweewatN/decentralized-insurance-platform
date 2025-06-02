"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Check, CloudRain, Plus, Save, Trash2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Slider } from "@/components/ui/slider"

// Mock data for rainfall configurations
const mockRainfallZones = [
  { id: 1, zoneName: "Zone A", location: "Northern Region", premiumFactor: 1.2, thresholdMm: 50 },
  { id: 2, zoneName: "Zone B", location: "Central Region", premiumFactor: 1.0, thresholdMm: 40 },
  { id: 3, zoneName: "Zone C", location: "Southern Region", premiumFactor: 1.5, thresholdMm: 60 },
]

export function RainfallConfig() {
  const [rainfallZones, setRainfallZones] = useState(mockRainfallZones)
  const [newZone, setNewZone] = useState({
    zoneName: "",
    location: "",
    premiumFactor: 1.0,
    thresholdMm: 50,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const handleAddZone = () => {
    if (!newZone.zoneName || !newZone.location) return

    const newId = Math.max(0, ...rainfallZones.map((z) => z.id)) + 1
    setRainfallZones([...rainfallZones, { ...newZone, id: newId }])
    setNewZone({
      zoneName: "",
      location: "",
      premiumFactor: 1.0,
      thresholdMm: 50,
    })

    // Show success message
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleEditZone = (id: number) => {
    const zoneToEdit = rainfallZones.find((z) => z.id === id)
    if (!zoneToEdit) return

    setNewZone({ ...zoneToEdit })
    setIsEditing(true)
    setEditingId(id)
  }

  const handleUpdateZone = () => {
    if (!editingId) return

    setRainfallZones(rainfallZones.map((z) => (z.id === editingId ? { ...newZone, id: editingId } : z)))

    setNewZone({
      zoneName: "",
      location: "",
      premiumFactor: 1.0,
      thresholdMm: 50,
    })
    setIsEditing(false)
    setEditingId(null)

    // Show success message
    setSaveSuccess(true)
    setTimeout(() => setSaveSuccess(false), 3000)
  }

  const handleDeleteZone = (id: number) => {
    setRainfallZones(rainfallZones.filter((z) => z.id !== id))
  }

  const handleCancelEdit = () => {
    setNewZone({
      zoneName: "",
      location: "",
      premiumFactor: 1.0,
      thresholdMm: 50,
    })
    setIsEditing(false)
    setEditingId(null)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CloudRain className="h-5 w-5" />
          Rainfall Insurance Configuration
        </CardTitle>
        <CardDescription>Configure geographical zones and parameters for parametric rainfall insurance</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="zones">
          <TabsList className="mb-4">
            <TabsTrigger value="zones">Geographical Zones</TabsTrigger>
            <TabsTrigger value="add">Add New Zone</TabsTrigger>
          </TabsList>

          <TabsContent value="zones">
            {rainfallZones.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone Name</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Premium Factor</TableHead>
                    <TableHead>Threshold (mm)</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rainfallZones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">{zone.zoneName}</TableCell>
                      <TableCell>{zone.location}</TableCell>
                      <TableCell>{zone.premiumFactor.toFixed(1)}x</TableCell>
                      <TableCell>{zone.thresholdMm} mm</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditZone(zone.id)}>
                            Edit
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteZone(zone.id)}>
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
                <h3 className="text-lg font-semibold">No zones configured</h3>
                <p className="text-muted-foreground mt-1">Add a new geographical zone to get started</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="add">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="zoneName">Zone Name</Label>
                  <Input
                    id="zoneName"
                    placeholder="e.g. Zone A"
                    value={newZone.zoneName}
                    onChange={(e) => setNewZone({ ...newZone, zoneName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location Description</Label>
                  <Input
                    id="location"
                    placeholder="e.g. Northern Region"
                    value={newZone.location}
                    onChange={(e) => setNewZone({ ...newZone, location: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="premiumFactor">Premium Factor: {newZone.premiumFactor.toFixed(1)}x</Label>
                <Slider
                  id="premiumFactor"
                  min={0.5}
                  max={2.0}
                  step={0.1}
                  value={[newZone.premiumFactor]}
                  onValueChange={(value) => setNewZone({ ...newZone, premiumFactor: value[0] })}
                  className="py-4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="thresholdMm">Rainfall Threshold: {newZone.thresholdMm} mm</Label>
                <Slider
                  id="thresholdMm"
                  min={10}
                  max={100}
                  step={5}
                  value={[newZone.thresholdMm]}
                  onValueChange={(value) => setNewZone({ ...newZone, thresholdMm: value[0] })}
                  className="py-4"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {saveSuccess && (
          <Alert variant="success" className="mt-4">
            <Check className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Rainfall zone configuration has been saved successfully.</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleUpdateZone}>
              <Save className="h-4 w-4 mr-2" />
              Update Zone
            </Button>
          </>
        ) : (
          <Button onClick={handleAddZone}>
            <Plus className="h-4 w-4 mr-2" />
            Add Zone
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
