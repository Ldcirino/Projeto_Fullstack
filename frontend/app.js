const { useEffect, useMemo, useState } = React;

const DEFAULT_API_BASE = "http://localhost:5000";
const LS_TOKEN_KEY = "mm_token";
const LS_USER_KEY = "mm_user";

function readApiBase() {
  const params = new URLSearchParams(window.location.search);
  return params.get("apiBase") || DEFAULT_API_BASE;
}

async function apiPost(apiBase, path, body, token) {
  const res = await fetch(`${apiBase}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      (data && (data.erro || data.mensagem)) ||
      `Falha (${res.status}) ao chamar ${path}`;
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

function SectionNav({ current, onChange }) {
  const items = [
    { id: "register", label: "Cadastro" },
    { id: "activate", label: "Ativação" },
    { id: "login", label: "Login" },
  ];

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

function MessageBox({ kind, title, children }) {
  if (!children) return null;
  return (
    <div className={`msg ${kind || ""}`}>
      {title ? <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div> : null}
      <div>{children}</div>
    </div>
  );
}

function RegisterForm({ apiBase, onGoActivate }) {
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState("");
  const [err, setErr] = useState("");

  // Backend espera: name, cnpj, email, celular, password
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
      <h2 className="title">Cadastro do mini mercado</h2>
      <p className="sub">
        Crie sua conta. Após o cadastro, você receberá um código de 4 dígitos no WhatsApp para ativar sua conta.
      </p>
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
              placeholder="+559999999999"
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

  // Backend espera: celular, codigo
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
      <h2 className="title">Ativar conta</h2>
      <p className="sub">
        Informe o WhatsApp e o código de 4 dígitos recebido para ativar sua conta.
      </p>
      <form onSubmit={onSubmit}>
        <label>
          WhatsApp (com DDI)
          <input value={celular} onChange={(e) => setCelular(e.target.value)} placeholder="+559999999999" />
        </label>
        <label>
          Código
          <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="1234" />
        </label>
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

  // Backend espera: email, senha (atenção: campo é "senha", não "password")
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
      if (data.token) localStorage.setItem(LS_TOKEN_KEY, data.token);
      if (data.usuario) localStorage.setItem(LS_USER_KEY, JSON.stringify(data.usuario));
      if (onLoggedIn) onLoggedIn(data);
    } catch (e2) {
      setErr(e2.message || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2 className="title">Login</h2>
      <p className="sub">Para entrar, sua conta precisa estar ativada.</p>
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

function SessionCard({ apiBase }) {
  const [token, setToken] = useState(localStorage.getItem(LS_TOKEN_KEY) || "");
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(LS_USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    function onStorage() {
      setToken(localStorage.getItem(LS_TOKEN_KEY) || "");
      try {
        const raw = localStorage.getItem(LS_USER_KEY);
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function clear() {
    localStorage.removeItem(LS_TOKEN_KEY);
    localStorage.removeItem(LS_USER_KEY);
    setToken("");
    setUser(null);
  }

  return (
    <div className="card">
      <h2 className="title">Conexão com a API</h2>
      <p className="sub">
        A API base atual é <code className="kbd">{apiBase}</code>. Você pode trocar usando{" "}
        <code className="kbd">?apiBase=http://localhost:5000</code>.
      </p>
      <div className="small" style={{ marginBottom: 10 }}>
        Token salvo no navegador (após login):
      </div>
      <div className="msg" style={{ marginBottom: 10 }}>
        <div className="tokenBox">{token || "(sem token)"}</div>
      </div>
      <div className="small" style={{ marginBottom: 10 }}>
        Usuário:
      </div>
      <div className="msg" style={{ marginBottom: 10 }}>
        <div className="tokenBox">{user ? JSON.stringify(user, null, 2) : "(sem usuário)"}</div>
      </div>
      <button className="btn secondary" onClick={clear} disabled={!token && !user}>
        Limpar sessão local
      </button>
    </div>
  );
}

function App() {
  const apiBase = useMemo(() => readApiBase(), []);
  const [screen, setScreen] = useState("register");
  const [lastPhone, setLastPhone] = useState("");

  return (
    <div className="wrap">
      <header>
        <h1>Gestão de Estoque • Mini Mercado</h1>
        <SectionNav
          current={screen}
          onChange={(s) => {
            setScreen(s);
          }}
        />
      </header>

      <div className="grid">
        <div>
          {screen === "register" ? (
            <RegisterForm apiBase={apiBase} onGoActivate={(phone) => { setLastPhone(phone); setScreen("activate"); }} />
          ) : null}
          {screen === "activate" ? <ActivateForm apiBase={apiBase} initialPhone={lastPhone} /> : null}
          {screen === "login" ? <LoginForm apiBase={apiBase} onLoggedIn={() => {}} /> : null}
        </div>
        <div>
          <SessionCard apiBase={apiBase} />
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

