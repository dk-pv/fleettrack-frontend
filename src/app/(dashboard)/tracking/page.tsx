"use client";

import { useState } from "react";

import { vehicles } from "@/data/tracking-data";
import type { Vehicle } from "@/data/tracking-data";

import TrackingMap from "@/components/tracking/tracking-map";
import VehicleDetails from "@/components/tracking/vehicle-details";
import VehicleList from "@/components/tracking/vehicle-list";

export default function TrackingPage() {
  const [selected, setSelected] = useState<Vehicle>(vehicles[0]);

  return (
    <div className="grid h-[calc(100vh-64px)] grid-cols-[280px_1fr_300px] overflow-hidden">
      <VehicleList selected={selected} onSelect={setSelected} />
      <TrackingMap />
      <VehicleDetails vehicle={selected} />
    </div>
  );
}