// "use client";

// import { useEffect, useState } from "react";

// import { API_URL } from "@/lib/api";

// interface User {
//   role: string;
// }

// export default function ClientStats() {
//   const [users, setUsers] = useState<User[]>([]);

//   const fetchUsers = async () => {
//     try {
//       const token = localStorage.getItem("token");

//       const response = await fetch(`${API_URL}/clients`, {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       const data = await response.json();

//       setUsers(data.users || []);
//     } catch (error) {
//       console.log(error);
//     }
//   };

//   useEffect(() => {
//     fetchUsers();
//   }, []);

//   const totalUsers = users.length;

//   const admins = users.filter((user) => user.role === "ADMIN").length;

//   const clients = users.filter((user) => user.role === "CLIENT").length;

//   const viewers = users.filter((user) => user.role === "VIEWER").length;

//   const stats = [
//     {
//       title: "Total Users",
//       value: totalUsers,
//     },
//     {
//       title: "Admins",
//       value: admins,
//     },
//     {
//       title: "Clients",
//       value: clients,
//     },
//     {
//       title: "Viewers",
//       value: viewers,
//     },
//   ];

//   return (
//     <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
//       {stats.map((item) => (
//         <div
//           key={item.title}
//           className="rounded-lg border border-border bg-card p-6 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
//         >
//           <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{item.title}</p>

//           <h3 className="mt-4 text-3xl font-extrabold tracking-tight text-foreground leading-none">{item.value}</h3>
//         </div>
//       ))}
//     </div>
//   );
// }




"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/api";

export default function ClientStats() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/clients`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setCount(data.clients?.length || 0);
    };

    load();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="rounded-xl border bg-card p-6">
        <p>Total Clients</p>
        <h2 className="text-3xl font-bold">{count}</h2>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <p>Active Clients</p>
        <h2 className="text-3xl font-bold">{count}</h2>
      </div>
    </div>
  );
}