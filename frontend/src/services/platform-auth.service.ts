import { api } from "@/src/lib/axios";

import { PlatformLoginResponse } from "@/src/types/platform-auth";

interface PlatformLoginDto {
  email: string;

  password: string;
}

export const platformAuthService = {
  async login(data: PlatformLoginDto): Promise<PlatformLoginResponse> {
    const response = await api.post("/platform/login", data);

    return response.data;
  },
};
