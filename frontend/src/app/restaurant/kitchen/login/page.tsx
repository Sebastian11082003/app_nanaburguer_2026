"use client";

import { useRouter } from "next/navigation";

import { RoleLoginForm } from "@/src/components/auth/role-login-form";
import { userAuthService } from "@/src/services/user-auth.service";
import { useAuthStore } from "@/src/store/auth.store";

export default function KitchenLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  async function handleLogin(email: string, password: string, slug: string) {
    const response = await userAuthService.kitchenLogin({
      email,
      password,
      slug,
    });

    if (response.user.role !== "KITCHEN") {
      throw new Error("Este usuario no es cocina");
    }

    setAuth(response.accessToken, response.user);
    router.push("/restaurant/kitchen");
  }

  return (
    <RoleLoginForm
      title="Login Cocina"
      description="Acceso a tickets de preparación"
      emailPrefix="kitchen"
      onSubmit={handleLogin}
    />
  );
}
