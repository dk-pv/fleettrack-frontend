"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { apiFetch } from "@/lib/fetcher";
import { Customer } from "@/types/customer";
import AddCustomerModal from "./add-customer-modal";
import DeleteCustomerDialog from "./DeleteCustomerDialog";
import CustomerTypeBadge from "./customer-type-badge";
import CustomerAddressesModal from "./customer-addresses-modal";
import CustomerTripsModal from "./customer-trips-modal";

interface Props {
  searchQuery?: string;
}

/**
 * Customer directory table (CUS-02.2) — hand-rolled table with search, edit
 * (reuses the add/edit modal) and delete. Mirrors client-table.
 */
export default function CustomerTable({ searchQuery = "" }: Props) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [addressesFor, setAddressesFor] = useState<Customer | null>(null);
  const [tripsFor, setTripsFor] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    const res = await apiFetch("/customers");
    const data = await res.json();
    setCustomers(data.customers || []);
  };

  // Inlined (not a call to fetchCustomers) to satisfy the no-setState-in-effect
  // lint rule, mirroring the trips hooks.
  useEffect(() => {
    async function load() {
      const res = await apiFetch("/customers");
      const data = await res.json();
      setCustomers(data.customers || []);
    }
    load();
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const res = await apiFetch(`/customers/${deleteId}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        toast.success("Customer deleted");
        fetchCustomers();
      } else {
        toast.error(data.message || "Delete failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setDeleteId(null);
    }
  };

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();

    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q),
    );
  }, [customers, searchQuery]);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-4 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Type</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Phone</th>
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
                  colSpan={6}
                  className="py-10 text-center text-muted-foreground"
                >
                  No customers found
                </td>
              </tr>
            ) : (
              filtered.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-border transition-colors hover:bg-muted/40"
                >
                  <td className="px-6 py-4 font-medium">{customer.name}</td>

                  <td className="px-6 py-4">
                    <CustomerTypeBadge type={customer.type} />
                  </td>

                  <td className="px-6 py-4 text-muted-foreground">
                    {customer.email || "—"}
                  </td>

                  <td className="px-6 py-4 text-muted-foreground">
                    {customer.phone || "—"}
                  </td>

                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <AddCustomerModal editCustomer={customer}>
                        <button className="text-sm font-medium text-primary hover:underline">
                          Edit
                        </button>
                      </AddCustomerModal>

                      <button
                        onClick={() => setAddressesFor(customer)}
                        className="text-sm font-medium text-foreground hover:underline"
                      >
                        Addresses
                      </button>

                      <button
                        onClick={() => setTripsFor(customer)}
                        className="text-sm font-medium text-foreground hover:underline"
                      >
                        Trips
                      </button>

                      <button
                        onClick={() => setDeleteId(customer.id)}
                        className="text-sm font-medium text-red-500 hover:underline"
                      >
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

      <DeleteCustomerDialog
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />

      {addressesFor && (
        <CustomerAddressesModal
          open
          onClose={() => setAddressesFor(null)}
          customer={addressesFor}
        />
      )}

      {tripsFor && (
        <CustomerTripsModal
          open
          onClose={() => setTripsFor(null)}
          customer={tripsFor}
        />
      )}
    </div>
  );
}
