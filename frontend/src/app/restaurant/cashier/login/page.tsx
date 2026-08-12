"use client";

import { useRouter } from "next/navigation";

import { RoleLoginForm } from "@/src/components/auth/role-login-form";
import { userAuthService } from "@/src/services/user-auth.service";
import { useAuthStore } from "@/src/store/auth.store";

export default function CashierLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  async function handleLogin(email: string, password: string) {
    const response = await userAuthService.cashierLogin({ email, password });

    if (response.user.role !== "CASHIER") {
      throw new Error("Este usuario no es cajero");
    }

    setAuth(response.accessToken, response.user);
    router.push("/restaurant/cashier");
  }

  return (
    <RoleLoginForm
      title="Login Cajero"
      description="Acceso a caja y pagos"
      onSubmit={handleLogin}
    />
  );
}
