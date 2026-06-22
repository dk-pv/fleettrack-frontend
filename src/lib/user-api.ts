import { API_URL } from "./api";

export async function getUsers() {
  const res = await fetch(`${API_URL}/users`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch users");

  return res.json();
}

export async function createUser(data: any) {
  const res = await fetch(`${API_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function updateUser(id: string, data: any) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function deleteUser(id: string) {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: "DELETE",
  });

  return res.json();
}