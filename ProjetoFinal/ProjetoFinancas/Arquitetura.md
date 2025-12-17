# Arquitetura - Gestão de Finanças

**Stack:** ASP.NET Core (Backend) + HTML/CSS/JS (Frontend) + JSON (Persistência)

---

## 🔄 Fluxo Geral

**Autenticação:** Utilizador → Frontend valida → POST /registar ou /login → Backend valida → Persiste JSON

**Transações:** Utilizador preenche form → Frontend valida (valor > 0) → POST/PUT/DELETE /transacoes → Backend valida (categoria, tipo) → Persiste JSON → Frontend recarrega tabela

---


## 🎯 Componentes Principais

### Program.cs (Backend)

**8 Endpoints HTTP:**
1. `GET /` → Servir index.html
2. `POST /registar` → Registar utilizador
3. `POST /login` → Autenticar
4. `GET /transacoes` → Listar transações
5. `GET /categorias` → Listar categorias válidas
6. `POST /transacoes` → Criar transação (valida: Amount > 0, categoria whitelist, tipo válido)
7. `PUT /transacoes/{number}` → Editar transação (mesmas validações)
8. `DELETE /transacoes/{number}` → Apagar transação

**Validações:** Categoria contra whitelist (Alimentação, Transporte, Moradia, Lazer, Saúde), tipo (Receita/Despesa), valor > 0

---

### Modelos de Dados

**Transacao.cs:** `Number`, `Name`, `Date`, `Type`, `Category`, `Amount`

**Utilizador.cs:** `Id`, `Username`, `Password`, `Perfil`

**Persistencia.cs:** Ler/escrever JSON (wwwroot/data/) - métodos `Guardar*/Carregar*` com try-catch

---

### Frontend

**script.js:** 
- Autenticação: `fazer_login()`, `fazer_registar()`, `fazer_logout()`
- CRUD: `carregar()`, `adicionar()`, `mostrar()`, `deletar()`, `iniciarEdicao()`, `cancelarEdicao()`
- Cálculos: `calcular()`, `atualizarGrafico()`

**index.html:**
- Modais: login e registo
- Formulário: 6 campos (descrição, valor, data, tipo, categoria, botões)
- Tabela dinâmica com Editar/Eliminar
- Relatório: 3 cards (Receitas, Despesas, Saldo)
- Gráfico Chart.js

---

## 💾 JSON

**utilizadores.json:** `[{ id, username, password, perfil }, ...]`

**transacoes.json:** `[{ number, name, amount, date, type, category }, ...]`

**Localização:** `wwwroot/data/`

---

## ✅ Requisitos Implementados

- Autenticação (Registo + Login + Logout)
- CRUD Transações (Create, Read, Update, Delete)
- Validação (Valor > 0, categoria whitelist, tipo válido)
- Persistência em JSON
- Relatórios (Receitas, Despesas, Saldo)
- Visualização (Gráfico Chart.js)
- Interface responsiva

---

## 🔐 Segurança

**Frontend:** Valida campos, valor > 0

**Backend:** Valida TODOS dados novamente, categoria whitelist, tipo válido

**JSON:** Desserialização com validação
