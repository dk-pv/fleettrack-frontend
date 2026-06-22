"use client";

import { useEffect, useState } from "react";
import { createUser, updateUser } from "@/lib/user-api";
import { User } from "./TypeUser";

interface Props {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSuccess: () => void;
}

export default function UserModal({
  open,
  onClose,
  user,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "VIEWER",
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name,
        email: user.email,
        password: "",
        role: user.role,
      });
    } else {
      setForm({
        name: "",
        email: "",
        password: "",
        role: "VIEWER",
      });
    }
  }, [user]);

  if (!open) return null;

  const isEdit = !!user;

  async function handleSubmit() {
    try {
      setLoading(true);

      if (isEdit) {
        await updateUser(user.id, form);
      } else {
        await createUser(form);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-card text-foreground border border-border p-6">
        <h2 className="mb-5 text-xl font-bold">
          {isEdit ? "Edit User" : "Add User"}
        </h2>

        <div className="space-y-4">
          <input
            className="w-full rounded-xl border p-3"
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <input
            className="w-full rounded-xl border p-3"
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({
                ...form,
                email: e.target.value,
              })
            }
          />

          <input
            type="password"
            className="w-full rounded-xl border p-3"
            placeholder={
              isEdit
                ? "Leave empty to keep password"
                : "Password"
            }
            value={form.password}
            onChange={(e) =>
              setForm({
                ...form,
                password: e.target.value,
              })
            }
          />

          <select
            className="w-full rounded-xl border p-3"
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value,
              })
            }
          >
            <option value="ADMIN">ADMIN</option>
            <option value="VIEWER">VIEWER</option>
          </select>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="rounded-xl border px-4 py-2"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="rounded-xl bg-primary px-4 py-2 text-white"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : isEdit
              ? "Update User"
              : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}