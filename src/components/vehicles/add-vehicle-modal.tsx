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

interface AddVehicleModalProps {
  children: React.ReactNode;
}

export default function AddVehicleModal({
  children,
}: AddVehicleModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>{children}</div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Add New Vehicle
          </DialogTitle>

          <DialogDescription>
            Add a vehicle and assign driver
            details.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <VehicleForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}