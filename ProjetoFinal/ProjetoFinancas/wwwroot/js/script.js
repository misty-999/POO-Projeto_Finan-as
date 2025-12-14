// Variáveis globais
var transacoes = [];
var categorias = [];
var utilizadores = [];
var usuarioLogado = false;
var usuarioAtual = null;
var editingNumber = null;
var editingCategoriaId = null;
var chart = null;
var STORAGE_USER_KEY = 'usuarioAtual';

// ===== FUNÇÕES DE AUTENTICAÇÃO =====

function isAdmin() {
    if (!usuarioAtual) return false;
    var tipo = usuarioAtual.userType || usuarioAtual.UserType;
    return (tipo || '').toLowerCase() === 'admin';
}

function alternarSecaoAdmin() {
    // Gerir Users
    var secao = document.getElementById('admin-utilizadores');
    if (!secao) return;
    secao.style.display = isAdmin() ? 'block' : 'none';
}

function mostrar_login() {
    // Exibe modal de login e esconde o de registo
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('registar-modal').style.display = 'none';
}

function mostrar_registar() {
    // Exibe modal de registo e esconde o de login
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('registar-modal').style.display = 'flex';
}

function fazer_login(evento) {
    evento.preventDefault();
    
    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;
    var credenciais = { username: username, password: password };
    
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credenciais)
    })
    .then(function(resposta) {
        if (resposta.ok) return resposta.json();
        throw new Error('Utilizador ou password incorretos!');
    })
    .then(function(dados) {
        usuarioLogado = true;
        usuarioAtual = dados;
        document.getElementById('user-name').textContent = usuarioAtual.username;
        document.getElementById('user-info').style.display = 'inline-flex';
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('registar-modal').style.display = 'none';
        document.getElementById('conteudo-principal').style.display = 'block';
        document.getElementById('login-form').reset();
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(usuarioAtual));
        alternarSecaoAdmin();
        carregarCategorias().then(() => {
            if (isAdmin()) {
                return carregarUtilizadores();
            }
        }).then(carregar);
    })
    .catch(function(erro) {
        alert('Erro: ' + erro.message);
    });
}

function fazer_logout() {
    // Limpa estado de autenticação e volta ao modal de login
    usuarioLogado = false;
    usuarioAtual = null;
    transacoes = [];
    categorias = [];
    mostrarCategorias();
    utilizadores = [];
    mostrarUtilizadores();
    atualizarSelectCategorias();
    document.getElementById('tabelaTransacoes').innerHTML = '';
    document.getElementById('conteudo-principal').style.display = 'none';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('user-name').textContent = '';
    document.getElementById('login-modal').style.display = 'flex';
    localStorage.removeItem(STORAGE_USER_KEY);
}

function fazer_registar(evento) {
    evento.preventDefault();
    
    // Valida dados do formulário antes de enviar
    var username = document.getElementById('username-registar').value;
    var password = document.getElementById('password-registar').value;
    var confirmacao = document.getElementById('password-confirmacao').value;
    
    if (password !== confirmacao) {
        alert('As passwords não correspondem!');
        return;
    }
    
    var utilizador = { username: username, password: password, userType: 'comum' };
    fetch('/registar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(utilizador)
    })
    .then(function(resposta) {
        if (resposta.ok) {
            alert('Registo realizado com sucesso! Faz login agora.');
            document.getElementById('registar-form').reset();
            mostrar_login();
        } else {
            return resposta.text().then(function(texto) {
                alert('Erro: ' + texto);
            });
        }
    })
    .catch(function(erro) {
        alert('Erro ao registar: ' + erro);
    });
}

// ===== FUNÇÕES DE CATEGORIAS =====

function carregarCategorias() {
    return fetch('/categorias')
        .then(resposta => resposta.json())
        .then(dados => {
            categorias = dados;
            atualizarSelectCategorias();
            mostrarCategorias();
        })
        .catch(erro => {
            console.log('Erro ao carregar categorias:', erro);
        });
}

function atualizarSelectCategorias() {
    var select = document.getElementById('categoria');
    if (!select) return;

    var valorAtual = select.value;
    select.innerHTML = '<option value="">-- Categoria --</option>';

    categorias.forEach(function(cat) {
        var nome = cat.nome || cat.Nome;
        if (!nome) return;
        var option = document.createElement('option');
        option.value = nome;
        option.textContent = nome;
        select.appendChild(option);
    });

    if (valorAtual && categorias.some(c => (c.nome || c.Nome) === valorAtual)) {
        select.value = valorAtual;
    }
}

function guardarCategoria(evento) {
    evento.preventDefault();

    var nome = document.getElementById('nome-categoria').value.trim();
    var descricao = document.getElementById('descricao-categoria').value.trim();

    if (!nome) {
        alert('O nome da categoria é obrigatório.');
        return;
    }

    var payload = { nome: nome, descricao: descricao };
    var url = '/categorias';
    var metodo = 'POST';

    if (editingCategoriaId !== null) {
        url += '/' + editingCategoriaId;
        metodo = 'PUT';
    }

    fetch(url, {
        method: metodo,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    .then(function(resposta) {
        if (resposta.ok) {
            cancelarEdicaoCategoria();
            return carregarCategorias();
        }
        return resposta.text().then(function(texto) {
            throw new Error(texto || 'Erro ao guardar categoria');
        });
    })
    .catch(function(erro) {
        alert('Erro: ' + erro.message);
    });
}

function mostrarCategorias() {
        var tabela = document.getElementById('tabelaCategorias');
        if (!tabela) return;

        tabela.innerHTML = '';

        if (categorias.length === 0) {
            tabela.innerHTML = '<tr><td colspan="3">Nenhuma categoria registada.</td></tr>';
            return;
        }

        categorias.forEach(function (cat) {
            var nome = cat.nome || cat.Nome || '';
            var descricao = cat.descricao || cat.Descricao || '';

            var html = '<tr>';
            html += '<td>' + nome + '</td>';
            html += '<td>' + (descricao || '-') + '</td>';
            html += '<td><button class="edit-btn" onclick="iniciarEdicaoCategoria(' + (cat.id || cat.Id) + ')">Editar</button></td>';
            html += '</tr>';
            tabela.innerHTML = tabela.innerHTML + html;
        });
}

function iniciarEdicaoCategoria(id) {
        var cat = categorias.find(function (c) {
            return c.id === id || c.Id === id;
        });
        if (!cat) {
            alert('Categoria não encontrada');
            return;
        }

        document.getElementById('nome-categoria').value = cat.nome || cat.Nome || '';
        document.getElementById('descricao-categoria').value = cat.descricao || cat.Descricao || '';

        editingCategoriaId = cat.id || cat.Id;
        document.getElementById('categoria-submit-btn').textContent = 'Guardar alterações';
        document.getElementById('cancelar-edicao-categoria').style.display = 'inline-block';
        window.scrollTo({top: 0, behavior: 'smooth'});
}

function cancelarEdicaoCategoria() {
    editingCategoriaId = null;
    var form = document.getElementById('categoria-form');
    if (form) form.reset();
    var btn = document.getElementById('categoria-submit-btn');
    if (btn) btn.textContent = 'Adicionar categoria';
    var cancelBtn = document.getElementById('cancelar-edicao-categoria');
    if (cancelBtn) cancelBtn.style.display = 'none';
}

// ===== FUNÇÕES DE ADMINISTRAÇÃO DE UTILIZADORES =====

function carregarUtilizadores() {
    if (!isAdmin()) return Promise.resolve();

    return fetch('/utilizadores?adminId=' + usuarioAtual.id)
        .then(resposta => {
            if (resposta.ok) return resposta.json();
            throw new Error('Não autorizado');
        })
        .then(dados => {
            utilizadores = dados;
            mostrarUtilizadores();
        })
        .catch(erro => console.log('Erro ao carregar utilizadores:', erro));
}

function mostrarUtilizadores() {
    var tabela = document.getElementById('tabelaUtilizadores');
    if (!tabela) return;

    tabela.innerHTML = '';

    if (!isAdmin()) {
        tabela.innerHTML = '<tr><td colspan="4">Apenas administradores podem ver utilizadores.</td></tr>';
        return;
    }

    if (utilizadores.length === 0) {
        tabela.innerHTML = '<tr><td colspan="4">Sem utilizadores.</td></tr>';
        return;
    }

    utilizadores.forEach(function(u) {
        var id = u.id || u.Id;
        var username = u.username || u.Username;
        var perfil = u.userType || u.UserType || 'comum';
        var isAdminRow = perfil.toLowerCase() === 'admin';

        var html = '<tr>';
        html += '<td>' + id + '</td>';
        html += '<td>' + username + '</td>';
        html += '<td>' + perfil + '</td>';
        html += '<td>';
        if (!isAdminRow) {
            html += '<button class="delete-btn" onclick="deletarUtilizador(' + id + ')">Eliminar</button>';
        } else {
            html += '-';
        }
        html += '</td>';
        html += '</tr>';

        tabela.innerHTML = tabela.innerHTML + html;
    });
}

function deletarUtilizador(id) {
    if (!isAdmin()) {
        alert('Apenas administradores podem eliminar utilizadores.');
        return;
    }

    if (id === usuarioAtual.id) {
        alert('Não pode eliminar o seu próprio utilizador.');
        return;
    }

    if (!confirm('Eliminar utilizador #' + id + ' e respetivas transações?')) return;

    fetch('/utilizadores/' + id + '?adminId=' + usuarioAtual.id, { method: 'DELETE' })
        .then(resposta => {
            if (resposta.ok) {
                return carregarUtilizadores().then(carregar);
            }
            return resposta.text().then(texto => { throw new Error(texto || 'Falha ao eliminar'); });
        })
        .catch(erro => alert('Erro: ' + erro.message));
}

// ===== FUNÇÕES DE TRANSAÇÕES =====

function carregar() {
    if (!usuarioAtual) return;

    fetch('/transacoes?userId=' + usuarioAtual.id)
        .then(resposta => resposta.json())
        .then(dados => {
            transacoes = dados;
            mostrar();
        })
        .catch(erro => console.log('Erro ao carregar:', erro));
}

function adicionar(evento) {
    evento.preventDefault();

    var descricao = document.getElementById('descricao').value;
    var valor = document.getElementById('valor').value;
    var data = document.getElementById('data').value;
    var tipo = document.getElementById('tipo').value;
    var categoriaSelecionada = document.getElementById('categoria').value;

    var transacao = {
        name: descricao,
        date: data,
        type: tipo,
        category: categoriaSelecionada,
        amount: parseFloat(valor),
        userId: usuarioAtual.id
    };
    
    if (isNaN(transacao.amount) || transacao.amount <= 0) {
        alert('O valor deve ser um número positivo maior que 0.');
        return;
    }
    
    if (editingNumber !== null) {
        fetch('/transacoes/' + editingNumber, { 
            method: 'PUT', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(transacao) 
        })
        .then(function(resposta) { 
            var form = document.getElementById('transaction-form');
            if (form) form.reset();
            cancelarEdicao(); 
            carregar(); 
        })
        .catch(function(erro) { console.log('Erro ao editar:', erro); });
    } else {
        fetch('/transacoes', { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' }, 
            body: JSON.stringify(transacao) 
        })
        .then(function(resposta) { 
            var form = document.getElementById('transaction-form');
            if (form) form.reset();
            carregar(); 
        })
        .catch(function(erro) { console.log('Erro ao adicionar:', erro); });
    }
}

function mostrar() {
    var tabela = document.getElementById('tabelaTransacoes');
    tabela.innerHTML = '';

    for (var i = 0; i < transacoes.length; i++) {
        var t = transacoes[i];
        var d = new Date(t.date).toLocaleDateString('pt-PT', { timeZone: 'UTC' });
        var v = parseFloat(t.amount).toFixed(2);
        var icon = (t.type === 'Receita') ? 'R' : 'D';

        var html = '<tr>';
        html += '<td>' + t.name + '</td>';
        html += '<td><strong>' + v + ' €</strong></td>';
        html += '<td>' + d + '</td>';
        html += '<td>' + icon + ' ' + t.type + '</td>';
        html += '<td>' + t.category + '</td>';
        html += '<td>';
        html += '<button class="edit-btn" onclick="iniciarEdicao(' + t.number + ')">Editar</button> ';
        html += '<button class="delete-btn" onclick="deletar(' + t.number + ')">Eliminar</button>';
        html += '</td>';
        html += '</tr>';

        tabela.innerHTML = tabela.innerHTML + html;
    }

    calcular();
}

function deletar(numero) {
    if (confirm('Tem a certeza que deseja eliminar esta transação?')) {
        fetch('/transacoes/' + numero, { method: 'DELETE' })
            .then(function (resposta) { carregar(); });
    }
}

function iniciarEdicao(numero) {
    var t = transacoes.find(function(x) { return x.number === numero; });
    if (!t) { alert('Transação não encontrada'); return; }

    document.getElementById('descricao').value = t.name;
    document.getElementById('valor').value = t.amount;
    try {
        var iso = new Date(t.date).toISOString().slice(0,10);
        document.getElementById('data').value = iso;
    } catch (e) {
        document.getElementById('data').value = '';
    }
    document.getElementById('tipo').value = t.type;
    document.getElementById('categoria').value = t.category;

    editingNumber = numero;
    document.getElementById('submit-btn').textContent = 'Salvar';
    document.getElementById('cancelar-edicao').style.display = 'inline-block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicao() {
    editingNumber = null;
    var form = document.getElementById('transaction-form');
    if (form) form.reset();
    var btn = document.getElementById('submit-btn');
    if (btn) btn.textContent = 'Adicionar';
    var cancelBtn = document.getElementById('cancelar-edicao');
    if (cancelBtn) cancelBtn.style.display = 'none';
}

function calcular() {
    var receitas = 0;
    var despesas = 0;

    for (var i = 0; i < transacoes.length; i++) {
        var t = transacoes[i];
        var valor = parseFloat(t.amount);
        if (isNaN(valor)) continue;
        if (t.type === 'Receita') {
            receitas = receitas + valor;
        } else {
            despesas = despesas + valor;
        }
    }

    var saldo = Math.max(receitas - despesas, 0);

    document.getElementById('totalReceitas').textContent = receitas.toFixed(2);
    document.getElementById('totalDespesas').textContent = despesas.toFixed(2);
    document.getElementById('saldo').textContent = saldo.toFixed(2);
    
    atualizarGrafico(receitas, despesas, saldo);
}

function atualizarGrafico(receitas, despesas, saldo) {
    var ctx = document.getElementById('relatorioChart');
    
    if (ctx) {
        if (chart) {
            chart.destroy();
        }
        
        chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Receitas', 'Despesas', 'Saldo'],
                datasets: [{
                    label: 'Valores (€)',
                    data: [receitas, despesas, saldo],
                    backgroundColor: [
                        'rgba(76, 175, 80, 0.8)',
                        'rgba(244, 67, 54, 0.8)',
                        'rgba(102, 126, 234, 0.8)'
                    ],
                    borderColor: [
                        'rgba(76, 175, 80, 1)',
                        'rgba(244, 67, 54, 1)',
                        'rgba(102, 126, 234, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toFixed(2) + ' €';
                            }
                        }
                    }
                }
            }
        });
    }
}

// ===== INICIALIZAÇÃO =====

window.onload = function() {
    try {
        var guardado = localStorage.getItem(STORAGE_USER_KEY);
        if (guardado) {
            usuarioAtual = JSON.parse(guardado);
            usuarioLogado = true;
            document.getElementById('user-name').textContent = usuarioAtual.username || '';
            document.getElementById('user-info').style.display = 'inline-flex';
            document.getElementById('login-modal').style.display = 'none';
            document.getElementById('registar-modal').style.display = 'none';
            document.getElementById('conteudo-principal').style.display = 'block';
            alternarSecaoAdmin();
            carregarCategorias().then(function() {
                if (isAdmin()) {
                    return carregarUtilizadores();
                }
            }).then(carregar);
            return;
        }
    } catch (e) {
        console.log('Falha ao recuperar sessao guardada:', e);
    }

    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('registar-modal').style.display = 'none';
    document.getElementById('conteudo-principal').style.display = 'none';
};
