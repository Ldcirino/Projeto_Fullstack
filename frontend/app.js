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
      <div className="form-top">
        <p className="eyebrow">Passo 1 de 3: Dados Principais</p>
        <h2 className="title">Iniciar Jornada • TechStock</h2>
        <p className="sub">Crie sua conta para gestão de alto nível de mini mercados</p>
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
      <div className="form-top">
        <h2 className="title">Ativação de Conta</h2>
        <p className="sub">Confirme seu WhatsApp e o código de 4 dígitos para acesso total</p>
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

  return (
    <div className="wrap">
      <div className="page-head">
        <div className="brand">Gestão de Estoque • Mini Mercado</div>
        <SectionNav
          current={screen}
          onChange={(s) => {
            setScreen(s);
          }}
        />
      </div>

      <div className="content-grid">
        <div>
          {screen === "register" ? (
            <RegisterForm apiBase={apiBase} onGoActivate={(phone) => { setLastPhone(phone); setScreen("activate"); }} />
          ) : null}
          {screen === "activate" ? <ActivateForm apiBase={apiBase} initialPhone={lastPhone} /> : null}
          {screen === "login" ? <LoginForm apiBase={apiBase} onLoggedIn={() => {}} /> : null}
        </div>
        <SidePanel screen={screen} />
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);

