"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Plus, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAuthStore } from "@/store/auth-store";
import { useTripOptions } from "@/hooks/use-trip-options";
import { useRoutePreview } from "@/hooks/use-route-preview";
import { useOverlapCheck } from "@/hooks/use-overlap-check";
import TripRouteMap from "@/components/trips/trip-route-map";
import OverlapNotice from "@/components/trips/overlap-notice";
import { CreateTripDto, MAX_TRIP_STOPS } from "@/types/trip";
import {
  addStop,
  moveStop,
  removeStop,
  StopDraft,
  updateStopAddress,
} from "@/lib/trip-stops";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreate: (dto: CreateTripDto) => Promise<unknown>;
}

const inputClass =
  "h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary";

export default function TripFormModal({ open, onClose, onCreate }: Props) {
  const { user } = useAuthStore();
  const { vehicles, drivers, loading: optionsLoading } = useTripOptions();
  const {
    points: routePoints,
    loading: routeLoading,
    generate: generateRoute,
    clear: clearRoute,
  } = useRoutePreview();

  const [reference, setReference] = useState("");
  const [pickup, setPickup] = useState("");
  const [delivery, setDelivery] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [notes, setNotes] = useState("");
  const [stops, setStops] = useState<StopDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Live double-booking checks (TM-09 / TM-10) — through the service, never the mock.
  const vehicleOverlap = useOverlapCheck("vehicle", {
    resourceId: vehicleId,
    scheduledStart: start,
    scheduledEnd: end,
  });
  const driverOverlap = useOverlapCheck("driver", {
    resourceId: driverId,
    scheduledStart: start,
    scheduledEnd: end,
  });

  const scheduleValid = !!start && !!end && new Date(end) > new Date(start);

  const resetForm = () => {
    setReference("");
    setPickup("");
    setDelivery("");
    setStart("");
    setEnd("");
    setVehicleId("");
    setDriverId("");
    setNotes("");
    setStops([]);
    clearRoute();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !reference ||
      !pickup ||
      !delivery ||
      !start ||
      !end ||
      !vehicleId ||
      !driverId
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(end) <= new Date(start)) {
      toast.error("Planned end must be after planned start");
      return;
    }

    if (vehicleOverlap.hasOverlap) {
      toast.error("This vehicle is already booked for an overlapping schedule");
      return;
    }

    if (driverOverlap.hasOverlap) {
      toast.error("This driver is already booked for an overlapping schedule");
      return;
    }

    const driver = drivers.find((d) => d.id === driverId);

    const dto: CreateTripDto = {
      reference,
      clientId: user?.id ?? "",
      vehicleId,
      driverId,
      driverName: driver?.name ?? null,
      origin: pickup,
      destination: delivery,
      stops: stops
        .map((s) => ({ address: s.address.trim() }))
        .filter((s) => s.address.length > 0),
      scheduledStart: new Date(start).toISOString(),
      scheduledEnd: new Date(end).toISOString(),
      notes: notes || undefined,
    };

    try {
      setSubmitting(true);
      await onCreate(dto);
      toast.success("Trip created");
      resetForm();
      onClose();
    } catch (err) {
      console.log(err);
      if (err instanceof Error && err.message === "VEHICLE_OVERLAP") {
        toast.error(
          "This vehicle is already booked for an overlapping schedule",
        );
      } else if (err instanceof Error && err.message === "DRIVER_OVERLAP") {
        toast.error(
          "This driver is already booked for an overlapping schedule",
        );
      } else {
        toast.error("Failed to create trip");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Trip</DialogTitle>
          <DialogDescription>
            Schedule a new trip and assign a vehicle and driver.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Reference</label>
            <input
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="TRIP-2026-0001"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Pickup address
              </label>
              <input
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Pickup location"
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Delivery address
              </label>
              <input
                value={delivery}
                onChange={(e) => setDelivery(e.target.value)}
                placeholder="Delivery location"
                className={inputClass}
              />
            </div>
          </div>

          {/* Stops (optional, ordered — max 10) */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium">Stops (optional)</label>
              <span className="text-xs text-muted-foreground">
                {stops.length}/{MAX_TRIP_STOPS}
              </span>
            </div>

            {stops.length > 0 && (
              <div className="space-y-2">
                {stops.map((stop, index) => (
                  <div key={stop.id} className="flex items-center gap-2">
                    <span className="w-4 shrink-0 text-xs text-muted-foreground">
                      {index + 1}
                    </span>
                    <input
                      value={stop.address}
                      onChange={(e) =>
                        setStops((prev) =>
                          updateStopAddress(prev, stop.id, e.target.value),
                        )
                      }
                      placeholder={`Stop ${index + 1} address`}
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setStops((prev) => moveStop(prev, index, -1))
                      }
                      disabled={index === 0}
                      aria-label="Move stop up"
                      className="shrink-0 rounded-lg border border-border p-2 hover:bg-muted disabled:opacity-40"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setStops((prev) => moveStop(prev, index, 1))
                      }
                      disabled={index === stops.length - 1}
                      aria-label="Move stop down"
                      className="shrink-0 rounded-lg border border-border p-2 hover:bg-muted disabled:opacity-40"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setStops((prev) => removeStop(prev, stop.id))
                      }
                      aria-label="Remove stop"
                      className="shrink-0 rounded-lg border border-border p-2 text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={() => setStops((prev) => addStop(prev))}
              disabled={stops.length >= MAX_TRIP_STOPS}
              className="mt-2 inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              Add stop
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Planned start
              </label>
              <input
                type="datetime-local"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">
                Planned end
              </label>
              <input
                type="datetime-local"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Vehicle</label>
              <select
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                disabled={optionsLoading}
                className={inputClass}
              >
                <option value="">Select vehicle</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.vehicleNumber}
                    {v.vehicleName ? ` — ${v.vehicleName}` : ""}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Driver</label>
              <select
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                disabled={optionsLoading}
                className={inputClass}
              >
                <option value="">Select driver</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Vehicle & driver availability (overlap validation) */}
          <OverlapNotice
            label="Vehicle"
            show={!!vehicleId && scheduleValid}
            checking={vehicleOverlap.checking}
            hasOverlap={vehicleOverlap.hasOverlap}
            conflicts={vehicleOverlap.conflicts}
          />
          <OverlapNotice
            label="Driver"
            show={!!driverId && scheduleValid}
            checking={driverOverlap.checking}
            hasOverlap={driverOverlap.hasOverlap}
            conflicts={driverOverlap.conflicts}
          />

          <div>
            <label className="mb-1 block text-sm font-medium">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any special instructions"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>

          {/* Route preview (geocoded) */}
          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium">Route preview</label>
              <button
                type="button"
                onClick={() =>
                  generateRoute({
                    origin: pickup,
                    destination: delivery,
                    stops: stops
                      .map((s) => s.address.trim())
                      .filter((a) => a.length > 0),
                  })
                }
                disabled={!pickup || !delivery}
                className="text-xs font-medium text-primary hover:underline disabled:no-underline disabled:opacity-50"
              >
                Preview route
              </button>
            </div>

            {routePoints.length > 0 && (
              <TripRouteMap points={routePoints} loading={routeLoading} />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                vehicleOverlap.hasOverlap ||
                driverOverlap.hasOverlap
              }
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Trip"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
