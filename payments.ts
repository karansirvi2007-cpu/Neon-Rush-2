import { CHARACTERS } from "@/game/store";

/* Real-money (INR) purchases via Razorpay Checkout.
   Needs two env vars AND a small backend (see PAYMENTS.md):
     VITE_RAZORPAY_KEY_ID  your Razorpay key id (public key only, never the secret)
     VITE_PAYMENTS_API     base URL of your backend that exposes /create-order and /verify */
const KEY = import.meta.env["VITE_RAZORPAY_KEY_ID"] as string | undefined;
const API = import.meta.env["VITE_PAYMENTS_API"] as string | undefined;
export const paymentsReady = Boolean(KEY && API);

interface RzpWindow { Razorpay?: new (o: Record<string, unknown>) => { open: () => void } }
type Result = { ok: true } | { ok: false; error: string };

function loadCheckout(): Promise<boolean> {
  const w = window as unknown as RzpWindow;
  if (w.Razorpay) return Promise.resolve(true);
  return new Promise((res) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => res(true); s.onerror = () => res(false);
    document.head.appendChild(s);
  });
}
const post = (path: string, body: unknown) =>
  fetch(`${API}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then((r) => r.json());

export async function buyRunner(index: number): Promise<Result> {
  const c = CHARACTERS[index];
  if (!c || !c.inr) return { ok: false, error: "This runner is not for sale." };
  if (!paymentsReady) return { ok: false, error: "Rupee purchases are not switched on yet." };
  try {
    if (!(await loadCheckout())) return { ok: false, error: "Could not load the payment window. Check your internet." };
    // The server decides the price from the runner name. The app never sends an amount.
    const order = (await post("/create-order", { item: c.name })) as { id: string; amount: number };
    const Rzp = (window as unknown as RzpWindow).Razorpay!;
    return await new Promise<Result>((resolve) => {
      new Rzp({
        key: KEY, order_id: order.id, amount: order.amount, currency: "INR",
        name: "NEON RUSH", description: `Unlock ${c.name}`, theme: { color: "#22e6ff" },
        handler: async (resp: Record<string, string>) => {
          const v = (await post("/verify", { ...resp, item: c.name })) as { ok?: boolean };
          resolve(v.ok ? { ok: true } : { ok: false, error: "Payment could not be verified. If money was taken, contact support." });
        },
        modal: { ondismiss: () => resolve({ ok: false, error: "Payment cancelled." }) },
      }).open();
    });
  } catch {
    return { ok: false, error: "Something went wrong. You were not charged unless the bank says so." };
  }
}
