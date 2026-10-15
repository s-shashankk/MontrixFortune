#!/usr/bin/env node
/**
 * End-to-end payment test against a RUNNING backend (local or staging). Needs Node 18+.
 *
 *   node scripts/test-payment-flow.mjs                      (reads .env in the project folder)
 *   BASE_URL=https://shop.example.com TEST_EMAIL=... TEST_PASSWORD=... node scripts/test-payment-flow.mjs
 *
 * It creates real (test-mode) Razorpay orders, then SIMULATES the customer's payment by signing the
 * confirmation the same way Razorpay does. Use Razorpay TEST keys only. It does not open the Razorpay popup;
 * do one popup payment by hand as well (test card 4111 1111 1111 1111, any future date, any CVV).
 */
import { readFileSync } from "node:fs";
import { createHmac, randomBytes } from "node:crypto";

const env = {};
try {
  for (const line of readFileSync(new URL("../.env", import.meta.url), "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2];
  }
} catch { /* .env optional if variables are passed in */ }
const get = (k, d) => process.env[k] ?? env[k] ?? d;

const BASE = get("BASE_URL", "http://localhost:8080");
const EMAIL = get("TEST_EMAIL", "user@montrix.com");
const PASSWORD = get("TEST_PASSWORD", "password123");
const KEY_SECRET = get("RAZORPAY_SECRET");
const WEBHOOK_SECRET = get("RAZORPAY_WEBHOOK_SECRET");

let failures = 0;
const ok = (name, cond, extra = "") => {
  console.log(`${cond ? "PASS" : "FAIL"}  ${name}${extra ? "  -> " + extra : ""}`);
  if (!cond) failures++;
};
const hmac = (secret, data) => createHmac("sha256", secret).update(data).digest("hex");

async function call(method, path, { token, body, raw, headers } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: {
      ...(body !== undefined && !raw ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: raw ?? (body !== undefined ? JSON.stringify(body) : undefined),
  });
  const text = await res.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* plain text */ }
  return { status: res.status, text, json, data: json?.data ?? json };
}

if (!KEY_SECRET || !WEBHOOK_SECRET) {
  console.error("RAZORPAY_SECRET and RAZORPAY_WEBHOOK_SECRET are needed (put them in .env or the environment).");
  process.exit(2);
}

// ---- login
const login = await call("POST", "/api/auth/login", { body: { email: EMAIL, password: PASSWORD } });
ok("login", login.status === 200 && login.data?.token, `status ${login.status}`);
if (!login.data?.token) process.exit(1);
const token = login.data.token;

// ---- helpers
const firstProduct = async () => {
  const r = await call("GET", "/api/products?page=0&size=1");
  return r.json?.content?.[0];
};
const productStock = async (id) => (await call("GET", `/api/products/${id}`)).json?.stockQuantity;

const address = await call("POST", "/api/address", {
  token,
  body: { name: "Test Buyer", phone: "9999999999", houseNo: "12", street: "Test Street", city: "Pune", state: "MH", zipCode: "411001", country: "India" },
});
const addressId = address.data?.id;
ok("create address", !!addressId, `status ${address.status}`);

async function newOnlineOrder(product, qty = 1) {
  await call("DELETE", "/api/cart/clear", { token });
  const add = await call("POST", "/api/cart/add", { token, body: { productId: product.id, quantity: qty } });
  if (add.status !== 200) throw new Error("add to cart failed: " + add.text);
  const order = await call("POST", "/api/orders", { token, body: { addressId, paymentMethod: "RAZORPAY" } });
  if (order.status >= 300) throw new Error("create order failed: " + order.text);
  return order.data;
}
const getOrder = async (id) => (await call("GET", `/api/orders/${id}`, { token })).data;

const product = await firstProduct();
ok("product available", !!product && product.stockQuantity > 3, product ? `${product.name}, stock ${product.stockQuantity}` : "none");
if (!product) process.exit(1);
const stock0 = await productStock(product.id);

// ---- 1. success through /verify
let order = await newOnlineOrder(product, 1);
ok("order created as PENDING", order.orderStatus === "PENDING", `#${order.id} total ${order.totalAmount}`);
ok("stock reserved", (await productStock(product.id)) === stock0 - 1);

const po = await call("POST", "/api/payments/create-order", { token, body: { orderId: order.id } });
const rzp = po.json;
ok("razorpay order created (test keys + internet needed)", po.status === 200 && rzp?.id, `status ${po.status} ${po.status !== 200 ? po.text : rzp?.id}`);
if (!rzp?.id) process.exit(1);
ok("razorpay amount = order total in paise", rzp.amount === Math.round(Number(order.totalAmount) * 100), `${rzp.amount}`);

const po2 = await call("POST", "/api/payments/create-order", { token, body: { orderId: order.id } });
ok("second create-order re-uses the same Razorpay order", po2.json?.id === rzp.id, po2.json?.id);

const payId = "pay_TEST" + randomBytes(6).toString("hex");
const bad = await call("POST", "/api/payments/verify", { token, body: { orderId: order.id, razorpayOrderId: rzp.id, razorpayPaymentId: payId, razorpaySignature: "deadbeef" } });
ok("wrong signature is rejected", bad.status >= 400, `status ${bad.status}`);
ok("order still PENDING after bad signature", (await getOrder(order.id)).orderStatus === "PENDING");

const good = await call("POST", "/api/payments/verify", {
  token,
  body: { orderId: order.id, razorpayOrderId: rzp.id, razorpayPaymentId: payId, razorpaySignature: hmac(KEY_SECRET, `${rzp.id}|${payId}`) },
});
ok("correct signature accepted", good.status === 200, good.text);
order = await getOrder(order.id);
ok("order CONFIRMED + PAID", order.orderStatus === "CONFIRMED" && order.paymentCollectionStatus === "PAID", `${order.orderStatus}/${order.paymentCollectionStatus}`);
const again = await call("POST", "/api/payments/verify", {
  token,
  body: { orderId: order.id, razorpayOrderId: rzp.id, razorpayPaymentId: payId, razorpaySignature: hmac(KEY_SECRET, `${rzp.id}|${payId}`) },
});
ok("verifying twice is harmless", again.status === 200);
ok("stock not deducted twice", (await productStock(product.id)) === stock0 - 1);

// ---- 2. success through the webhook only (customer closed the browser)
let order2 = await newOnlineOrder(product, 1);
const po3 = await call("POST", "/api/payments/create-order", { token, body: { orderId: order2.id } });
const payId2 = "pay_TEST" + randomBytes(6).toString("hex");
const event = JSON.stringify({ event: "payment.captured", payload: { payment: { entity: { id: payId2, order_id: po3.json.id, status: "captured" } } } });
const badHook = await call("POST", "/api/payments/webhook", { raw: event, headers: { "Content-Type": "application/json", "X-Razorpay-Signature": "wrong" } });
ok("webhook with wrong signature rejected", badHook.status >= 400, `status ${badHook.status}`);
const hook = await call("POST", "/api/payments/webhook", { raw: event, headers: { "Content-Type": "application/json", "X-Razorpay-Signature": hmac(WEBHOOK_SECRET, event) } });
ok("webhook accepted", hook.status === 200, hook.text);
ok("webhook confirmed the order", (await getOrder(order2.id)).orderStatus === "CONFIRMED");

// ---- 3. failed / cancelled payment gives the stock back
const stockBefore = await productStock(product.id);
let order3 = await newOnlineOrder(product, 1);
ok("stock reserved for 3rd order", (await productStock(product.id)) === stockBefore - 1);
await call("POST", "/api/payments/fail", { token, body: { orderId: order3.id, reason: "test cancel" } });
order3 = await getOrder(order3.id);
ok("order marked ORDER_FAILED", order3.orderStatus === "ORDER_FAILED", order3.orderStatus);
ok("stock returned", (await productStock(product.id)) === stockBefore);

// ---- 4. COD
await call("DELETE", "/api/cart/clear", { token });
await call("POST", "/api/cart/add", { token, body: { productId: product.id, quantity: 1 } });
const cod = await call("POST", "/api/orders", { token, body: { addressId, paymentMethod: "COD" } });
ok("COD order CONFIRMED immediately", cod.data?.orderStatus === "CONFIRMED", cod.data?.orderStatus);

// ---- 5. security
const anon = await call("GET", `/api/orders/${order.id}`);
ok("anonymous cannot read an order", anon.status === 401 || anon.status === 403, `status ${anon.status}`);
const allPay = await call("GET", "/api/payments/admin/all", { token });
ok("normal user cannot list all payments", allPay.status === 403, `status ${allPay.status}`);
const adm = await call("GET", "/api/admin/users", { token });
ok("normal user cannot open admin API", adm.status === 403, `status ${adm.status}`);

console.log(failures ? `\n${failures} check(s) FAILED` : "\nAll checks passed");
process.exit(failures ? 1 : 0);
