"use client";

import { useRouter } from "next/navigation";

import { RoleLoginForm } from "@/src/components/auth/role-login-form";
import { userAuthService } from "@/src/services/user-auth.service";
import { useAuthStore } from "@/src/store/auth.store";

export default function DeliveryLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  async function handleLogin(email: string, password: string) {
    const response = await userAuthService.deliveryLogin({ email, password });

    if (response.user.role !== "DELIVERY") {
      throw new Error("Este usuario no es delivery");
    }

    setAuth(response.accessToken, response.user);
    router.push("/restaurant/delivery");
  }

  return (
    <RoleLoginForm
      title="Login Delivery"
      description="Acceso a domicilios y pickup"
      onSubmit={handleLogin}
    />
  );
}
