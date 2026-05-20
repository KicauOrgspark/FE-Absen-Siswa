"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const ALLOWED_ROLES = ["guru", "admin", "superadmin"];

export default function AdminGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || !ALLOWED_ROLES.includes(user.role))) {
      router.replace("/");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}