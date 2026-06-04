"use client";

import { useRouter } from "next/navigation";

import { userAuthService } from "@/src/services/user-auth.service";
import { useAuthStore } from "@/src/store/auth.store";

import { RoleLoginForm } from "@/src/components/auth/role-login-form";

export default function AdminLoginPage() {
  const router = useRouter();

  const { setAuth } = useAuthStore();

  async function handleLogin(email: string, password: string) {
    const response = await userAuthService.adminLogin({
      email,
      password,
    });

    if (response.user.role !== "ADMIN") {
      throw new Error("Este usuario no es administrador");
    }

    setAuth(response.accessToken, response.user);

    router.push("/restaurant/admin");
  }

  return (
    <RoleLoginForm
      title="Login Administrador"
      description="Acceso al panel administrativo"
      onSubmit={handleLogin}
    />
  );
}
