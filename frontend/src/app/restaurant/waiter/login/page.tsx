"use client";

import { useRouter } from "next/navigation";

import { RoleLoginForm } from "@/src/components/auth/role-login-form";
import { userAuthService } from "@/src/services/user-auth.service";
import { useAuthStore } from "@/src/store/auth.store";

export default function WaiterLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  async function handleLogin(email: string, password: string, slug: string) {
    const response = await userAuthService.waiterLogin({
      email,
      password,
      slug,
    });

    if (response.user.role !== "WAITER") {
      throw new Error("Este usuario no es mesero");
    }

    setAuth(response.accessToken, response.user);
    router.push("/restaurant/waiter");
  }

  return (
    <RoleLoginForm
      title="Login Mesero"
      description="Acceso a mesas y órdenes"
      emailPrefix="waiter"
      onSubmit={handleLogin}
    />
  );
}
