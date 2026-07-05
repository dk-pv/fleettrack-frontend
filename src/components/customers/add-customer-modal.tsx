"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Customer } from "@/types/customer";
import CustomerForm from "./customer-form";

interface Props {
  children: React.ReactNode;
  editCustomer?: Customer | null;
}

/** Add/Edit customer dialog — one modal reused for both (mirrors add-client-modal). */
export default function AddCustomerModal({ children, editCustomer }: Props) {
  const isEdit = !!editCustomer;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>{children}</div>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEdit ? "Edit Customer" : "Add New Customer"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Update customer details."
              : "Register a new customer in the directory."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <CustomerForm
            editCustomer={editCustomer}
            buttonText={isEdit ? "Update Customer" : "Add Customer"}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
