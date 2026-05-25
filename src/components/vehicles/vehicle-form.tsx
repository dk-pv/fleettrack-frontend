interface VehicleFormProps {
  buttonText?: string;
}

export default function VehicleForm({
  buttonText = "Add Vehicle",
}: VehicleFormProps) {
  return (
    <form className="space-y-5">
      {/* Vehicle Name */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Vehicle Name
        </label>

        <input
          type="text"
          placeholder="Enter vehicle name"
          className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none"
        />
      </div>

      {/* Vehicle Number */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Vehicle Number
        </label>

        <input
          type="text"
          placeholder="Enter vehicle number"
          className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none"
        />
      </div>

      {/* Driver */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Assigned Driver
        </label>

        <input
          type="text"
          placeholder="Enter driver name"
          className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none"
        />
      </div>

      {/* GPS */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          GPS Device ID
        </label>

        <input
          type="text"
          placeholder="Enter GPS device ID"
          className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none"
        />
      </div>

      {/* Status */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Status
        </label>

        <select className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none">
          <option>Moving</option>

          <option>Idle</option>

          <option>Offline</option>
        </select>
      </div>

      {/* Submit */}
      <button className="h-11 rounded-lg bg-[#0f172a] px-5 text-sm font-medium text-white dark:bg-white dark:text-black">
        {buttonText}
      </button>
    </form>
  );
}