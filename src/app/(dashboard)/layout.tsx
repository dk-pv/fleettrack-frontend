// "use client";

// import { useEffect, useState } from "react";

// import {
//   useRouter,
//   usePathname,
// } from "next/navigation";

// import Navbar from "@/components/layout/navbar";

// import Sidebar from "@/components/layout/sidebar";

// import { useAuthStore } from "@/store/auth-store";

// import { roleRoutes } from "@/lib/role-routes";

// export default function DashboardLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [expanded, setExpanded] =
//     useState(false);

//   const router = useRouter();

//   const pathname = usePathname();

//   const {
//     token,
//     hydrated,
//     user,
//   } = useAuthStore();

//   useEffect(() => {
//     if (
//       hydrated &&
//       !token
//     ) {
//       router.replace("/login");
//     }
//   }, [hydrated, token]);

//   useEffect(() => {
//     if (
//       hydrated &&
//       user
//     ) {
//       const allowedRoutes =
//         roleRoutes[user.role];

//       const hasAccess =
//         allowedRoutes.some((route) =>
//           pathname.startsWith(route),
//         );

//       if (!hasAccess) {
//         router.replace("/dashboard");
//       }
//     }
//   }, [
//     hydrated,
//     pathname,
//     user,
//     router,
//   ]);

//   if (!hydrated) {
//     return null;
//   }

//   if (!token) {
//     return null;
//   }

//   return (
//     <main className="min-h-screen bg-[#f5f7fb] text-foreground transition-colors duration-300 dark:bg-[#0b1120]">
//       <Sidebar
//         expanded={expanded}
//         setExpanded={setExpanded}
//       />

//       <div
//         className={`transition-all duration-300 ${
//           expanded
//             ? "ml-[250px]"
//             : "ml-[88px]"
//         }`}
//       >
//         <Navbar expanded={expanded} />

//         <section className="pt-16">
//           {children}
//         </section>
//       </div>
//     </main>
//   );
// }




"use client";

import { useEffect, useState } from "react";

import {
  useRouter,
  usePathname,
} from "next/navigation";

import Navbar from "@/components/layout/navbar";

import Sidebar from "@/components/layout/sidebar";

import { useAuthStore } from "@/store/auth-store";

import { roleRoutes } from "@/lib/role-routes";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] =
    useState(false);

  const router = useRouter();

  const pathname = usePathname();

  const {
    token,
    hydrated,
    user,
  } = useAuthStore();

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login");
    }
  }, [hydrated, token]);

  useEffect(() => {
    if (!hydrated || !user) {
      return;
    }

    const allowedRoutes =
      roleRoutes[user.role];

    const hasAccess =
      allowedRoutes.some((route) =>
        pathname.startsWith(route),
      );

    if (!hasAccess) {
      router.replace("/dashboard");
    }
  }, [pathname, hydrated, user]);

  if (!hydrated) {
    return null;
  }

  if (!token) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-foreground transition-colors duration-300 dark:bg-[#0b1120]">
      <Sidebar
        expanded={expanded}
        setExpanded={setExpanded}
      />

      <div
        className={`transition-all duration-300 ${
          expanded
            ? "ml-[250px]"
            : "ml-[88px]"
        }`}
      >
        <Navbar expanded={expanded} />

        <section className="pt-16">
          {children}
        </section>
      </div>
    </main>
  );
}