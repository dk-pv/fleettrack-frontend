"use client";

import { useState } from "react";
import { API_URL } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface Client {
  id: string;
  name: string;
  email: string;
  apiUrl: string;
}

interface Props {
  buttonText?: string;
  editUser?: Client | null;
  onSuccess?: () => void;
}

export default function ClientForm({
  buttonText = "Add Client",
  editUser,
  onSuccess,
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
        toast.success(isEdit ? "Client updated" : "Client created");
        onSuccess?.();
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (err) {
      // On failure keep the modal open (onSuccess not called), surface the error,
      // and restore the button via finally.
      console.error(err);
      toast.error("Something went wrong. Please try again.");
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
        className="h-10 w-full rounded-lg border px-3 text-sm"
      />

      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="h-10 w-full rounded-lg border px-3 text-sm"
      />

      <input
        value={apiUrl}
        onChange={(e) => setApiUrl(e.target.value)}
        placeholder="API URL"
        className="h-10 w-full rounded-lg border px-3 text-sm"
      />

      {!isEdit && (
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="h-10 w-full rounded-lg border px-3 text-sm"
        />
      )}

      <Button
        type="submit"
        isLoading={loading}
        className="w-full h-11"
      >
        {buttonText}
      </Button>
    </form>
  );
}
