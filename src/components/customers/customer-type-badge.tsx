import { CustomerType } from "@/types/customer";

/** Type pill for the customer directory (mirrors client-status-badge). */
const STYLES: Record<CustomerType, string> = {
  SHIPPER: "bg-primary/10 text-primary border-primary/15",
  RECEIVER: "bg-success/10 text-success border-success/15",
  CORPORATE: "bg-muted text-muted-foreground border-border",
};

interface Props {
  type: CustomerType;
}

export default function CustomerTypeBadge({ type }: Props) {
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${STYLES[type]}`}
    >
      {type}
    </div>
  );
}
