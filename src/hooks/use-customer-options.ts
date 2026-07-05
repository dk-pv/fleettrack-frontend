"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/fetcher";
import { CustomerOption } from "@/types/customer";

/**
 * Loads the logged-in CLIENT's own customers for the trip form's customer selector
 * (CUS-07.1). Reuses the tenant-scoped customers list (GET /customers), so a trip
 * can only be linked to a customer the client owns. Fails soft (empty) so the
 * optional selector never blocks trip creation.
 */
export function useCustomerOptions() {
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Inlined to satisfy the no-setState-in-effect lint rule.
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiFetch("/customers");
        const data = await res.json();
        setCustomers(data.customers || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return { customers, loading };
}
