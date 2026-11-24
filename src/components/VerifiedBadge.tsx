import type { Item } from "@/data/publicApi";

export function VerifiedBadge({ status }: { status: Item["status"] }) {
  const verified = status === "geverifieerd";
  const label = verified ? "Geverifieerd" : "Controle loopt";
  return (
    <span className={`vf ${verified ? "verified" : "checking"}`} data-tip={label} tabIndex={0} role="img" aria-label={label}>
      <svg viewBox="0 0 20 20" width="16" height="16" aria-hidden="true">
        {verified ? <><circle cx="10" cy="10" r="10" className="badge-circle" /><path d="M5.2 10.4l3.2 3.2 6.4-6.8" className="badge-mark" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></> : <><circle cx="10" cy="10" r="9" className="badge-circle" strokeWidth="2" strokeDasharray="3 2.4" /><path d="M10 5.5V10l3 2" className="badge-mark" strokeWidth="2" strokeLinecap="round" /></>}
      </svg>
    </span>
  );
}