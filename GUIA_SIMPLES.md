# Gestão de Finanças - Guia Simples

## O que é?

Aplicação web para **guardar e controlar dinheiro**: quanto entra, quanto sai, quanto sobra.

---

## Como funciona?

### 1️⃣ O Utilizador

```
1. Acede a http://localhost:5000
2. Vê tela de LOGIN
3. Se não tem conta → REGISTA
4. Se tem conta → FAZ LOGIN
5. Vê tabela com dinheiro
6. Pode ADICIONAR ou APAGAR transações
7. Clica SAIR para terminar
```

### 2️⃣ O Computador (Backend)

**Guarda 2 tipos de ficheiros JSON:**

- **utilizadores.json** → Quem pode entrar (username + password)
- **transacoes.json** → Movimentações (entrada/saída de dinheiro)

**Quando o utilizador faz algo:**

```
Utilizador preenche formulário
        ↓
Frontend envia dados (JavaScript)
        ↓
Backend recebe (Program.cs)
        ↓
Backend guarda em JSON (Persistencia.cs)
        ↓
Backend devolve resposta
        ↓
Frontend mostra resultado
```

---

## 6 Operações Principais

### 1. REGISTAR
```
Utilizador preenche: Username + Password + Confirmação
Backend verifica: "Já existe alguém com este username?"
Se SIM → Erro
Se NÃO → Guarda em JSON ✅
```

### 2. LOGIN
```
Utilizador preenche: Username + Password
Backend procura no JSON: "Encontro?"
Se SIM → Deixa entrar ✅
Se NÃO → Erro
```

### 3. VER TRANSAÇÕES
```
Backend devolve lista com:
- Descrição (ex: Salário, Supermercado)
- Valor (€)
- Data
- Tipo (Receita ou Despesa)
- Categoria (Alimentação, Transporte, etc)
```

### 4. ADICIONAR TRANSAÇÃO
```
Utilizador preenche formulário
Backend adiciona à lista
Backend guarda em JSON
Frontend mostra na tabela
```

### 5. APAGAR TRANSAÇÃO
```
Utilizador clica "Eliminar"
Backend remove da lista
Backend guarda em JSON
Frontend atualiza tabela
```

### 6. VER TOTAIS
```
Frontend calcula automaticamente:
- Total Receitas (dinheiro que entra)
- Total Despesas (dinheiro que sai)
- SALDO (receitas - despesas)
```

---

## Ficheiros Importantes

```
Frontend (O que o utilizador vê):
├─ index.html      → Página (formulários, tabela)
├─ script.js       → Inteligência (faz requisições, mostra dados)
└─ styles.css      → Cores e aparência

Backend (O que processa):
└─ Program.cs      → 6 rotas HTTP (GET, POST, DELETE)

Dados (Modelos):
├─ Utilizador.cs   → { username, password, perfil }
├─ Transacao.cs    → { nome, valor, data, tipo, categoria }
└─ Persistencia.cs → Ler/escrever ficheiros JSON

Armazenamento:
└─ wwwroot/data/   → utilizadores.json, transacoes.json
```

---

## Como Dados Viajam

### Exemplo: ADICIONAR TRANSAÇÃO

```
┌──────────────────────────────────────────┐
│ UTILIZADOR preenche formulário           │
│ • Descrição: "Supermercado"              │
│ • Valor: 50€                             │
│ • Tipo: Despesa                          │
└───────────────┬──────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────┐
│ JAVASCRIPT (script.js)                   │
│ • Captura dados do formulário            │
│ • Envia para Backend (POST /transacoes)  │
└───────────────┬──────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────┐
│ BACKEND (Program.cs)                     │
│ • Recebe dados                           │
│ • Adiciona à lista em memória            │
│ • Grava em JSON (wwwroot/data/)          │
│ • Devolve resposta: "OK"                 │
└───────────────┬──────────────────────────┘
                │
                ↓
┌──────────────────────────────────────────┐
│ JAVASCRIPT (script.js)                   │
│ • Recebe "OK"                            │
│ • Limpa formulário                       │
│ • Carrega lista de novo                  │
│ • Mostra transação na tabela             │
└──────────────────────────────────────────┘
```

---

## Dados Guardados

### Ficheiro: utilizadores.json
```json
[
  {
    "id": 1,
    "username": "joao",
    "password": "senha123",
    "perfil": "comum"
  }
]
```

## Resumo: O Ciclo

```
1. Utilizador interage → Frontend
2. Frontend envia → Backend (fetch)
3. Backend processa → Guardar em JSON
4. Backend responde → Frontend
5. Frontend mostra → Utilizador vê resultado
6. Volta ao passo 1
```

