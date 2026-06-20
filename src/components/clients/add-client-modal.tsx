"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import ClientForm from "./client-form";

interface Client {
  id: string;
  name: string;
  email: string;
  apiUrl: string;
}

interface AddClientModalProps {
  children: React.ReactNode;
  editUser?: Client | null;
}

export default function AddClientModal({
  children,
  editUser,
}: AddClientModalProps) {
  const isEdit = !!editUser;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div>{children}</div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {isEdit ? "Edit Client" : "Add New Client"}
          </DialogTitle>

          <DialogDescription>
            {isEdit
              ? "Update client information and API."
              : "Add a new client and assign tracking API."}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          <ClientForm
            editUser={editUser}
            buttonText={isEdit ? "Update Client" : "Add Client"}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}