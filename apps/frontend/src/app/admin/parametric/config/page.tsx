"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plane, CloudRain, Save, Plus, Trash2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";

export default function ParametricConfigPage() {
  const [activeTab, setActiveTab] = useState("flight");
  const [success, setSuccess] = useState<string | null>(null);

  // Flight delay configuration
  const [flightRules, setFlightRules] = useState([
    {
      flightNumber: "UA123",
      date: new Date("2025-05-15"),
      delayHours: 4,
      active: true,
    },
    {
      flightNumber: "BA456",
      date: new Date("2025-05-20"),
      delayHours: 2,
      active: true,
    },
  ]);

  // Rainfall configuration
  const [rainfallZones, setRainfallZones] = useState([
    {
      zoneId: "A",
      location: "Northern Region",
      premiumFactor: 1.2,
      thresholdMm: 50,
      active: true,
    },
    {
      zoneId: "B",
      location: "Central Region",
      premiumFactor: 1.0,
      thresholdMm: 40,
      active: true,
    },
    {
      zoneId: "C",
      location: "Southern Region",
      premiumFactor: 0.8,
      thresholdMm: 30,
      active: true,
    },
  ]);

  const addFlightRule = () => {
    setFlightRules([
      ...flightRules,
      { flightNumber: "", date: new Date(), delayHours: 0, active: true },
    ]);
  };

  const updateFlightRule = (index: number, field: string, value: any) => {
    const updatedRules = [...flightRules];
    updatedRules[index] = { ...updatedRules[index], [field]: value };
    setFlightRules(updatedRules);
  };

  const removeFlightRule = (index: number) => {
    setFlightRules(flightRules.filter((_, i) => i !== index));
  };

  const addRainfallZone = () => {
    setRainfallZones([
      ...rainfallZones,
      {
        zoneId: "",
        location: "",
        premiumFactor: 1.0,
        thresholdMm: 0,
        active: true,
      },
    ]);
  };

  const updateRainfallZone = (index: number, field: string, value: any) => {
    const updatedZones = [...rainfallZones];
    updatedZones[index] = { ...updatedZones[index], [field]: value };
    setRainfallZones(updatedZones);
  };

  const removeRainfallZone = (index: number) => {
    setRainfallZones(rainfallZones.filter((_, i) => i !== index));
  };

  const saveFlightConfig = () => {
    // In a real app, this would save to the backend
    console.log("Saving flight configuration:", flightRules);
    setSuccess("Flight delay configuration saved successfully");
    setTimeout(() => setSuccess(null), 3000);
  };

  const saveRainfallConfig = () => {
    // In a real app, this would save to the backend
    console.log("Saving rainfall configuration:", rainfallZones);
    setSuccess("Rainfall configuration saved successfully");
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Parametric Product Configuration</h1>
        <p className="text-gray-500">
          Configure parameters for parametric insurance products
        </p>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-600 text-green-800">
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs
        defaultValue="flight"
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="flight" className="flex items-center">
            <Plane className="h-4 w-4 mr-2" />
            Flight Delay
          </TabsTrigger>
          <TabsTrigger value="rainfall" className="flex items-center">
            <CloudRain className="h-4 w-4 mr-2" />
            Rainfall
          </TabsTrigger>
        </TabsList>

        <TabsContent value="flight" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plane className="h-5 w-5 mr-2" />
                Flight Delay Mock Oracle Configuration
              </CardTitle>
              <CardDescription>
                Configure mock flight delay data for testing. These settings
                will be used by the mock oracle to simulate flight delays.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {flightRules.map((rule, index) => (
                  <div key={index} className="p-4 border rounded-md relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      onClick={() => removeFlightRule(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor={`flight-number-${index}`}>
                          Flight Number
                        </Label>
                        <Input
                          id={`flight-number-${index}`}
                          value={rule.flightNumber}
                          onChange={(e) =>
                            updateFlightRule(
                              index,
                              "flightNumber",
                              e.target.value
                            )
                          }
                          placeholder="e.g., UA123"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`flight-date-${index}`}>
                          Flight Date
                        </Label>
                        <DatePicker
                          date={rule.date}
                          setDate={(date) =>
                            updateFlightRule(index, "date", date)
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor={`delay-hours-${index}`}>
                          Delay Hours
                        </Label>
                        <Input
                          id={`delay-hours-${index}`}
                          type="number"
                          value={rule.delayHours}
                          onChange={(e) =>
                            updateFlightRule(
                              index,
                              "delayHours",
                              Number.parseInt(e.target.value)
                            )
                          }
                          placeholder="e.g., 4"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`flight-active-${index}`}>Active</Label>
                        <Switch
                          id={`flight-active-${index}`}
                          checked={rule.active}
                          onCheckedChange={(checked) =>
                            updateFlightRule(index, "active", checked)
                          }
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addFlightRule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Flight Rule
                </Button>
                <Button
                  variant="default"
                  className="ml-auto flex items-center"
                  onClick={saveFlightConfig}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rainfall" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CloudRain className="h-5 w-5 mr-2" />
                Rainfall Mock Oracle Configuration
              </CardTitle>
              <CardDescription>
                Configure mock rainfall data for testing. These settings will be
                used by the mock oracle to simulate rainfall.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {rainfallZones.map((zone, index) => (
                  <div key={index} className="p-4 border rounded-md relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      onClick={() => removeRainfallZone(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor={`zone-id-${index}`}>Zone ID</Label>
                        <Input
                          id={`zone-id-${index}`}
                          value={zone.zoneId}
                          onChange={(e) =>
                            updateRainfallZone(index, "zoneId", e.target.value)
                          }
                          placeholder="e.g., A"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`zone-location-${index}`}>
                          Location
                        </Label>
                        <Input
                          id={`zone-location-${index}`}
                          value={zone.location}
                          onChange={(e) =>
                            updateRainfallZone(
                              index,
                              "location",
                              e.target.value
                            )
                          }
                          placeholder="e.g., Northern Region"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor={`premium-factor-${index}`}>
                          Premium Factor
                        </Label>
                        <Input
                          id={`premium-factor-${index}`}
                          type="number"
                          step="0.1"
                          value={zone.premiumFactor}
                          onChange={(e) =>
                            updateRainfallZone(
                              index,
                              "premiumFactor",
                              Number.parseFloat(e.target.value)
                            )
                          }
                          placeholder="e.g., 1.2"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`threshold-mm-${index}`}>
                          Threshold (mm)
                        </Label>
                        <Input
                          id={`threshold-mm-${index}`}
                          type="number"
                          value={zone.thresholdMm}
                          onChange={(e) =>
                            updateRainfallZone(
                              index,
                              "thresholdMm",
                              Number.parseInt(e.target.value)
                            )
                          }
                          placeholder="e.g., 50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`zone-active-${index}`}>Active</Label>
                      <Switch
                        id={`zone-active-${index}`}
                        checked={zone.active}
                        onCheckedChange={(checked) =>
                          updateRainfallZone(index, "active", checked)
                        }
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" onClick={addRainfallZone}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rainfall Zone
                </Button>
                <Button
                  variant="default"
                  className="ml-auto flex items-center"
                  onClick={saveRainfallConfig}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Configuration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
