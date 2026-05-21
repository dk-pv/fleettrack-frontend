"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";

import ClientForm from "./client-form";

interface AddClientModalProps {
  children: React.ReactNode;
}

export default function AddClientModal({ children }: AddClientModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>{children}</div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add New Client</DialogTitle>
          <DialogDescription>
            Add a new client and assign access role.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <ClientForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}
