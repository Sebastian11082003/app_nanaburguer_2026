const API_MESSAGE_ES: Record<string, string> = {
  "Open a cash session before recording cash":
    "Abrí la caja (turno) antes de cobrar o registrar efectivo",
  "Invoice already accepted": "Esta factura ya fue emitida",
  "Invoice already rejected": "Esta factura ya fue rechazada",
};

export function getErrorMessage(error: unknown, fallback: string) {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: unknown } } }).response
      ?.data?.message === "string"
  ) {
    const message = (error as { response: { data: { message: string } } })
      .response.data.message;
    return API_MESSAGE_ES[message] ?? message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
