"use client";

import { User } from "@/components/users/TypeUser";

interface Props {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UserTable({
  users,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Name
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Email
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Role
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Created
              </th>

              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {users.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  No users found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="
                    border-b border-border
                    transition-colors
                    hover:bg-muted/40
                  "
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    {user.name}
                  </td>

                  <td className="px-6 py-4 text-muted-foreground">
                    {user.email}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`
                        inline-flex rounded-full px-3 py-1 text-xs font-medium
                        ${
                          user.role === "ADMIN"
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : "bg-gray-500/10 text-gray-600 dark:text-gray-300"
                        }
                      `}
                    >
                      {user.role}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-muted-foreground">
                    {new Date(
                      user.createdAt
                    ).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-3">
                      <button
                        onClick={() => onEdit(user)}
                        className="
                          text-sm font-medium text-primary
                          hover:underline
                        "
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => onDelete(user)}
                        className="
                          text-sm font-medium text-red-500
                          hover:underline
                        "
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
    </div>
  );
}