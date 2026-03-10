import { useState, useEffect } from "react";

// ─── SUPABASE CONFIG ───────────────────────────────────────────────────────────
// Reemplazá estos valores con los tuyos de Supabase
const SUPABASE_URL = "https://TU_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "TU_ANON_KEY";

async function supaFetch(table, method = "GET", body = null, query = "") {
  const url = `${SUPABASE_URL}/rest/v1/${table}${query}`;
  const headers = {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    "Content-Type": "application/json",
    Prefer: method === "POST" ? "return=representation" : "return=representation",
  };
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) throw new Error(await res.text());
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

const db = {
  get: (t, q = "") => supaFetch(t, "GET", null, q),
  post: (t, b) => supaFetch(t, "POST", b),
  patch: (t, id, b) => supaFetch(t, "PATCH", b, `?id=eq.${id}`),
  delete: (t, id) => supaFetch(t, "DELETE", null, `?id=eq.${id}`),
};

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size = 20 }) => {
  const icons = {
    box: "📦", money: "💰", person: "👤", fire: "💸", chart: "📊",
    plus: "＋", check: "✓", trash: "✕", back: "←", edit: "✎",
    store: "🏪", menu: "☰", close: "✕", paid: "✅", unpaid: "⏳",
  };
  return <span style={{ fontSize: size }}>{icons[name] || "•"}</span>;
};

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg: "#0d0f14",
  card: "#161b25",
  border: "#1e2535",
  accent: "#f59e0b",
  accentDim: "#f59e0b22",
  green: "#10b981",
  red: "#ef4444",
  blue: "#3b82f6",
  text: "#e2e8f0",
  muted: "#64748b",
  font: "'DM Mono', 'Courier New', monospace",
  fontDisplay: "'Bebas Neue', 'Impact', sans-serif",
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bg}; color: ${T.text}; font-family: ${T.font}; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${T.bg}; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 4px; }
  input, select, textarea {
    background: ${T.bg} !important;
    border: 1px solid ${T.border} !important;
    color: ${T.text} !important;
    border-radius: 8px !important;
    padding: 10px 14px !important;
    font-family: ${T.font} !important;
    font-size: 14px !important;
    width: 100% !important;
    outline: none !important;
    transition: border-color 0.2s !important;
  }
  input:focus, select:focus, textarea:focus {
    border-color: ${T.accent} !important;
  }
  button { cursor: pointer; font-family: ${T.font}; transition: all 0.15s; }
  button:active { transform: scale(0.97); }
  @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
  .fade-in { animation: fadeIn 0.25s ease forwards; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
`;

// ─── COMPONENTS ───────────────────────────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{
    background: T.card, border: `1px solid ${T.border}`,
    borderRadius: 12, padding: 16, ...style
  }}>{children}</div>
);

const Btn = ({ children, onClick, color = T.accent, outline = false, small = false, style = {} }) => (
  <button onClick={onClick} style={{
    background: outline ? "transparent" : color,
    color: outline ? color : "#000",
    border: `1.5px solid ${color}`,
    borderRadius: 8,
    padding: small ? "6px 12px" : "11px 20px",
    fontSize: small ? 12 : 14,
    fontWeight: 600,
    letterSpacing: "0.5px",
    ...style
  }}>{children}</button>
);

const Modal = ({ title, onClose, children }) => (
  <div style={{
    position: "fixed", inset: 0, background: "#000a",
    display: "flex", alignItems: "flex-end", justifyContent: "center",
    zIndex: 100, backdropFilter: "blur(4px)"
  }} onClick={onClose}>
    <div className="fade-in" onClick={e => e.stopPropagation()} style={{
      background: T.card, borderRadius: "16px 16px 0 0",
      border: `1px solid ${T.border}`, width: "100%", maxWidth: 520,
      padding: 24, maxHeight: "85vh", overflowY: "auto"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <span style={{ fontFamily: T.fontDisplay, fontSize: 22, letterSpacing: 1, color: T.accent }}>{title}</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: T.muted, fontSize: 20 }}>✕</button>
      </div>
      {children}
    </div>
  </div>
);

const EmptyState = ({ emoji, text }) => (
  <div style={{ textAlign: "center", padding: "40px 0", color: T.muted }}>
    <div style={{ fontSize: 36, marginBottom: 8 }}>{emoji}</div>
    <div style={{ fontSize: 13 }}>{text}</div>
  </div>
);

const Loader = () => (
  <div style={{ textAlign: "center", padding: 32, color: T.muted, animation: "pulse 1.5s infinite" }}>
    Cargando...
  </div>
);

// ─── PRODUCTOS ────────────────────────────────────────────────────────────────
function Productos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nombre: "", precio: "", stock: "", categoria: "" });

  const load = async () => {
    setLoading(true);
    try { setItems(await db.get("productos", "?order=nombre.asc")); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.nombre || !form.precio) return;
    try {
      await db.post("productos", { ...form, precio: +form.precio, stock: +form.stock || 0 });
      setForm({ nombre: "", precio: "", stock: "", categoria: "" });
      setModal(false);
      load();
    } catch (e) { alert("Error: " + e.message); }
  };

  const del = async (id) => {
    if (!confirm("¿Eliminar producto?")) return;
    try { await db.delete("productos", id); load(); } catch (e) { alert(e.message); }
  };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 28, letterSpacing: 1 }}>PRODUCTOS</h2>
        <Btn onClick={() => setModal(true)}>＋ Agregar</Btn>
      </div>

      {loading ? <Loader /> : items.length === 0 ? (
        <EmptyState emoji="📦" text="No hay productos. ¡Agregá el primero!" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(p => (
            <Card key={p.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{p.nombre}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{p.categoria || "Sin categoría"}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: T.accent, fontWeight: 700, fontSize: 16 }}>
                    ${Number(p.precio).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: p.stock <= 3 ? T.red : T.green, marginTop: 2 }}>
                    Stock: {p.stock}
                  </div>
                </div>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <Btn small outline color={T.red} onClick={() => del(p.id)}>Eliminar</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal title="NUEVO PRODUCTO" onClose={() => setModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input placeholder="Nombre del producto *" value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })} />
            <input placeholder="Precio *" type="number" value={form.precio}
              onChange={e => setForm({ ...form, precio: e.target.value })} />
            <input placeholder="Stock inicial" type="number" value={form.stock}
              onChange={e => setForm({ ...form, stock: e.target.value })} />
            <input placeholder="Categoría (ej: ropa, comida)" value={form.categoria}
              onChange={e => setForm({ ...form, categoria: e.target.value })} />
            <Btn onClick={save} style={{ width: "100%", marginTop: 4 }}>GUARDAR PRODUCTO</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── VENTAS ───────────────────────────────────────────────────────────────────
function Ventas() {
  const [ventas, setVentas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ producto_id: "", cantidad: "1", nota: "" });

  const load = async () => {
    setLoading(true);
    try {
      const [v, p] = await Promise.all([
        db.get("ventas", "?order=created_at.desc&limit=50"),
        db.get("productos", "?order=nombre.asc"),
      ]);
      setVentas(v); setProductos(p);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.producto_id || !form.cantidad) return;
    const prod = productos.find(p => p.id == form.producto_id);
    if (!prod) return;
    const total = prod.precio * +form.cantidad;
    try {
      await db.post("ventas", {
        producto_id: form.producto_id,
        producto_nombre: prod.nombre,
        cantidad: +form.cantidad,
        precio_unit: prod.precio,
        total,
        nota: form.nota,
      });
      // Actualizar stock
      await db.patch("productos", prod.id, { stock: prod.stock - +form.cantidad });
      setForm({ producto_id: "", cantidad: "1", nota: "" });
      setModal(false);
      load();
    } catch (e) { alert("Error: " + e.message); }
  };

  const totalHoy = ventas
    .filter(v => new Date(v.created_at).toDateString() === new Date().toDateString())
    .reduce((a, v) => a + v.total, 0);

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 28, letterSpacing: 1 }}>VENTAS</h2>
        <Btn onClick={() => setModal(true)}>＋ Registrar</Btn>
      </div>

      <Card style={{ marginBottom: 16, borderColor: T.accent + "44" }}>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>TOTAL HOY</div>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 36, color: T.accent, letterSpacing: 1 }}>
          ${totalHoy.toLocaleString()}
        </div>
      </Card>

      {loading ? <Loader /> : ventas.length === 0 ? (
        <EmptyState emoji="💰" text="No hay ventas registradas aún." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ventas.map(v => (
            <Card key={v.id}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{v.producto_nombre}</div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                    {v.cantidad} unid. × ${Number(v.precio_unit).toLocaleString()}
                  </div>
                  {v.nota && <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>📝 {v.nota}</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: T.green, fontWeight: 700, fontSize: 16 }}>
                    ${Number(v.total).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                    {new Date(v.created_at).toLocaleDateString("es-AR")}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal title="REGISTRAR VENTA" onClose={() => setModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <select value={form.producto_id} onChange={e => setForm({ ...form, producto_id: e.target.value })}>
              <option value="">Seleccioná un producto *</option>
              {productos.map(p => (
                <option key={p.id} value={p.id}>{p.nombre} — ${Number(p.precio).toLocaleString()} (stock: {p.stock})</option>
              ))}
            </select>
            <input placeholder="Cantidad *" type="number" min="1" value={form.cantidad}
              onChange={e => setForm({ ...form, cantidad: e.target.value })} />
            <input placeholder="Nota (opcional)" value={form.nota}
              onChange={e => setForm({ ...form, nota: e.target.value })} />
            {form.producto_id && form.cantidad && (
              <div style={{ background: T.accentDim, border: `1px solid ${T.accent}44`, borderRadius: 8, padding: 12 }}>
                <span style={{ color: T.accent, fontWeight: 700 }}>
                  Total: ${(
                    (productos.find(p => p.id == form.producto_id)?.precio || 0) * +form.cantidad
                  ).toLocaleString()}
                </span>
              </div>
            )}
            <Btn onClick={save} style={{ width: "100%", marginTop: 4 }}>CONFIRMAR VENTA</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── DEUDORES ─────────────────────────────────────────────────────────────────
function Deudores() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nombre: "", monto: "", descripcion: "" });

  const load = async () => {
    setLoading(true);
    try { setItems(await db.get("deudores", "?order=created_at.desc")); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.nombre || !form.monto) return;
    try {
      await db.post("deudores", { ...form, monto: +form.monto, pagado: false });
      setForm({ nombre: "", monto: "", descripcion: "" });
      setModal(false);
      load();
    } catch (e) { alert("Error: " + e.message); }
  };

  const marcarPagado = async (d) => {
    try { await db.patch("deudores", d.id, { pagado: !d.pagado }); load(); } catch (e) { alert(e.message); }
  };

  const del = async (id) => {
    if (!confirm("¿Eliminar deudor?")) return;
    try { await db.delete("deudores", id); load(); } catch (e) { alert(e.message); }
  };

  const totalPendiente = items.filter(d => !d.pagado).reduce((a, d) => a + d.monto, 0);

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 28, letterSpacing: 1 }}>DEUDORES</h2>
        <Btn onClick={() => setModal(true)}>＋ Agregar</Btn>
      </div>

      <Card style={{ marginBottom: 16, borderColor: T.red + "44" }}>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>PENDIENTE DE COBRO</div>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 36, color: T.red, letterSpacing: 1 }}>
          ${totalPendiente.toLocaleString()}
        </div>
      </Card>

      {loading ? <Loader /> : items.length === 0 ? (
        <EmptyState emoji="👤" text="Nadie te debe plata. ¡Qué bien!" />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(d => (
            <Card key={d.id} style={{ opacity: d.pagado ? 0.5 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15, display: "flex", alignItems: "center", gap: 6 }}>
                    {d.nombre}
                    <span style={{ fontSize: 14 }}>{d.pagado ? "✅" : "⏳"}</span>
                  </div>
                  {d.descripcion && <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>{d.descripcion}</div>}
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>
                    {new Date(d.created_at).toLocaleDateString("es-AR")}
                  </div>
                </div>
                <div style={{ color: d.pagado ? T.green : T.red, fontWeight: 700, fontSize: 16 }}>
                  ${Number(d.monto).toLocaleString()}
                </div>
              </div>
              <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
                <Btn small outline color={d.pagado ? T.muted : T.green} onClick={() => marcarPagado(d)}>
                  {d.pagado ? "Reabrir" : "Marcar pagado"}
                </Btn>
                <Btn small outline color={T.red} onClick={() => del(d.id)}>Eliminar</Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal title="NUEVO DEUDOR" onClose={() => setModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input placeholder="Nombre *" value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })} />
            <input placeholder="Monto que debe *" type="number" value={form.monto}
              onChange={e => setForm({ ...form, monto: e.target.value })} />
            <input placeholder="Descripción (ej: 2 remeras)" value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })} />
            <Btn onClick={save} style={{ width: "100%", marginTop: 4 }}>GUARDAR DEUDOR</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── GASTOS ───────────────────────────────────────────────────────────────────
function Gastos() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ descripcion: "", monto: "", categoria: "insumos" });

  const load = async () => {
    setLoading(true);
    try { setItems(await db.get("gastos", "?order=created_at.desc&limit=50")); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.descripcion || !form.monto) return;
    try {
      await db.post("gastos", { ...form, monto: +form.monto });
      setForm({ descripcion: "", monto: "", categoria: "insumos" });
      setModal(false);
      load();
    } catch (e) { alert("Error: " + e.message); }
  };

  const del = async (id) => {
    if (!confirm("¿Eliminar gasto?")) return;
    try { await db.delete("gastos", id); load(); } catch (e) { alert(e.message); }
  };

  const totalHoy = items
    .filter(g => new Date(g.created_at).toDateString() === new Date().toDateString())
    .reduce((a, g) => a + g.monto, 0);

  const catColors = { insumos: T.blue, transporte: T.accent, alquiler: T.red, servicios: "#a855f7", otros: T.muted };

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 28, letterSpacing: 1 }}>GASTOS</h2>
        <Btn onClick={() => setModal(true)}>＋ Agregar</Btn>
      </div>

      <Card style={{ marginBottom: 16, borderColor: T.blue + "44" }}>
        <div style={{ fontSize: 12, color: T.muted, marginBottom: 4 }}>GASTOS HOY</div>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 36, color: T.blue, letterSpacing: 1 }}>
          ${totalHoy.toLocaleString()}
        </div>
      </Card>

      {loading ? <Loader /> : items.length === 0 ? (
        <EmptyState emoji="💸" text="No hay gastos registrados." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {items.map(g => (
            <Card key={g.id}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{g.descripcion}</div>
                  <div style={{ marginTop: 4 }}>
                    <span style={{
                      fontSize: 11, padding: "2px 8px", borderRadius: 4,
                      background: (catColors[g.categoria] || T.muted) + "22",
                      color: catColors[g.categoria] || T.muted,
                      border: `1px solid ${(catColors[g.categoria] || T.muted)}44`
                    }}>{g.categoria}</span>
                  </div>
                  <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>
                    {new Date(g.created_at).toLocaleDateString("es-AR")}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: T.red, fontWeight: 700, fontSize: 16 }}>
                    -${Number(g.monto).toLocaleString()}
                  </div>
                  <Btn small outline color={T.red} onClick={() => del(g.id)} style={{ marginTop: 6 }}>✕</Btn>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <Modal title="NUEVO GASTO" onClose={() => setModal(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input placeholder="Descripción *" value={form.descripcion}
              onChange={e => setForm({ ...form, descripcion: e.target.value })} />
            <input placeholder="Monto *" type="number" value={form.monto}
              onChange={e => setForm({ ...form, monto: e.target.value })} />
            <select value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
              <option value="insumos">Insumos</option>
              <option value="transporte">Transporte</option>
              <option value="alquiler">Alquiler</option>
              <option value="servicios">Servicios</option>
              <option value="otros">Otros</option>
            </select>
            <Btn onClick={save} style={{ width: "100%", marginTop: 4 }}>GUARDAR GASTO</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ─── RESUMEN ──────────────────────────────────────────────────────────────────
function Resumen() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("hoy");

  const load = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const startOfWeek = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
      const desde = periodo === "hoy" ? startOfDay : startOfWeek;

      const [ventas, gastos, deudores] = await Promise.all([
        db.get("ventas", `?created_at=gte.${desde}&order=created_at.desc`),
        db.get("gastos", `?created_at=gte.${desde}&order=created_at.desc`),
        db.get("deudores", "?pagado=eq.false"),
      ]);

      const totalVentas = ventas.reduce((a, v) => a + v.total, 0);
      const totalGastos = gastos.reduce((a, g) => a + g.monto, 0);
      const totalDeuda = deudores.reduce((a, d) => a + d.monto, 0);
      const ganancia = totalVentas - totalGastos;

      setData({ ventas, gastos, totalVentas, totalGastos, ganancia, totalDeuda, deudores });
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [periodo]);

  const StatCard = ({ label, value, color, prefix = "$" }) => (
    <Card style={{ flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, color: T.muted, marginBottom: 6, letterSpacing: 0.5 }}>{label}</div>
      <div style={{ fontFamily: T.fontDisplay, fontSize: 28, color, letterSpacing: 1, lineHeight: 1 }}>
        {prefix}{typeof value === "number" ? value.toLocaleString() : value}
      </div>
    </Card>
  );

  return (
    <div className="fade-in">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 28, letterSpacing: 1 }}>RESUMEN</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {["hoy", "semana"].map(p => (
            <button key={p} onClick={() => setPeriodo(p)} style={{
              background: periodo === p ? T.accent : "transparent",
              color: periodo === p ? "#000" : T.muted,
              border: `1px solid ${periodo === p ? T.accent : T.border}`,
              borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 600,
              textTransform: "uppercase", letterSpacing: 0.5,
            }}>{p}</button>
          ))}
        </div>
      </div>

      {loading ? <Loader /> : !data ? null : (
        <>
          <div style={{ display: "flex", gap: 10, marginBottom: 10 }}>
            <StatCard label="VENTAS" value={data.totalVentas} color={T.green} />
            <StatCard label="GASTOS" value={data.totalGastos} color={T.red} />
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <StatCard label="GANANCIA" value={data.ganancia} color={data.ganancia >= 0 ? T.accent : T.red} />
            <StatCard label="A COBRAR" value={data.totalDeuda} color={T.blue} />
          </div>

          {data.ventas.length > 0 && (
            <>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 18, letterSpacing: 1, marginBottom: 10, color: T.muted }}>
                DETALLE VENTAS
              </div>
              {data.ventas.slice(0, 5).map(v => (
                <Card key={v.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14 }}>{v.producto_nombre} ×{v.cantidad}</span>
                    <span style={{ color: T.green, fontWeight: 700 }}>${Number(v.total).toLocaleString()}</span>
                  </div>
                </Card>
              ))}
            </>
          )}

          {data.deudores.length > 0 && (
            <>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 18, letterSpacing: 1, margin: "16px 0 10px", color: T.muted }}>
                DEUDAS PENDIENTES
              </div>
              {data.deudores.map(d => (
                <Card key={d.id} style={{ marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 14 }}>{d.nombre}</span>
                    <span style={{ color: T.red, fontWeight: 700 }}>${Number(d.monto).toLocaleString()}</span>
                  </div>
                </Card>
              ))}
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── APP SHELL ────────────────────────────────────────────────────────────────
const TABS = [
  { id: "ventas", label: "Ventas", icon: "money" },
  { id: "productos", label: "Productos", icon: "box" },
  { id: "deudores", label: "Deudores", icon: "person" },
  { id: "gastos", label: "Gastos", icon: "fire" },
  { id: "resumen", label: "Resumen", icon: "chart" },
];

export default function App() {
  const [tab, setTab] = useState("ventas");

  const pages = {
    ventas: <Ventas />,
    productos: <Productos />,
    deudores: <Deudores />,
    gastos: <Gastos />,
    resumen: <Resumen />,
  };

  return (
    <>
      <style>{css}</style>
      <div style={{ minHeight: "100vh", background: T.bg, paddingBottom: 72 }}>
        {/* Header */}
        <div style={{
          background: T.card, borderBottom: `1px solid ${T.border}`,
          padding: "14px 20px", display: "flex", alignItems: "center", gap: 10,
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <span style={{ fontSize: 22 }}>🏪</span>
          <span style={{ fontFamily: T.fontDisplay, fontSize: 22, letterSpacing: 2, color: T.accent }}>
            MI EMPRENDIMIENTO
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 16px", maxWidth: 520, margin: "0 auto" }}>
          {pages[tab]}
        </div>

        {/* Bottom Nav */}
        <div style={{
          position: "fixed", bottom: 0, left: 0, right: 0,
          background: T.card, borderTop: `1px solid ${T.border}`,
          display: "flex", justifyContent: "space-around",
          padding: "8px 0 10px", zIndex: 50,
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              background: "none", border: "none",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
              color: tab === t.id ? T.accent : T.muted,
              padding: "4px 12px",
              borderTop: tab === t.id ? `2px solid ${T.accent}` : "2px solid transparent",
              transition: "all 0.15s",
            }}>
              <Icon name={t.icon} size={18} />
              <span style={{ fontSize: 10, letterSpacing: 0.5, fontWeight: tab === t.id ? 600 : 400 }}>
                {t.label.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
