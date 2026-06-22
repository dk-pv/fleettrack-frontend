"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import { toast } from "sonner";

interface Client {
  id: string;
  name: string;
  email: string;
  apiUrl: string;
}

interface Props {
  buttonText?: string;
  editUser?: Client | null;
}

export default function ClientForm({
  buttonText = "Add Client",
  editUser,
}: Props) {
  const [name, setName] = useState(editUser?.name || "");
  const [email, setEmail] = useState(editUser?.email || "");
  const [password, setPassword] = useState("");
  const [apiUrl, setApiUrl] = useState(editUser?.apiUrl || "");
  const [loading, setLoading] = useState(false);

  const isEdit = !!editUser;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      const url = isEdit
        ? `${API_URL}/clients/${editUser.id}`
        : `${API_URL}/clients`;

      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name,
          email,
          password,
          apiUrl,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Success");
        window.location.reload();
      } else {
        toast.error(data.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Client Name"
        className="h-10 w-full rounded-lg border px-3"
      />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="h-10 w-full rounded-lg border px-3"
      />

      <input
        value={apiUrl}
        onChange={(e) => setApiUrl(e.target.value)}
        placeholder="API URL"
        className="h-10 w-full rounded-lg border px-3"
      />

      {!isEdit && (
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="h-10 w-full rounded-lg border px-3"
        />
      )}

      <button
        disabled={loading}
        className="w-full h-10 rounded-lg bg-primary text-white"
      >
        {loading ? "Saving..." : buttonText}
      </button>
    </form>
  );
}
