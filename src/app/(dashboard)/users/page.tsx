"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import UserTable from "@/components/users/UserTable";
import UserModal from "@/components/users/UserModal";
import DeleteConfirmModal from "@/components/users/DeleteConfirmModal";

import { getUsers, deleteUser } from "@/lib/user-api";
import { User } from "@/components/users/TypeUser";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [deleteUserState, setDeleteUserState] =
    useState<User | null>(null);

  async function loadUsers() {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      toast.error("Failed to load users");
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleDeleteConfirm() {
    if (!deleteUserState) return;

    try {
      await deleteUser(deleteUserState.id);
      toast.success("User deleted successfully");
      loadUsers();
    } catch {
      toast.error("Failed to delete user");
    } finally {
      setDeleteUserState(null);
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-5xl font-bold tracking-tight">
              User Management
            </h1>

            <p className="mt-2 text-muted-foreground">
              Manage system users and roles
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedUser(null);
              setModalOpen(true);
            }}
            className="
              inline-flex items-center gap-2
              rounded-2xl bg-primary px-5 py-3
              text-sm font-medium text-white
              shadow-sm transition hover:opacity-90
            "
          >
            + Add User
          </button>
        </div>

        {/* Table */}
        <UserTable
          users={users}
          onEdit={(user) => {
            setSelectedUser(user);
            setModalOpen(true);
          }}
          onDelete={(user) => {
            setDeleteUserState(user);
          }}
        />
      </div>

      {/* Add / Edit Modal */}
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        onSuccess={() => {
          loadUsers();

          if (selectedUser) {
            toast.success("User updated successfully");
          } else {
            toast.success("User created successfully");
          }
        }}
      />

      {/* Delete Modal */}
      <DeleteConfirmModal
        open={!!deleteUserState}
        userName={deleteUserState?.name}
        onClose={() => setDeleteUserState(null)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}