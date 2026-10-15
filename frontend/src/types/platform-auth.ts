export interface PlatformAdmin {
  id: string;

  email: string;

  fullName: string;
}

export interface PlatformLoginResponse {
  accessToken: string;

  admin: PlatformAdmin;
}
