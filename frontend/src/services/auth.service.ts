import { api } from "../lib/axios";

import { LoginResponse } from "../types/auth";

interface LoginDto {
  slug: string;

  email: string;

  password: string;
}

export const authService = {
  async login(data: LoginDto): Promise<LoginResponse> {
    const response = await api.post("/auth/login", data);

    return response.data;
  },
};
