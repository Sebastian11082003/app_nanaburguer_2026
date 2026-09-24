import { formatCents } from "@/src/lib/money";
import { orderLineLabel } from "@/src/lib/order-line-label";
import { OrderItem } from "@/src/types/order";

/**
 * One ticket line. Canceled rows stay visible for audit but look dead.
 */
export function OrderItemRow({
  item,
  onCancel,
  busy,
  cancelLabel = "Cancelar",
}: {
  item: OrderItem;
  onCancel?: (itemId: string) => void;
  busy?: boolean;
  cancelLabel?: string;
}) {
  const canceled = Boolean(item.canceledAt);

  return (
    <li className="flex items-start justify-between gap-3 text-sm">
      <span className={canceled ? "text-zinc-500 line-through" : ""}>
        {canceled ? "CANCELADO · " : ""}
        {orderLineLabel(item)}
        {item.notes && !canceled ? ` · ${item.notes}` : ""}
      </span>
      <span className="flex shrink-0 items-center gap-2 whitespace-nowrap">
        {formatCents(canceled ? 0 : item.lineTotalCents)}
        {onCancel && !canceled ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onCancel(item.id)}
            className="text-xs text-red-400 hover:text-red-300 disabled:opacity-40"
          >
            {cancelLabel}
          </button>
        ) : null}
      </span>
    </li>
  );
}
