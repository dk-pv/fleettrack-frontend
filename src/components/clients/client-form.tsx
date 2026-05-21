interface ClientFormProps {
  buttonText?: string;
}

export default function ClientForm({
  buttonText = "Add Client",
}: ClientFormProps) {
  return (
    <form className="space-y-5">
      {/* Name */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Full Name
        </label>

        <input
          type="text"
          placeholder="Enter full name"
          className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none"
        />
      </div>

      {/* Email */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Email Address
        </label>

        <input
          type="email"
          placeholder="Enter email address"
          className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none"
        />
      </div>

      {/* Role */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          User Role
        </label>

        <select className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none">
          <option>Admin</option>

          <option>Fleet Manager</option>

          <option>Viewer</option>
        </select>
      </div>

      {/* Password */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Password
        </label>

        <input
          type="password"
          placeholder="Enter password"
          className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none"
        />
      </div>

      {/* Status */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Status
        </label>

        <select className="h-11 w-full rounded-lg border border-border bg-muted px-4 text-sm outline-none">
          <option>Active</option>

          <option>Inactive</option>
        </select>
      </div>

      {/* Button */}
      <button className="mt-3 h-11 rounded-lg bg-[#0f172a] px-5 text-sm font-medium text-white dark:bg-white dark:text-black">
        {buttonText}
      </button>
    </form>
  );
}