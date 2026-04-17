const { useEffect, useMemo, useState } = React;

const DEFAULT_API_BASE = "http://localhost:5000";
const LS_TOKEN_KEY = "mm_token";
const LS_USER_KEY = "mm_user";

function readApiBase() {
  const params = new URLSearchParams(window.location.search);
  return params.get("apiBase") || DEFAULT_API_BASE;
}

async function apiPost(apiBase, path, body, token) {
  return apiFetch(apiBase, path, "POST", body, token);
}

async function apiGet(apiBase, path, token) {
  return apiFetch(apiBase, path, "GET", null, token);
}

async function apiPut(apiBase, path, body, token) {
  return apiFetch(apiBase, path, "PUT", body, token);
}

async function apiPatch(apiBase, path, body, token) {
  return apiFetch(apiBase, path, "PATCH", body, token);
}

async function apiFetch(apiBase, path, method, body, token) {
  const headers = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${apiBase}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message = (data && (data.erro || data.mensagem)) || `Falha (${res.status}) ao chamar ${path}`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

function normalizePhone(v) {
  return (v || "").trim();
}

function MessageBox({ kind, title, children }) {
  if (!children) return null;
  return (
    <div className={`msg ${kind || ""}`}>
      {title ? <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div> : null}
      <div>{children}</div>
    </div>
  );
}

function statusLabel(status) {
  return status === "Ativo" ? "Ativo" : "Inativo";
}

function RegisterForm({ apiBase, onGoActivate }) {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [name, setName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [celular, setCelular] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setOk("");
    setErr("");
    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        cnpj: cnpj.trim(),
        email: email.trim(),
        celular: normalizePhone(celular),
        password,
      };
      const data = await apiPost(apiBase, "/api/sellers", payload);
      setOk(data.mensagem || "Cadastro realizado com sucesso.");
      if (onGoActivate) onGoActivate(payload.celular);
    } catch (e2) {
      setErr(e2.message || "Erro ao cadastrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="form-top">
        <p className="eyebrow">Passo 1 de 3: Dados Principais</p>
        <h2 className="title">Iniciar Jornada • TechStock</h2>
        <p className="sub">Crie sua conta para gestão de mini mercados com controle de vendas e estoque.</p>
      </div>
      <form onSubmit={onSubmit}>
        <label>
          Nome do mini mercado
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Mini Mercado X" />
        </label>
        <div className="row">
          <label>
            CNPJ
            <input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
          </label>
          <label>
            WhatsApp (com DDI)
            <input
              value={celular}
              onChange={(e) => setCelular(e.target.value)}
              placeholder="+5511999999999"
            />
          </label>
        </div>
        <label>
          E-mail
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mercado@email.com" />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="********"
          />
        </label>
        <button className="btn" disabled={loading}>
          {loading ? "Cadastrando..." : "Cadastrar"}
        </button>
        <div className="helper-row">
          <span className="helper-pill">Validação de CNPJ</span>
          <span className="helper-pill">Termos de Uso</span>
        </div>
        <MessageBox kind="ok" title="Sucesso">
          {ok}
        </MessageBox>
        <MessageBox kind="err" title="Erro">
          {err}
        </MessageBox>
      </form>
    </div>
  );
}

function ActivateForm({ apiBase, initialPhone }) {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [celular, setCelular] = useState(initialPhone || "");
  const [codigo, setCodigo] = useState("");

  useEffect(() => {
    if (initialPhone) setCelular(initialPhone);
  }, [initialPhone]);

  async function onSubmit(e) {
    e.preventDefault();
    setOk("");
    setErr("");
    setLoading(true);
    try {
      const data = await apiPost(apiBase, "/api/sellers/activate", {
        celular: normalizePhone(celular),
        codigo: (codigo || "").trim(),
      });
      setOk(data.mensagem || "Conta ativada com sucesso.");
    } catch (e2) {
      setErr(e2.message || "Erro ao ativar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="form-top">
        <h2 className="title">Ativação de Conta</h2>
        <p className="sub">Confirme seu WhatsApp e o código de 4 dígitos para acesso total.</p>
      </div>
      <div className="code-input">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="step-circle">
            {item}
          </div>
        ))}
      </div>
      <form onSubmit={onSubmit}>
        <label>
          WhatsApp (com DDI)
          <input value={celular} onChange={(e) => setCelular(e.target.value)} placeholder="+5511977603310" />
        </label>
        <label>
          Código
          <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="1234" />
        </label>
        {loading ? <div className="verifying">Verificando...</div> : null}
        <button className="btn" disabled={loading}>
          {loading ? "Ativando..." : "Ativar"}
        </button>
        <MessageBox kind="ok" title="Sucesso">
          {ok}
        </MessageBox>
        <MessageBox kind="err" title="Erro">
          {err}
        </MessageBox>
      </form>
    </div>
  );
}

function LoginForm({ apiBase, onLoggedIn }) {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setOk("");
    setErr("");
    setLoading(true);
    try {
      const data = await apiPost(apiBase, "/api/auth/login", {
        email: email.trim(),
        senha,
      });
      setOk(data.mensagem || "Login realizado com sucesso.");
      if (onLoggedIn) onLoggedIn(data);
    } catch (e2) {
      setErr(e2.message || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="form-top">
        <h2 className="title">Acesso Restrito</h2>
        <p className="sub">
          Segurança: <span className="highlight">Criptografia Ativa</span>
        </p>
      </div>
      <form onSubmit={onSubmit}>
        <label>
          E-mail
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="mercado@email.com" />
        </label>
        <label>
          Senha
          <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="********" />
        </label>
        <button className="btn" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
        <MessageBox kind="ok" title="Sucesso">
          {ok}
        </MessageBox>
        <MessageBox kind="err" title="Erro">
          {err}
        </MessageBox>
      </form>
    </div>
  );
}

function DashboardPage({ apiBase, token }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const result = await apiGet(apiBase, "/api/dashboard", token);
      setData(result.totais || result);
    } catch (e2) {
      setErr(e2.message || "Erro ao carregar dados do dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="card">
      <div className="top-bar">
        <div>
          <p className="eyebrow">Visão geral</p>
          <h2 className="title">Dashboard do Mini Mercado</h2>
          <p className="sub">Painel rápido com vendas, estoque e produtos ativos.</p>
        </div>
        <button className="btn" onClick={load} disabled={loading}>
          {loading ? "Atualizando..." : "Atualizar métricas"}
        </button>
      </div>
      {err ? <MessageBox kind="err" title="Erro">{err}</MessageBox> : null}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <strong>{data ? data.produtos : "--"}</strong>
          <p>Produtos cadastrados</p>
        </div>
        <div className="dashboard-card">
          <strong>{data ? data.produtos_ativos : "--"}</strong>
          <p>Produtos ativos</p>
        </div>
        <div className="dashboard-card">
          <strong>{data ? data.vendas : "--"}</strong>
          <p>Vendas registradas</p>
        </div>
        <div className="dashboard-card">
          <strong>{data ? data.estoque_total : "--"}</strong>
          <p>Unidades em estoque</p>
        </div>
        <div className="dashboard-card">
          <strong>{data ? data.faturamento.toFixed(2) : "--"}</strong>
          <p>Faturamento total</p>
        </div>
      </div>
    </div>
  );
}

function ProductsPage({ apiBase, token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState("Ativo");
  const [img, setImg] = useState("");

  async function loadProducts() {
    setLoading(true);
    setErr("");
    try {
      const data = await apiGet(apiBase, "/api/products", token);
      setProducts(data.produtos || []);
    } catch (e2) {
      setErr(e2.message || "Erro ao carregar produtos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function resetForm() {
    setSelected(null);
    setName("");
    setPrice("");
    setQuantity("");
    setStatus("Ativo");
    setImg("");
    setOk("");
    setErr("");
  }

  function startEditing(product) {
    setSelected(product);
    setName(product.name);
    setPrice(String(product.price));
    setQuantity(String(product.quantity));
    setStatus(product.status);
    setImg(product.img || "");
    setOk("");
    setErr("");
  }

  async function saveProduct(e) {
    e.preventDefault();
    setFormLoading(true);
    setOk("");
    setErr("");
    try {
      const payload = {
        name: name.trim(),
        price: Number(price),
        quantity: Number(quantity),
        status,
        img: img.trim() || null,
      };
      if (!payload.name || Number.isNaN(payload.price) || Number.isNaN(payload.quantity)) {
        throw new Error("Preencha nome, preço e quantidade corretamente.");
      }

      if (selected) {
        await apiPut(apiBase, `/api/products/${selected.id}`, payload, token);
        setOk("Produto atualizado com sucesso.");
      } else {
        await apiPost(apiBase, "/api/products", payload, token);
        setOk("Produto criado com sucesso.");
      }
      resetForm();
      await loadProducts();
    } catch (e2) {
      setErr(e2.message || "Erro ao salvar produto.");
    } finally {
      setFormLoading(false);
    }
  }

  async function inactivateProduct(product) {
    setLoading(true);
    setOk("");
    setErr("");
    try {
      await apiPatch(apiBase, `/api/products/${product.id}/inactivate`, null, token);
      setOk(`Produto "${product.name}" inativado.`);
      if (selected?.id === product.id) resetForm();
      await loadProducts();
    } catch (e2) {
      setErr(e2.message || "Erro ao inativar produto.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="top-bar">
        <div>
          <p className="eyebrow">Inventário</p>
          <h2 className="title">Produtos</h2>
          <p className="sub">Cadastre, edite e inative itens do seu estoque.</p>
        </div>
        <button className="btn" onClick={resetForm} disabled={formLoading}>
          Novo produto
        </button>
      </div>
      <form onSubmit={saveProduct}>
        <label>
          Nome do produto
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Arroz, Feijão, Leite..." />
        </label>
        <div className="row">
          <label>
            Preço
            <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="12.90" />
          </label>
          <label>
            Quantidade
            <input value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="10" />
          </label>
        </div>
        <label>
          Status
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Ativo">Ativo</option>
            <option value="Inativo">Inativo</option>
          </select>
        </label>
        <label>
          Imagem (URL)
          <input value={img} onChange={(e) => setImg(e.target.value)} placeholder="https://..." />
        </label>
        <button className="btn" type="submit" disabled={formLoading}>
          {formLoading ? "Salvando..." : selected ? "Atualizar produto" : "Cadastrar produto"}
        </button>
      </form>
      {ok ? <MessageBox kind="ok" title="Sucesso">{ok}</MessageBox> : null}
      {err ? <MessageBox kind="err" title="Erro">{err}</MessageBox> : null}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Preço</th>
              <th>Qtd</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="5">Nenhum produto cadastrado.</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>R$ {product.price.toFixed(2)}</td>
                  <td>{product.quantity}</td>
                  <td>{statusLabel(product.status)}</td>
                  <td>
                    <button className="action-btn" type="button" onClick={() => startEditing(product)}>
                      Editar
                    </button>
                    {product.status === "Ativo" ? (
                      <button className="action-btn" type="button" onClick={() => inactivateProduct(product)}>
                        Inativar
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SalesPage({ apiBase, token }) {
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");
  const [productId, setProductId] = useState("");
  const [quantidade, setQuantidade] = useState("");

  async function loadData() {
    setLoading(true);
    setErr("");
    try {
      const [prodResult, salesResult] = await Promise.all([
        apiGet(apiBase, "/api/products", token),
        apiGet(apiBase, "/api/sales", token),
      ]);
      setProducts((prodResult.produtos || []).filter((p) => p.status === "Ativo"));
      setSales(salesResult.vendas || []);
    } catch (e2) {
      setErr(e2.message || "Erro ao carregar vendas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function submitSale(e) {
    e.preventDefault();
    setFormLoading(true);
    setErr("");
    setOk("");
    try {
      if (!productId || !quantidade) {
        throw new Error("Selecione produto e quantidade.");
      }
      await apiPost(apiBase, "/api/sales", {
        produtoId: Number(productId),
        quantidade: Number(quantidade),
      }, token);
      setOk("Venda registrada com sucesso.");
      setProductId("");
      setQuantidade("");
      await loadData();
    } catch (e2) {
      setErr(e2.message || "Erro ao registrar venda.");
    } finally {
      setFormLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="top-bar">
        <div>
          <p className="eyebrow">Movimentação</p>
          <h2 className="title">Vendas</h2>
          <p className="sub">Registre vendas e acompanhe o histórico de transações.</p>
        </div>
        <button className="btn" onClick={loadData} disabled={loading}>
          {loading ? "Carregando..." : "Atualizar"}
        </button>
      </div>
      <form onSubmit={submitSale}>
        <label>
          Produto
          <select value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">Selecione um produto</option>
            {products.map((product) => (
              <option key={product.id} value={product.id}>
                {product.name} — R$ {product.price.toFixed(2)} — {product.quantity} em estoque
              </option>
            ))}
          </select>
        </label>
        <label>
          Quantidade
          <input value={quantidade} onChange={(e) => setQuantidade(e.target.value)} placeholder="1" />
        </label>
        <button className="btn" type="submit" disabled={formLoading}>
          {formLoading ? "Registrando..." : "Registrar venda"}
        </button>
      </form>
      {ok ? <MessageBox kind="ok" title="Sucesso">{ok}</MessageBox> : null}
      {err ? <MessageBox kind="err" title="Erro">{err}</MessageBox> : null}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Qtd</th>
              <th>Preço</th>
              <th>Total</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {sales.length === 0 ? (
              <tr>
                <td colSpan="5">Nenhuma venda registrada.</td>
              </tr>
            ) : (
              sales.map((sale) => (
                <tr key={sale.id}>
                  <td>{sale.produto.name}</td>
                  <td>{sale.quantity}</td>
                  <td>R$ {sale.price_at_sale.toFixed(2)}</td>
                  <td>R$ {(sale.price_at_sale * sale.quantity).toFixed(2)}</td>
                  <td>{new Date(sale.created_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SidePanel({ screen }) {
  if (screen === "register") {
    return (
      <div className="panel">
        <div className="panel-card note">
          <h3>Login via CPF</h3>
          <p>Use seu CPF para entrar mais rápido ou tente acessar com e-mail caso prefira.</p>
        </div>
        <div className="panel-card">
          <button type="button" className="panel-button">
            <span>Login via CPF</span>
          </button>
          <button type="button" className="panel-button">
            <span>Tentar por E-mail</span>
          </button>
        </div>
      </div>
    );
  }

  if (screen === "activate") {
    return (
      <div className="panel">
        <div className="panel-card note">
          <h3>Reenviar código</h3>
          <p>Precisa de um novo código? Reenvie pelo WhatsApp ou tente recuperar por e-mail.</p>
        </div>
        <div className="panel-card">
          <button type="button" className="panel-button">
            <span>Reenviar código por WhatsApp</span>
          </button>
          <button type="button" className="panel-button">
            <span>Tentar por E-mail</span>
          </button>
        </div>
      </div>
    );
  }

  if (screen === "dashboard") {
    return (
      <div className="panel">
        <div className="panel-card note">
          <h3>Seu painel</h3>
          <p>Acompanhe o faturamento, total de vendas e estoque em tempo real.</p>
        </div>
        <div className="panel-card">
          <button type="button" className="panel-button">
            <span>Atualizar métricas</span>
          </button>
          <button type="button" className="panel-button">
            <span>Visão geral rápida</span>
          </button>
        </div>
      </div>
    );
  }

  if (screen === "products") {
    return (
      <div className="panel">
        <div className="panel-card note">
          <h3>Gerencie seus produtos</h3>
          <p>Cadastre novos itens, ajuste estoque e mantenha seu catálogo sempre atualizado.</p>
        </div>
        <div className="panel-card">
          <button type="button" className="panel-button">
            <span>Adicionar produto</span>
          </button>
          <button type="button" className="panel-button">
            <span>Inativar produto</span>
          </button>
        </div>
      </div>
    );
  }

  if (screen === "sales") {
    return (
      <div className="panel">
        <div className="panel-card note">
          <h3>Vendas em dia</h3>
          <p>Registre vendas rapidamente e monitore seu fluxo de caixa.</p>
        </div>
        <div className="panel-card">
          <button type="button" className="panel-button">
            <span>Registrar nova venda</span>
          </button>
          <button type="button" className="panel-button">
            <span>Ver histórico</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-card note">
        <h3>Esqueceu a senha?</h3>
        <p>Se não lembrar, utilize a opção de biometria para entrar com segurança.</p>
      </div>
      <div className="panel-card">
        <button type="button" className="panel-button">
          <span>Logar com Biometria</span>
        </button>
      </div>
    </div>
  );
}

function App() {
  const apiBase = useMemo(() => readApiBase(), []);
  const [screen, setScreen] = useState("register");
  const [lastPhone, setLastPhone] = useState("");
  const [token, setToken] = useState(localStorage.getItem(LS_TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(LS_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token && !user) {
      const raw = localStorage.getItem(LS_USER_KEY);
      if (raw) setUser(JSON.parse(raw));
    }
  }, [token, user]);

  function handleLoggedIn(data) {
    if (data.token) {
      localStorage.setItem(LS_TOKEN_KEY, data.token);
      setToken(data.token);
    }
    if (data.usuario) {
      localStorage.setItem(LS_USER_KEY, JSON.stringify(data.usuario));
      setUser(data.usuario);
    }
    setScreen("dashboard");
  }

  function handleLogout() {
    localStorage.removeItem(LS_TOKEN_KEY);
    localStorage.removeItem(LS_USER_KEY);
    setToken(null);
    setUser(null);
    setScreen("register");
  }

  const unauthItems = [
    { id: "register", label: "Cadastro" },
    { id: "activate", label: "Ativação" },
    { id: "login", label: "Login" },
  ];

  const authItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "products", label: "Produtos" },
    { id: "sales", label: "Vendas" },
  ];

  return (
    <div className="wrap">
      <div className="page-head">
        <div className="brand">Gestão de Estoque • Mini Mercado</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", justifyContent: "center", width: "100%" }}>
          <SectionNav current={screen} items={user ? authItems : unauthItems} onChange={setScreen} />
          {user ? (
            <button className="logout-btn" type="button" onClick={handleLogout}>
              Sair
            </button>
          ) : null}
        </div>
      </div>
      <div className="content-grid">
        <div>
          {!user ? (
            <>
              {screen === "register" ? (
                <RegisterForm apiBase={apiBase} onGoActivate={(phone) => {
                  setLastPhone(phone);
                  setScreen("activate");
                }} />
              ) : null}
              {screen === "activate" ? <ActivateForm apiBase={apiBase} initialPhone={lastPhone} /> : null}
              {screen === "login" ? <LoginForm apiBase={apiBase} onLoggedIn={handleLoggedIn} /> : null}
            </>
          ) : (
            <>
              {screen === "dashboard" ? <DashboardPage apiBase={apiBase} token={token} /> : null}
              {screen === "products" ? <ProductsPage apiBase={apiBase} token={token} /> : null}
              {screen === "sales" ? <SalesPage apiBase={apiBase} token={token} /> : null}
            </>
          )}
        </div>
        <SidePanel screen={screen} />
      </div>
    </div>
  );
}

function SectionNav({ items, current, onChange }) {
  return (
    <nav>
      {items.map((it) => (
        <div
          key={it.id}
          className={`pill ${current === it.id ? "active" : ""}`}
          onClick={() => onChange(it.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && onChange(it.id)}
        >
          {it.label}
        </div>
      ))}
    </nav>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
