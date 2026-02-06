"use client";

import { Lock, User } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";

/**
 * Schema buat login
 */
const LoginSchema = z.object({
  name: z.string().min(1, "Nomor Induk wajib diisi"),

  password: z
    .string()
    .regex(/^\d+$/, "Password hanya boleh angka")
    .min(4, "Password minimal 4 digit")
    .max(10, "Password maksimal 10 digit"),
});

type LoginSchemaType = z.infer<typeof LoginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginSchemaType) => {
    setIsLoading(true);

    try {
      console.log("Data login:", data);

      // Simulasi proses login
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Login berhasil!");

      // contoh redirect
      router.push("/dashboard");
    } catch (error) {
      alert("Login gagal!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white rounded-xl shadow-lg w-100 overflow-hidden">
        <div className="bg-blue-500 text-white p-6 text-center">
          <h2 className="text-xl font-semibold">Selamat Datang</h2>
          <p className="text-sm">Masuk ke akun anda untuk melanjutkan</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="block text-sm mb-1">Nomor Induk Siswa</label>

            <div className="relative">
              <User className="absolute left-2 top-2.5 text-gray-400" size={18} />

              <input
                {...register("name")}
                className="w-full border rounded-md pl-8 p-2"
                placeholder="Masukkan Nomor Induk"
              />
            </div>

            {errors.name && (
              <p className="text-red-500 text-sm mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>

            <div className="relative">
              <Lock className="absolute left-2 top-2.5 text-gray-400" size={18} />

              <input
                type="password"
                {...register("password")}
                className="w-full border rounded-md pl-8 p-2"
                placeholder="Masukkan Password"
              />
            </div>

            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" />
            <label className="text-sm">Ingat Saya</label>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            {isLoading ? "Loading..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}