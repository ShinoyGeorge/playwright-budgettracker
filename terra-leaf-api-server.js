/**
 * Terra & Leaf demo API server
 * -----------------------------------------------------------
 * A tiny, dependency-free REST API meant as a stable target for
 * API test automation (C#/RestSharp, Playwright API testing,
 * Postman/Newman, etc). Uses only Node.js built-ins — no `npm install`
 * required.
 *
 * Run:   node terra-leaf-api-server.js
 * Port:  4000 by default, override with PORT env var
 *
 * This is intentionally decoupled from the frontend (terra-leaf-demo-shop.html).
 * That keeps UI tests and API tests independent, so a bug or change in
 * one layer doesn't cascade into flaky failures in the other — the same
 * separation you'd want between UI and API test suites in a real project.
 * -----------------------------------------------------------
 */

const http = require("http");
const crypto = require("crypto");
const { URL } = require("url");

const PORT = process.env.PORT || 4000;

/* ------------------------- Seed data ------------------------- */

let products = [
  { id: "p01", name: "Monstera Deliciosa", cat: "plants", price: 48.00, stock: 14, sku: "TL-PLT-001" },
  { id: "p02", name: "Snake Plant 'Laurentii'", cat: "plants", price: 29.50, stock: 3, sku: "TL-PLT-002" },
  { id: "p03", name: "Fiddle Leaf Fig", cat: "plants", price: 64.00, stock: 8, sku: "TL-PLT-003" },
  { id: "p04", name: "Pothos 'Marble Queen'", cat: "plants", price: 18.00, stock: 22, sku: "TL-PLT-004" },
  { id: "p05", name: "Full-Spectrum Grow Light", cat: "lighting", price: 39.99, stock: 11, sku: "TL-LGT-001" },
  { id: "p06", name: "Clip-On LED Grow Lamp", cat: "lighting", price: 22.50, stock: 2, sku: "TL-LGT-002" },
  { id: "p07", name: "Smart Grow Light Strip", cat: "lighting", price: 54.00, stock: 6, sku: "TL-LGT-003" },
  { id: "p08", name: "Ultrasonic Cool-Mist Humidifier", cat: "climate", price: 72.00, stock: 5, sku: "TL-CLM-001" },
  { id: "p09", name: "Compact Room Humidifier", cat: "climate", price: 34.00, stock: 0, sku: "TL-CLM-002" },
  { id: "p10", name: "Hygrometer + Thermometer", cat: "climate", price: 14.00, stock: 31, sku: "TL-CLM-003" },
  { id: "p11", name: "Ceramic Pot, Speckled Clay", cat: "pots", price: 16.50, stock: 19, sku: "TL-POT-001" },
  { id: "p12", name: "Self-Watering Planter", cat: "pots", price: 26.00, stock: 9, sku: "TL-POT-002" },
];

const users = [
  { email: "admin@terraleaf.dev", password: "Admin123!", role: "admin", name: "Priya" },
  { email: "jordan@terraleaf.dev", password: "Customer123!", role: "customer", name: "Jordan" },
  { email: "sam@terraleaf.dev", password: "Customer123!", role: "customer", name: "Sam" },
  { email: "locked@terraleaf.dev", password: "Locked123!", role: "locked", name: "Locked Account" },
];

let orders = [
  { id: "TL-100231", customerEmail: "jordan@terraleaf.dev", date: "2026-07-02", status: "Delivered", total: 112.50, items: [{ productId: "p01", qty: 1 }, { productId: "p11", qty: 2 }] },
  { id: "TL-100255", customerEmail: "jordan@terraleaf.dev", date: "2026-07-18", status: "Shipped", total: 48.00, items: [{ productId: "p01", qty: 1 }] },
  { id: "TL-100299", customerEmail: "sam@terraleaf.dev", date: "2026-08-01", status: "Processing", total: 76.50, items: [{ productId: "p05", qty: 1 }, { productId: "p10", qty: 1 }] },
];

// token -> { email, role, name }
const sessions = new Map();

/* ------------------------- Helpers ------------------------- */

function send(res, status, body) {
  const payload = JSON.stringify(body, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => { data += chunk; if (data.length > 1e6) req.destroy(); });
    req.on("end", () => {
      if (!data) return resolve({});
      try { resolve(JSON.parse(data)); }
      catch { reject(new Error("Invalid JSON body")); }
    });
    req.on("error", reject);
  });
}

function getAuthUser(req) {
  const header = req.headers["authorization"] || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return null;
  return sessions.get(token) || null;
}

function requireAuth(req, res) {
  const user = getAuthUser(req);
  if (!user) { send(res, 401, { error: "Unauthorized", message: "Missing or invalid bearer token." }); return null; }
  return user;
}

function requireAdmin(req, res) {
  const user = requireAuth(req, res);
  if (!user) return null;
  if (user.role !== "admin") { send(res, 403, { error: "Forbidden", message: "Admin role required." }); return null; }
  return user;
}

/* ------------------------- Route handlers ------------------------- */

async function handleLogin(req, res) {
  let body;
  try { body = await readBody(req); } catch (e) { return send(res, 400, { error: "Bad Request", message: e.message }); }
  const { email, password } = body;
  if (!email || !password) return send(res, 422, { error: "Validation Error", message: "email and password are required." });

  const user = users.find((u) => u.email.toLowerCase() === String(email).toLowerCase());
  if (!user || user.password !== password) {
    return send(res, 401, { error: "Unauthorized", message: "Incorrect email or password." });
  }
  if (user.role === "locked") {
    return send(res, 423, { error: "Locked", message: "This account is locked." });
  }
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, { email: user.email, role: user.role, name: user.name });
  return send(res, 200, { token, email: user.email, role: user.role, name: user.name });
}

function handleListProducts(req, res, query) {
  let list = products.slice();
  if (query.get("category")) list = list.filter((p) => p.cat === query.get("category"));
  if (query.get("search")) {
    const s = query.get("search").toLowerCase();
    list = list.filter((p) => p.name.toLowerCase().includes(s));
  }
  if (query.get("minPrice")) list = list.filter((p) => p.price >= Number(query.get("minPrice")));
  if (query.get("maxPrice")) list = list.filter((p) => p.price <= Number(query.get("maxPrice")));
  const sort = query.get("sort");
  if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
  if (sort === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));

  const page = Math.max(1, Number(query.get("page")) || 1);
  const pageSize = Math.max(1, Number(query.get("pageSize")) || list.length || 1);
  const start = (page - 1) * pageSize;
  const pageItems = list.slice(start, start + pageSize);

  send(res, 200, { total: list.length, page, pageSize, items: pageItems });
}

function handleGetProduct(req, res, id) {
  const product = products.find((p) => p.id === id);
  if (!product) return send(res, 404, { error: "Not Found", message: `No product with id ${id}.` });
  send(res, 200, product);
}

async function handleCreateProduct(req, res) {
  const user = requireAdmin(req, res);
  if (!user) return;
  let body;
  try { body = await readBody(req); } catch (e) { return send(res, 400, { error: "Bad Request", message: e.message }); }

  const required = ["name", "cat", "price", "stock"];
  const missing = required.filter((f) => body[f] === undefined || body[f] === null || body[f] === "");
  if (missing.length) return send(res, 422, { error: "Validation Error", message: `Missing fields: ${missing.join(", ")}` });
  if (typeof body.price !== "number" || body.price < 0) return send(res, 422, { error: "Validation Error", message: "price must be a non-negative number." });
  if (typeof body.stock !== "number" || body.stock < 0) return send(res, 422, { error: "Validation Error", message: "stock must be a non-negative integer." });

  const id = "p" + String(Date.now()).slice(-6);
  const product = { id, name: body.name, cat: body.cat, price: body.price, stock: body.stock, sku: body.sku || `TL-NEW-${id}` };
  products.push(product);
  send(res, 201, product);
}

async function handleUpdateProduct(req, res, id) {
  const user = requireAdmin(req, res);
  if (!user) return;
  const product = products.find((p) => p.id === id);
  if (!product) return send(res, 404, { error: "Not Found", message: `No product with id ${id}.` });
  let body;
  try { body = await readBody(req); } catch (e) { return send(res, 400, { error: "Bad Request", message: e.message }); }

  if (body.price !== undefined && (typeof body.price !== "number" || body.price < 0)) {
    return send(res, 422, { error: "Validation Error", message: "price must be a non-negative number." });
  }
  if (body.stock !== undefined && (typeof body.stock !== "number" || body.stock < 0)) {
    return send(res, 422, { error: "Validation Error", message: "stock must be a non-negative integer." });
  }
  Object.assign(product, body, { id: product.id });
  send(res, 200, product);
}

async function handleDeleteProduct(req, res, id) {
  const user = requireAdmin(req, res);
  if (!user) return;
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return send(res, 404, { error: "Not Found", message: `No product with id ${id}.` });
  products.splice(idx, 1);
  res.writeHead(204, { "Access-Control-Allow-Origin": "*" });
  res.end();
}

function handleListOrders(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  const list = user.role === "admin" ? orders : orders.filter((o) => o.customerEmail === user.email);
  send(res, 200, { total: list.length, items: list });
}

function handleGetOrder(req, res, id) {
  const user = requireAuth(req, res);
  if (!user) return;
  const order = orders.find((o) => o.id === id);
  if (!order) return send(res, 404, { error: "Not Found", message: `No order with id ${id}.` });
  if (user.role !== "admin" && order.customerEmail !== user.email) {
    return send(res, 403, { error: "Forbidden", message: "This order does not belong to you." });
  }
  send(res, 200, order);
}

async function handleCreateOrder(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  let body;
  try { body = await readBody(req); } catch (e) { return send(res, 400, { error: "Bad Request", message: e.message }); }

  if (!Array.isArray(body.items) || body.items.length === 0) {
    return send(res, 422, { error: "Validation Error", message: "items must be a non-empty array of { productId, qty }." });
  }
  let total = 0;
  for (const item of body.items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product) return send(res, 422, { error: "Validation Error", message: `Unknown productId: ${item.productId}` });
    if (!item.qty || item.qty < 1) return send(res, 422, { error: "Validation Error", message: `qty must be >= 1 for ${item.productId}` });
    total += product.price * item.qty;
  }
  const id = "TL-" + Math.floor(100000 + Math.random() * 900000);
  const order = { id, customerEmail: user.email, date: new Date().toISOString().slice(0, 10), status: "Processing", total: Math.round(total * 100) / 100, items: body.items };
  orders.push(order);
  send(res, 201, order);
}

function handleMe(req, res) {
  const user = requireAuth(req, res);
  if (!user) return;
  send(res, 200, user);
}

/* ------------------------- Router ------------------------- */

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    });
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;
  const query = url.searchParams;

  try {
    if (path === "/api/auth/login" && req.method === "POST") return await handleLogin(req, res);
    if (path === "/api/users/me" && req.method === "GET") return handleMe(req, res);

    if (path === "/api/products" && req.method === "GET") return handleListProducts(req, res, query);
    if (path === "/api/products" && req.method === "POST") return await handleCreateProduct(req, res);

    const productMatch = path.match(/^\/api\/products\/([^/]+)$/);
    if (productMatch && req.method === "GET") return handleGetProduct(req, res, productMatch[1]);
    if (productMatch && (req.method === "PUT" || req.method === "PATCH")) return await handleUpdateProduct(req, res, productMatch[1]);
    if (productMatch && req.method === "DELETE") return await handleDeleteProduct(req, res, productMatch[1]);

    if (path === "/api/orders" && req.method === "GET") return handleListOrders(req, res);
    if (path === "/api/orders" && req.method === "POST") return await handleCreateOrder(req, res);

    const orderMatch = path.match(/^\/api\/orders\/([^/]+)$/);
    if (orderMatch && req.method === "GET") return handleGetOrder(req, res, orderMatch[1]);

    if (path === "/" || path === "/health") return send(res, 200, { status: "ok", service: "terra-leaf-api", time: new Date().toISOString() });

    send(res, 404, { error: "Not Found", message: `No route for ${req.method} ${path}` });
  } catch (err) {
    send(res, 500, { error: "Internal Server Error", message: err.message });
  }
});

server.listen(PORT, () => {
  console.log(`Terra & Leaf API listening on http://localhost:${PORT}`);
  console.log(`Try: curl http://localhost:${PORT}/api/products`);
});
