// "use client";

// import { useState } from "react";
// import { Search } from "lucide-react";

// import { vehicles } from "@/data/tracking-data";
// import type { Vehicle } from "@/data/tracking-data";

// import VehicleCard from "./vehicle-card";

// interface VehicleListProps {
//   selected: Vehicle;
//   onSelect: (vehicle: Vehicle) => void;
// }

// export default function VehicleList({ selected, onSelect }: VehicleListProps) {
//   const [query, setQuery] = useState("");

//   const filtered = vehicles.filter(
//     (v) =>
//       v.number.toLowerCase().includes(query.toLowerCase()) ||
//       v.driver.toLowerCase().includes(query.toLowerCase())
//   );

//   return (
//     <div className="flex h-[calc(100vh-64px)] flex-col border-r border-border bg-background">
//       {/* Header */}
//       <div className="border-b border-border px-4 py-4">
//         <h2 className="text-lg font-bold">Fleet Vehicles</h2>

//         <div className="relative mt-3">
//           <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
//           <input
//             type="text"
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             placeholder="Search vehicles..."
//             className="h-9 w-full rounded-lg border border-border bg-muted pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-blue-400 dark:focus:border-blue-500"
//           />
//         </div>
//       </div>

//       {/* Vehicle List */}
//       <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
//         {filtered.length === 0 ? (
//           <p className="mt-6 text-center text-sm text-muted-foreground">
//             No vehicles found.
//           </p>
//         ) : (
//           filtered.map((vehicle) => (
//             <VehicleCard
//               key={vehicle.id}
//               vehicle={vehicle}
//               active={selected.id === vehicle.id}
//               onClick={() => onSelect(vehicle)}
//             />
//           ))
//         )}
//       </div>
//     </div>
//   );
// }




"use client";

import { useState } from "react";

import { Search } from "lucide-react";

import VehicleCard from "./vehicle-card";

interface Vehicle {
  id: string;

  vehicleName: string;

  vehicleNumber: string;

  gpsDeviceId: string;

  driverName: string;

  clientName: string;

  status: string;

  latitude: number;

  longitude: number;

  speed: number;

  updatedAt: string;
}

interface VehicleListProps {
  vehicles: Vehicle[];

  selected: Vehicle;

  onSelect: (vehicle: Vehicle) => void;
}

export default function VehicleList({
  vehicles,
  selected,
  onSelect,
}: VehicleListProps) {
  const [query, setQuery] = useState("");

  const filtered = vehicles.filter(
    (vehicle) =>
      vehicle.vehicleNumber
        .toLowerCase()
        .includes(query.toLowerCase()) ||
      vehicle.driverName
        .toLowerCase()
        .includes(query.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-64px)] flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="border-b border-border px-4 py-4">
        <h2 className="text-lg font-bold">Fleet Vehicles</h2>

        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search vehicles..."
            className="h-9 w-full rounded-lg border border-border bg-muted pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-blue-400 dark:focus:border-blue-500"
          />
        </div>
      </div>

      {/* Vehicle List */}
      <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
        {filtered.length === 0 ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            No vehicles found.
          </p>
        ) : (
          filtered.map((vehicle) => (
            <VehicleCard
              key={vehicle.id}
              vehicle={vehicle}
              active={selected.id === vehicle.id}
              onClick={() => onSelect(vehicle)}
            />
          ))
        )}
      </div>
    </div>
  );
}