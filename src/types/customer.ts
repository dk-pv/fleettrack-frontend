/**
 * Customer domain contract (CUS-01 / CUS-02) — mirrors the API's Customer shape.
 * Phase 1: core identity + type. Trip history, contact/tax and address book are
 * separate backlog items and not modelled here yet.
 */

export type CustomerType = "SHIPPER" | "RECEIVER" | "CORPORATE";

/** All customer types, for the create/edit form's type selector. */
export const CUSTOMER_TYPES: CustomerType[] = [
  "SHIPPER",
  "RECEIVER",
  "CORPORATE",
];

export interface Customer {
  id: string;
  name: string;
  type: CustomerType;

  /* Contact information (CUS-03.1) */
  company?: string | null;
  contactPerson?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;

  /* Tax / registration details (CUS-04.1) */
  taxId?: string | null;
  registrationNumber?: string | null;

  /* Free-text notes (CUS-08.1) */
  notes?: string | null;

  createdAt: string;
  updatedAt?: string;
}
