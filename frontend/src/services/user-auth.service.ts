import { api } from "@/src/lib/api";
import { useRestaurantStore } from "@/src/store/restaurant.store";

interface UserLoginDto {
  email: string;
  password: string;
  slug?: string;
}

function buildPayload(data: UserLoginDto) {
  const slug =
    data.slug?.trim() || useRestaurantStore.getState().restaurant?.slug;

  if (!slug) {
    throw new Error("Indica el slug del restaurante");
  }

  return {
    slug,
    email: data.email,
    password: data.password,
  };
}

export const userAuthService = {
  adminLogin(data: UserLoginDto) {
    return api
      .post("/auth/admin-login", buildPayload(data))
      .then((res) => res.data);
  },

  cashierLogin(data: UserLoginDto) {
    return api
      .post("/auth/cashier-login", buildPayload(data))
      .then((res) => res.data);
  },

  waiterLogin(data: UserLoginDto) {
    return api
      .post("/auth/waiter-login", buildPayload(data))
      .then((res) => res.data);
  },

  kitchenLogin(data: UserLoginDto) {
    return api
      .post("/auth/kitchen-login", buildPayload(data))
      .then((res) => res.data);
  },

  deliveryLogin(data: UserLoginDto) {
    return api
      .post("/auth/delivery-login", buildPayload(data))
      .then((res) => res.data);
  },
};
