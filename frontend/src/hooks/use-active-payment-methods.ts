"use client";

import { useCallback, useEffect, useState } from "react";

import { getErrorMessage } from "@/src/lib/get-error-message";
import {
  paymentMethodsService,
  RestaurantPaymentMethod,
} from "@/src/services/payment-methods.service";

/** Loads active payment methods for the close/pay UI. */
export function useActivePaymentMethods() {
  const [methods, setMethods] = useState<RestaurantPaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setMethods(await paymentMethodsService.getAll(true));
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar los métodos de pago"));
      setMethods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { methods, loading, error, reload };
}
