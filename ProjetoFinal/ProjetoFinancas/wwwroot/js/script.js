// Frontend - Lógica interativa (JavaScript)
var transacoes = [];
var usuarioLogado = false;
var usuarioAtual = null;

function mostrar_login() {
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('registar-modal').style.display = 'none';
}

function mostrar_registar() {
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('registar-modal').style.display = 'flex';
}

function fazer_login(evento) {
    evento.preventDefault();
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    if (!username || !password) {
        alert('❌ Erro: Preencha utilizador e password.');
        return;
    }

    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(r => {
        if (r.ok) return r.json();
        if (r.status === 401) return Promise.reject('Utilizador ou password inválidos');
        return r.text().then(t => Promise.reject(t));
    })
    .then(dados => {
        usuarioLogado = true;
        usuarioAtual = dados;
        document.getElementById('user-name').textContent = dados.username;
        document.getElementById('user-info').style.display = 'inline-block';
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('registar-modal').style.display = 'none';
        document.getElementById('conteudo-principal').style.display = 'block';
        document.getElementById('login-form').reset();
        carregar();
    })
    .catch(e => alert('❌ Erro: ' + e));
}

function fazer_logout() {
    usuarioLogado = false;
    usuarioAtual = null;
    document.getElementById('conteudo-principal').style.display = 'none';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('user-name').textContent = '';
    document.getElementById('login-modal').style.display = 'flex';
}

function fazer_registar(evento) {
    evento.preventDefault();
    var username = document.getElementById('username-registar').value;
    var password = document.getElementById('password-registar').value;
    var confirmacao = document.getElementById('password-confirmacao').value;
    
    if (password !== confirmacao) {
        alert('As passwords não correspondem!');
        return;
    }
    
    fetch('/registar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, perfil: 'comum' })
    })
    .then(r => r.ok ? r.json() : r.text().then(t => Promise.reject(t)))
    .then(() => {
        alert('Registo realizado! Faz login agora.');
        document.getElementById('registar-form').reset();
        mostrar_login();
    })
    .catch(e => alert('Erro: ' + e));
}

function carregar() {
    fetch('/transacoes')
        .then(r => r.json())
        .then(dados => { transacoes = dados; mostrar(); })
        .catch(e => console.log('Erro:', e));
}

function adicionar(evento) {
    evento.preventDefault();
    
    var descricao = document.getElementById('descricao').value;
    var valor = document.getElementById('valor').value;
    var data = document.getElementById('data').value;
    var tipo = document.getElementById('tipo').value;
    var categoria = document.getElementById('categoria').value;

    var valorNum = parseFloat(valor);
    
    // Validar valor negativo
    if (valorNum < 0) {
        alert('❌ Erro: Número negativo! O valor não pode ser negativo.');
        return;
    }

    // Validar valor zero
    if (valorNum === 0 || isNaN(valorNum)) {
        alert('❌ Erro: O valor deve ser maior que zero.');
        return;
    }
    
    fetch('/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: descricao, amount: valorNum, date: data, type: tipo, category: categoria })
    })
    .then(r => r.ok ? r.json() : r.text().then(t => Promise.reject(t)))
    .then(() => {
        alert('✅ Transação adicionada com sucesso!');
        document.getElementById('transaction-form').reset();
        carregar();
    })
    .catch(e => alert('❌ Erro: ' + e));
}

function mostrar() {
    var tabela = document.getElementById('tabelaTransacoes');
    tabela.innerHTML = '';
    
        transacoes.forEach(t => {
        var d = new Date(t.date).toLocaleDateString('pt-PT', { timeZone: 'UTC' });
        var v = t.amount.toFixed(2);
        tabela.innerHTML += '<tr><td>' + t.name + '</td><td>' + v + ' €</td><td>' + d + '</td><td>' + t.type + '</td><td>' + t.category + '</td><td class="actions"><button class="edit" onclick="abrirEdicao(' + t.number + ')">Editar</button> <button class="delete" onclick="deletar(' + t.number + ')">Eliminar</button></td></tr>';
    });
    
    calcular();
}

function deletar(numero) {
    if (confirm('Tem a certeza?')) {
        fetch('/transacoes/' + numero, { method: 'DELETE' })
            .then(() => carregar());
    }
}

function calcular() {
    var receitas = 0, despesas = 0;
    transacoes.forEach(t => {
        if (t.type === 'Receita') receitas += t.amount;
        else despesas += t.amount;
    });
    
    document.getElementById('totalReceitas').textContent = receitas.toFixed(2);
    document.getElementById('totalDespesas').textContent = despesas.toFixed(2);
    document.getElementById('saldo').textContent = (receitas - despesas).toFixed(2);
}

function filtrarPeriodo() {
    var dataInicio = document.getElementById('dataInicio').value;
    var dataFim = document.getElementById('dataFim').value;
    
    if (!dataInicio || !dataFim) {
        alert('Selecione ambas as datas');
        return;
    }
    
    var inicio = new Date(dataInicio);
    var fim = new Date(dataFim);
    
    var receitas = 0, despesas = 0;
    transacoes.forEach(t => {
        var dataTrans = new Date(t.date);
        if (dataTrans >= inicio && dataTrans <= fim) {
            if (t.type === 'Receita') receitas += t.amount;
            else despesas += t.amount;
        }
    });
    
    document.getElementById('receitasPeriodo').textContent = receitas.toFixed(2);
    document.getElementById('despesasPeriodo').textContent = despesas.toFixed(2);
    document.getElementById('saldoPeriodo').textContent = (receitas - despesas).toFixed(2);
}

function filtrarCategoria() {
    var categoria = document.getElementById('selectCategoria').value;
    var tabela = document.getElementById('tabelaCategorias');
    var tbody = document.getElementById('tabelaCategorias').getElementsByTagName('tbody')[0];
    
    tbody.innerHTML = '';
    
    if (categoria === '') {
        tabela.style.display = 'none';
        return;
    }
    
    var transacoesFiltradas = transacoes.filter(t => t.category === categoria);
    
    if (transacoesFiltradas.length === 0) {
        tabela.style.display = 'none';
        return;
    }
    
    transacoesFiltradas.forEach(t => {
        var d = new Date(t.date).toLocaleDateString('pt-PT', { timeZone: 'UTC' });
        var v = t.amount.toFixed(2);
        tbody.innerHTML += '<tr><td>' + t.name + '</td><td>' + v + ' €</td><td>' + d + '</td><td>' + t.type + '</td></tr>';
    });
    
    tabela.style.display = 'table';
}

window.onload = function() {
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('registar-modal').style.display = 'none';
    document.getElementById('conteudo-principal').style.display = 'none';
};
function abrirEdicao(numero) {
    var t = transacoes.find(x => x.number === numero);
    if (!t) {
        alert("Erro: transação não encontrada!");
        return;
    }

    // Preencher modal
    document.getElementById('edit-id').value = t.number;
    document.getElementById('edit-descricao').value = t.name;
    document.getElementById('edit-valor').value = t.amount;
    document.getElementById('edit-data').value = t.date.split("T")[0];
    document.getElementById('edit-tipo').value = t.type;
    document.getElementById('edit-categoria').value = t.category;

    // Mostrar modal
    document.getElementById('edit-modal').style.display = 'flex';
}
function guardarEdicao(evento) {
    evento.preventDefault();

    var numero = document.getElementById('edit-id').value;
    var descricao = document.getElementById('edit-descricao').value;
    var valor = parseFloat(document.getElementById('edit-valor').value);
    var data = document.getElementById('edit-data').value;
    var tipo = document.getElementById('edit-tipo').value;
    var categoria = document.getElementById('edit-categoria').value;

    if (valor <= 0 || isNaN(valor)) {
        alert("❌ Erro: O valor deve ser maior que zero.");
        return;
    }

    fetch(`/transacoes/${numero}`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: descricao,
            amount: valor,
            date: data,
            type: tipo,
            category: categoria
        })
    })
    .then(r => r.ok ? r.json() : r.text().then(t => Promise.reject(t)))
    .then(() => {
        alert("✅ Transação atualizada com sucesso!");
        fecharEdicao();
        carregar();
    })
    .catch(e => alert("Erro: " + e));
}
function fecharEdicao() {
    document.getElementById('edit-modal').style.display = 'none';
}


