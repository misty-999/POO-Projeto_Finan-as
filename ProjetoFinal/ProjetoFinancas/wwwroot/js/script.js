// Variáveis globais
var transacoes = [];
var usuarioLogado = false;
var usuarioAtual = null;
var editingNumber = null;
var chart = null;

// ===== FUNÇÕES DE AUTENTICAÇÃO =====

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
    
    // Lê credenciais e tenta autenticar no backend
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
        carregar();
    })
    .catch(function(erro) {
        alert('Erro: ' + erro.message);
    });
}

function fazer_logout() {
    // Limpa estado de autenticação e volta ao modal de login
    usuarioLogado = false;
    usuarioAtual = null;
    document.getElementById('conteudo-principal').style.display = 'none';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('user-name').textContent = '';
    document.getElementById('login-modal').style.display = 'flex';
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
    
    var utilizador = { username: username, password: password, perfil: 'comum' };
    fetch('/registar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(utilizador)
    })
    .then(function(resposta) {
        if (resposta.ok) {
            alert('✅ Registo realizado com sucesso! Faz login agora.');
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

// ===== FUNÇÕES DE TRANSAÇÕES =====

function carregar() {
    // Obtém transações do servidor e repovoa a UI
    fetch('/transacoes')
        .then(function(resposta) { return resposta.json(); })
        .then(function(dados) { transacoes = dados; mostrar(); })
        .catch(function(erro) { console.log('Erro ao carregar:', erro); });
}

function adicionar(evento) {
    evento.preventDefault();

    var descricao = document.getElementById('descricao').value;
    var valor = document.getElementById('valor').value;
    var data = document.getElementById('data').value;
    var tipo = document.getElementById('tipo').value;
    var categoria = document.getElementById('categoria').value;

    var transacao = {
        name: descricao,
        date: data,
        type: tipo,
        category: categoria,
        amount: parseFloat(valor)
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
            document.querySelector('form').reset(); 
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
            document.querySelector('form').reset(); 
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
        var v = t.amount.toFixed(2);
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
        if (t.type === 'Receita') {
            receitas = receitas + t.amount;
        } else {
            despesas = despesas + t.amount;
        }
    }

    var saldo = Math.max(receitas - despesas, 0);

    document.getElementById('totalReceitas').textContent = receitas.toFixed(2);
    document.getElementById('totalDespesas').textContent = despesas.toFixed(2);
    document.getElementById('saldo').textContent = saldo.toFixed(2);
    
    // Atualizar gráfico
    atualizarGrafico(receitas, despesas, saldo);
}

function atualizarGrafico(receitas, despesas, saldo) {
    var ctx = document.getElementById('relatorioChart');
    
    if (ctx) {
        // Destruir gráfico anterior se existir
        if (chart) {
            chart.destroy();
        }
        
        // Criar novo gráfico
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
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('registar-modal').style.display = 'none';
    document.getElementById('conteudo-principal').style.display = 'none';
};

