"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import VehicleForm from "./vehicle-form";

interface Vehicle {
  id: string;
  vehicleName: string;
  vehicleNumber: string;
  gpsDeviceId: string;
  driverName: string;
  clientName: string;
  status: string;
}

interface AddVehicleModalProps {
  children: React.ReactNode;
  editVehicle?: Vehicle | null;
}

export default function AddVehicleModal({
  children,
  editVehicle,
}: AddVehicleModalProps) {
  const isEdit = !!editVehicle;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>{children}</div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEdit ? "Edit Vehicle" : "Add New Vehicle"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Update vehicle details."
              : "Add a vehicle and assign driver details."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <VehicleForm
            editVehicle={editVehicle}
            buttonText={isEdit ? "Update Vehicle" : "Add Vehicle"}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
