// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { apiFetch } from "@/lib/fetcher";

// interface Client {
//   id: string;
//   name: string;
//   email: string;
//   apiUrl: string;
//   createdAt: string;
// }

// export default function ClientTable({ searchQuery = "" }) {
//   const [clients, setClients] = useState<Client[]>([]);

//   const fetchClients = async () => {
//     const res = await apiFetch("/clients");
//     const data = await res.json();
//     setClients(data.clients || []);
//   };

//   useEffect(() => {
//     fetchClients();
//   }, []);

//   const filtered = useMemo(() => {
//     const q = searchQuery.toLowerCase();

//     return clients.filter(
//       (c) =>
//         c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q),
//     );
//   }, [clients, searchQuery]);

//   return (
//     <div className="rounded-xl border bg-card overflow-hidden">
//       <table className="w-full">
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>Email</th>
//             <th>API URL</th>
//             <th>Created</th>
//           </tr>
//         </thead>

//         <tbody>
//           {filtered.map((client) => (
//             <tr key={client.id}>
//               <td>{client.name}</td>
//               <td>{client.email}</td>
//               <td className="max-w-[300px] truncate">{client.apiUrl}</td>
//               <td>{new Date(client.createdAt).toLocaleDateString()}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }






"use client";

import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/lib/fetcher";
import AddClientModal from "./add-client-modal";

interface Client {
  id: string;
  name: string;
  email: string;
  apiUrl: string;
  createdAt: string;
}

interface Props {
  searchQuery?: string;
}

export default function ClientTable({
  searchQuery = "",
}: Props) {
  const [clients, setClients] = useState<Client[]>([]);

  const fetchClients = async () => {
    const res = await apiFetch("/clients");
    const data = await res.json();
    setClients(data.clients || []);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();

    return clients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [clients, searchQuery]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[950px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-4 text-left text-sm font-semibold">
                Name
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Email
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                API URL
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Created
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  No clients found
                </td>
              </tr>
            ) : (
              filtered.map((client) => (
                <tr
                  key={client.id}
                  className="
                    border-b border-border
                    hover:bg-muted/40
                    transition-colors
                  "
                >
                  <td className="px-6 py-4 font-medium">
                    {client.name}
                  </td>

                  <td className="px-6 py-4 text-muted-foreground">
                    {client.email}
                  </td>

                  <td className="px-6 py-4 max-w-[420px]">
                    <div
                      className="truncate text-muted-foreground"
                      title={client.apiUrl}
                    >
                      {client.apiUrl}
                    </div>
                  </td>

                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(
                      client.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <AddClientModal editUser={client}>
                        <button className="text-primary text-sm font-medium hover:underline">
                          Edit
                        </button>
                      </AddClientModal>

                      <button className="text-red-500 text-sm font-medium hover:underline">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}