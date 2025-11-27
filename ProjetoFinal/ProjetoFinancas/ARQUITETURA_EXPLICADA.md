# Arquitetura - Gestão de Finanças

**Stack:** ASP.NET Core (Backend) + HTML/CSS/JS (Frontend) + JSON (Persistência)

---

## 🔄 Fluxos de Dados

### 1️⃣ REGISTO DE UTILIZADOR

```
Utilizador entra dados no formulário
          ↓
JavaScript captura evento (form onsubmit)
          ↓
Valida no frontend (confirmação de passwords)
          ↓
Envia POST /registar com { username, password, perfil }
          ↓
Backend recebe JSON e mapeia para objeto Utilizador
          ↓
Valida: Username já existe?
  ├─ SIM: Retorna 400 Bad Request
  └─ NÃO: Continua
          ↓
Atribui ID sequencial (utilizadores.Count + 1)
          ↓
Adiciona à lista em memória
          ↓
Persiste em ficheiro JSON (wwwroot/data/utilizadores.json)
          ↓
Retorna 200 OK com dados do utilizador criado
          ↓
Frontend mostra sucesso e pede login
```

### 2️⃣ LOGIN

```
Utilizador entra Username + Password
          ↓
JavaScript captura evento (form onsubmit)
          ↓
Envia POST /login com { username, password }
          ↓
Backend procura na lista em memória
          ↓
Valida: Username + Password correspondem?
  ├─ NÃO: Retorna 401 Unauthorized
  └─ SIM: Continua
          ↓
Retorna 200 OK com { id, username }
          ↓
Frontend armazena dados em variável global (usuarioAtual)
          ↓
Mostra nome no header
          ↓
Carrega lista de transações
```

### 3️⃣ ADICIONAR TRANSAÇÃO

```
Utilizador preenche formulário
          ↓
JavaScript captura evento (form onsubmit)
          ↓
Envia POST /transacoes com { name, amount, date, type, category }
          ↓
Backend recebe JSON e mapeia para objeto Transacao
          ↓
Atribui Number sequencial (transacoes.Count + 1)
          ↓
Adiciona à lista em memória
          ↓
Persiste em ficheiro JSON (wwwroot/data/transacoes.json)
          ↓
Retorna 200 OK com dados da transação criada
          ↓
Frontend limpa formulário
          ↓
Recarrega lista de transações (GET /transacoes)
          ↓
Renderiza tabela com todos os dados
          ↓
Calcula totais (receitas, despesas, saldo)
```

### 4️⃣ APAGAR TRANSAÇÃO

```
Utilizador clica botão "Eliminar"
          ↓
JavaScript pede confirmação (confirm dialog)
          ↓
Utilizador confirma
          ↓
Envia DELETE /transacoes/{numero}
          ↓
Backend procura na lista em memória por Number
          ↓
Valida: Transação existe?
  ├─ NÃO: Retorna 404 Not Found
  └─ SIM: Continua
          ↓
Remove da lista em memória
          ↓
Persiste lista atualizada em ficheiro JSON
          ↓
Retorna 200 OK
          ↓
Frontend recarrega lista de transações
```

### 5️⃣ EDITAR TRANSAÇÃO

```
Utilizador clica botão "Editar" numa transação
          ↓
JavaScript abre modal com dados da transação
          ↓
Utilizador altera campos (descrição, valor, data, tipo, categoria)
          ↓
Clica "Guardar"
          ↓
JavaScript valida (valor negativo? categoria válida?)
  ├─ INVÁLIDO: Mostra erro
  └─ VÁLIDO: Continua
          ↓
Envia PUT /transacoes/{numero} com dados atualizados
          ↓
Backend procura na lista em memória por Number
          ↓
Valida: Transação existe?
  ├─ NÃO: Retorna 404 Not Found
  └─ SIM: Continua
          ↓
Valida novamente (valor, categoria, tipo)
          ↓
Atualiza objeto na lista em memória
          ↓
Persiste lista atualizada em ficheiro JSON
          ↓
Retorna 200 OK
          ↓
Frontend fecha modal e recarrega transações
          ↓
Tabela e relatórios atualizam-se automaticamente
```

---


## 🎯 Componentes Principais

### Program.cs (Backend)
- **Responsabilidade:** Definir endpoints HTTP e orquestrar lógica de negócio
- **Endpoints (7 total):**
  1. `GET /` → Servir index.html
  2. `POST /registar` → Criar novo utilizador
  3. `POST /login` → Autenticar utilizador
  4. `GET /transacoes` → Listar todas as transações
  5. `POST /transacoes` → Criar nova transação
  6. `PUT /transacoes/{number}` → Editar transação existente
  7. `DELETE /transacoes/{number}` → Apagar transação

- **Validações implementadas:**
  - Utilizador duplicado no registo
  - Username/Password vazios
  - Password com menos de 3 caracteres
  - Credenciais inválidas no login
  - Valores negativos ou zero
  - Descrição vazia
  - Tipo inválido (deve ser "Receita" ou "Despesa")
  - Categoria inválida (apenas 5 válidas: Alimentação, Transporte, Moradia, Lazer, Saúde)
  - Transação não encontrada (DELETE/PUT)

- **Tratamento de exceções:**
  - Try-catch em cada endpoint
  - Retorna HTTP 400 para erros de validação
  - Retorna HTTP 401 para autenticação falha
  - Retorna HTTP 404 para não encontrado
  - Retorna HTTP 500 para erros internos

### script.js (Frontend)
- **Responsabilidade:** Controlar interface e comunicar com backend
- **Funções principais:**
  - `mostrar_login()` / `mostrar_registar()` → Mostrar/esconder modais
  - `fazer_login()` → Autenticar utilizador
  - `fazer_registar()` → Criar nova conta
  - `fazer_logout()` → Terminar sessão
  - `carregar()` → Buscar transações do servidor (GET /transacoes)
  - `adicionar()` → Criar nova transação (POST /transacoes)
  - `mostrar()` → Renderizar tabela de transações
  - `deletar()` → Eliminar transação (DELETE /transacoes/{id})
  - `abrirEdicao()` → Abrir modal de edição com dados da transação
  - `fecharEdicao()` → Fechar modal
  - `guardarEdicao()` → Atualizar transação (PUT /transacoes/{id})
  - `calcular()` → Calcular totais (receitas, despesas, saldo)

- **Validações no frontend:**
  - Campos obrigatórios não vazios
  - Username/Password mínimo 3 caracteres
  - Passwords correspondem no registo
  - Valor é número
  - Valor não é negativo
  - Valor não é zero
  - Tipo válido ("Receita" ou "Despesa")

- **Tratamento de erros:**
  - Mensagens com ❌ para erros
  - Mensagens com ✅ para sucesso
  - Erros HTTP 400 mostram detalhe específico
  - Erro 401 mostra "Utilizador ou password inválidos"

### Persistencia.cs (I/O)
- **Responsabilidade:** Abstrair leitura/escrita de ficheiros JSON
- **Métodos:**
  - `GuardarUtilizadores()` → Serializar → Escrever ficheiro
  - `CarregarUtilizadores()` → Ler ficheiro → Desserializar
  - `GuardarTransacoes()` → Serializar → Escrever ficheiro
  - `CarregarTransacoes()` → Ler ficheiro → Desserializar
  - Etc. para categorias

### index.html (Interface)
- **Responsabilidade:** Apresentar formulários, tabelas e modais
- **Elementos principais:**
  - Modal de login (sempre visível até autenticação)
  - Modal de registo
  - Modal de edição de transação (NEW)
  - Header com info do utilizador
  - Formulário para adicionar transação
  - Tabela de transações (com botões Editar e Eliminar)
  - Relatório com totais (Receitas, Despesas, Saldo)

---

## 🔐 Fluxo de Autenticação

1. **Primeira vez:** Utilizador clica "Regista-te"
   - Preenche Username, Password, Confirmação
   - Frontend valida se passwords correspondem e têm mínimo 3 caracteres
   - Envia POST /registar
   - Backend valida username não duplicado, password mínimo 3 caracteres
   - Se válido, cria nova conta e grava em JSON (utilizadores.json)
   - Retorna sucesso
   - Utilizador volta para login

2. **Login:** Utilizador entra credenciais
   - Frontend valida campos não vazios
   - Envia POST /login
   - Backend procura Username + Password na lista em memória
   - Se encontrar, retorna dados do utilizador (id, username)
   - Se não encontrar, retorna erro 401
   - Frontend armazena em variável global `usuarioAtual`
   - Mostra interface principal com transações

3. **Logout:** Utilizador clica "Sair"
   - Frontend limpa variável global `usuarioAtual`
   - Volta para modal de login
   - Dados permanecem gravados em JSON (próximo login funciona)

---

## 💾 Formato dos Ficheiros JSON

### utilizadores.json
```json
[
  {
    "id": 1,
    "username": "joao",
    "password": "senha123",
    "perfil": "comum"
  },
  {
    "id": 2,
    "username": "maria",
    "password": "pass456",
    "perfil": "comum"
  }
]
```

### transacoes.json
```json
[
  {
    "number": 1,
    "name": "Salário",
    "amount": 1500.00,
    "date": "2025-11-26",
    "type": "Receita",
    "category": "Salário"
  },
  {
    "number": 2,
    "name": "Supermercado",
    "amount": 50.00,
    "date": "2025-11-26",
    "type": "Despesa",
    "category": "Alimentação"
  }
]
```

---



## 📚 Fluxo Geral da Aplicação

```
1. Browser acede https://localhost:5001
   └─ GET / → Devolver index.html

2. Página carrega
   ├─ Mostrar modal de login
   ├─ Carregar script.js
   └─ Esperar interação do utilizador

3. Utilizador faz login ou registo
   ├─ Frontend valida (campos não vazios, passwords mínimo 3 caracteres)
   ├─ Envia POST para backend
   ├─ Backend valida novamente (segurança em camadas)
   ├─ Backend persiste em JSON
   └─ Retorna resposta JSON com erro ou sucesso

4. Utilizador pode gerenciar transações
   ├─ Adicionar: POST /transacoes com validação
   ├─ Listar: GET /transacoes
   ├─ Editar: PUT /transacoes/{id} com validação (NEW)
   └─ Apagar: DELETE /transacoes/{id}

5. Cada operação:
   ├─ Frontend valida
   ├─ Backend valida novamente (valores, categoria, tipo, existência)
   ├─ Atualiza JSON em wwwroot/data/
   └─ Retorna resposta para atualizar UI

6. Dados persistem entre reloads
   └─ Carregados do JSON na inicialização

7. Utilizador faz logout
   └─ Limpar estado, voltar para login, dados salvos em JSON
```

---

## 🛡️ Segurança & Validação em Camadas

**Frontend (1ª camada):**
- Valida tipo de dados (número, texto)
- Valida campos obrigatórios
- Valida tamanho mínimo (password, username)
- Mostra erro ao utilizador antes de enviar

**Backend (2ª camada):**
- Valida novamente TODOS os dados
- Valida categorias contra lista whitelist
- Valida tipos contra lista whitelist
- Valida existência de registos (DELETE/PUT)
- Try-catch para exceções imprevistas
- Retorna erro apropriado (400, 401, 404, 500)

**JSON (3ª camada):**
- Dados persistentes
- Validação ao carregar (desserialização)

---
