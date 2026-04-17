# 📦 Gestão de Estoque para Mini Mercados

## 📌 Objetivo
Desenvolver um sistema para gestão de estoque e vendas de mini mercados, garantindo segurança, controle de acesso e gestão eficiente de produtos e vendas.

---

## 🚀 Funcionalidades Principais

### 1️⃣ Cadastro de Mini Mercado (Conta)
Os mini mercados devem se cadastrar informando os seguintes campos:
- **Nome**
- **CNPJ**
- **E-mail**
- **Celular**
- **Senha**
- **Status** (Padrão: Inativo)

 🔹 Fluxo de ativação da conta:
1. Após o cadastro, um código de 4 dígitos é enviado via **WhatsApp (Twilio)** para o mini mercado.
2. O mini mercado deve inserir o código recebido para ativar sua conta.
3. Somente contas ativadas podem fazer login e gerenciar produtos.

---

### 2️⃣ Autenticação
- O sistema deve utilizar **JWT** ou **OAuth** para autenticação.
- Contas inativas não podem fazer login.

---

### 3️⃣ Gerenciamento de Produtos
Um mini mercado autenticado pode:
- **Cadastrar produtos** com os seguintes campos:
  - Nome
  - Preço
  - Quantidade
  - Status (Ativo/Inativo)
  - Imagem
- **Listar produtos** cadastrados
- **Editar produto**
- **Ver detalhes de um produto**
- **Inativar produtos**

**Regras:**
- O mini mercado só pode visualizar e gerenciar seus próprios produtos.

---

### 4️⃣ Venda de Produtos
- O mini mercado pode realizar uma venda informando:
  - Produto
  - Quantidade
- As vendas devem ser armazenadas na tabela `Vendas`, contendo:
  - ID do Produto
  - Quantidade vendida
  - Preço do produto no momento da venda

**Regras:**
- Não é possível vender mais do que a quantidade disponível em estoque.
- Produtos inativados não podem ser vendidos.
- Contas inativas não podem realizar vendas.

---

## 📡 Endpoints da API

### 1️⃣ Cadastro e Ativação de Conta
- **Criar conta (mini mercado)**
  ```bash
  curl -X POST "http://localhost:8080/api/sellers" \
       -H "Content-Type: application/json" \
       -d '{"nome": "Mini Mercado X", "cnpj": "00.000.000/0001-00", "email": "mercado@email.com", "celular": "+559999999999", "senha": "123456"}'
  ```
- **Ativar conta via WhatsApp (Twilio)**
  ```bash
  curl -X POST "http://localhost:8080/api/sellers/activate" \
       -H "Content-Type: application/json" \
       -d '{"celular": "+559999999999", "codigo": "1234"}'
  ```

### 2️⃣ Autenticação
- **Login**
  ```bash
  curl -X POST "http://localhost:8080/api/auth/login" \
       -H "Content-Type: application/json" \
       -d '{"email": "mercado@email.com", "senha": "123456"}'
  ```

### 3️⃣ Gerenciamento de Produtos
- **Cadastrar Produto**
  ```bash
  curl -X POST "http://localhost:8080/api/products" \
       -H "Authorization: Bearer SEU_TOKEN" \
       -H "Content-Type: application/json" \
       -d '{"nome": "Arroz", "preco": 10.50, "quantidade": 100, "status": "Ativo", "img": "url_da_imagem"}'
  ```
- **Listar Produtos**
  ```bash
  curl -X GET "http://localhost:8080/api/products" \
       -H "Authorization: Bearer SEU_TOKEN"
  ```
- **Editar Produto**
  ```bash
  curl -X PUT "http://localhost:8080/api/products/1" \
       -H "Authorization: Bearer SEU_TOKEN" \
       -H "Content-Type: application/json" \
       -d '{"nome": "Arroz Integral", "preco": 12.00, "quantidade": 50, "status": "Ativo"}'
  ```
- **Ver Detalhes de um Produto**
  ```bash
  curl -X GET "http://localhost:8080/api/products/1" \
       -H "Authorization: Bearer SEU_TOKEN"
  ```
- **Inativar Produto**
  ```bash
  curl -X PATCH "http://localhost:8080/api/products/1/inactivate" \
       -H "Authorization: Bearer SEU_TOKEN"
  ```

### 4️⃣ Realizar Venda
- **Criar Venda**
  ```bash
  curl -X POST "http://localhost:8080/api/sales" \
       -H "Authorization: Bearer SEU_TOKEN" \
       -H "Content-Type: application/json" \
       -d '{"produtoId": 1, "quantidade": 2}'
  ```

---

## 🛠️ Tecnologias Utilizadas
- **Back-end:** Kotlin + Spring Boot
- **Front-end:** React.js
- **Banco de Dados:** MySQL ou PostgreSQL
- **Autenticação:** JWT ou OAuth
- **Mensageria:** Twilio (para envio do código de ativação no WhatsApp)

---

## 🖥️ Front-end (React) – telas de acesso

Este repositório inclui um front end React (sem build, via CDN) em `frontend/` com as telas:

- Cadastro do mini mercado
- Ativação da conta
- Login

### Como rodar

1) Suba o back end (porta padrão **5000**):

```bash
pip install -r requirements.txt
python run.py
```

2) Sirva o front end em outro terminal:

```bash
cd frontend
python -m http.server 5173
```

3) Acesse no navegador:

- `http://localhost:5173`

Se seu back end estiver em outra porta/host, passe `apiBase` na URL, por exemplo:

- `http://localhost:5173/?apiBase=http://localhost:5000`

### Observações sobre payloads

O back end atualmente espera os seguintes campos:

- **Cadastro** (`POST /api/sellers`): `name`, `cnpj`, `email`, `celular`, `password`
- **Ativação** (`POST /api/sellers/activate`): `celular`, `codigo`
- **Login** (`POST /api/auth/login`): `email`, `senha`

## 📊 Dashboard e Relatórios
- Implementação de um painel para exibição de relatórios e análise de vendas.
- Monitoramento de estoque em tempo real.

---

## 📌 Considerações Finais
Este projeto fornece um sistema completo para mini mercados gerenciarem seus estoques e vendas com segurança e eficiência. 🚀

