import { api } from "@/src/lib/api";

import { LoginResponse } from "../types/auth";

interface LoginDto {
  email: string;
  password: string;
}

export const authService = {
  async login(data: LoginDto): Promise<LoginResponse> {
    const response = await api.post("/auth/login", data);

    return response.data;
  },
};
