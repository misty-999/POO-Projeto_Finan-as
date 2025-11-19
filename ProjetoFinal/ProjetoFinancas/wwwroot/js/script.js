// script.js: lógica do frontend (muito simples)
// - controla modais de login/registo
// - chama endpoints: /login, /registar, /transacoes
// Nota: o estado de autenticação é mantido apenas em memória (não persiste entre reloads)
var transacoes = [];
var usuarioLogado = false;
var usuarioAtual = null;

// Mostrar o modal de login
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
<<<<<<< HEAD
    
    var nome = document.getElementById('nome-login').value;
    var senha = document.getElementById('senha').value;

    var credenciais = {
        nome: nome,
        senha: senha
    };
    
    // Envia credenciais para o backend; espera 200 ou 401
=======

    var username = document.getElementById('username').value;
    var password = document.getElementById('password').value;

    var credenciais = {
        username: username,
        password: password
    };

>>>>>>> b03fe84803dee48e8f3cb3661cee22b6b6aa4e49
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credenciais)
    })
<<<<<<< HEAD
    .then(function(resposta) {
        if (resposta.ok) {
            return resposta.json();
        } else {
            throw new Error('Nome ou senha incorretos!');
        }
    })
    .then(function(dados) {
        usuarioLogado = true;
        usuarioAtual = dados;
        // Mostrar nome no header e botão sair; carregar transações após login
        document.getElementById('user-name').textContent = dados.nome;
        document.getElementById('user-info').style.display = 'inline-block';
        document.getElementById('login-modal').style.display = 'none';
        document.getElementById('registar-modal').style.display = 'none';
        document.getElementById('conteudo-principal').style.display = 'block';
        document.getElementById('login-form').reset();
        carregar();
    })
    .catch(function(erro) {
        alert('Erro: ' + erro.message);
    });
=======
        .then(function (resposta) {
            if (resposta.ok) {
                return resposta.json();
            } else {
                throw new Error('Utilizador ou password incorretos!');
            }
        })
        .then(function (dados) {
            usuarioLogado = true;
            document.getElementById('login-modal').style.display = 'none';
            document.getElementById('conteudo-principal').style.display = 'block';
            document.getElementById('login-form').reset();
            carregar();
        })
        .catch(function (erro) {
            alert('Erro: ' + erro.message);
        });
>>>>>>> b03fe84803dee48e8f3cb3661cee22b6b6aa4e49
}

function fazer_logout() {
    usuarioLogado = false;
    usuarioAtual = null;
    // esconder conteúdo e mostrar login
    document.getElementById('conteudo-principal').style.display = 'none';
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('user-name').textContent = '';
    document.getElementById('login-modal').style.display = 'flex';
}

function fazer_registar(evento) {
    evento.preventDefault();
<<<<<<< HEAD
    
    var nome = document.getElementById('nome').value;
    var senha = document.getElementById('senha-registar').value;
    var confirmacao = document.getElementById('senha-confirmacao').value;
    
    if (senha !== confirmacao) {
        alert('As senhas não correspondem!');
        return;
    }
    
    // Envia novo utilizador para o backend; backend valida unicidade do Nome
    var utilizador = { nome: nome, senha: senha, perfil: 'comum' };
=======

    var username = document.getElementById('username-registar').value;
    // var email = document.getElementById('email-registar').value;
    var password = document.getElementById('password-registar').value;
    var confirmacao = document.getElementById('password-confirmacao').value;

    if (password !== confirmacao) {
        alert('As passwords não correspondem!');
        return;
    }

    var utilizador = {
        username: username,
        password: password,
        perfil: 'comum'
    };

>>>>>>> b03fe84803dee48e8f3cb3661cee22b6b6aa4e49
    fetch('/registar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(utilizador)
    })
        .then(function (resposta) {
            if (resposta.ok) {
                alert('Registo realizado com sucesso! Faz login agora.');
                document.getElementById('registar-form').reset();
                mostrar_login();
            } else {
                return resposta.text().then(function (texto) {
                    alert('Erro: ' + texto);
                });
            }
        })
        .catch(function (erro) {
            alert('Erro ao registar: ' + erro);
        });
}

function carregar() {
    // Busca todas as transações (o servidor devolve a lista em memória)
    fetch('/transacoes')
<<<<<<< HEAD
        .then(function(resposta) { return resposta.json(); })
        .then(function(dados) { transacoes = dados; mostrar(); })
        .catch(function(erro) { console.log('Erro ao carregar:', erro); });
=======
        .then(function (resposta) {
            console.log('Status:', resposta.status);
            return resposta.json();
        })
        .then(function (dados) {
            console.log('Dados recebidos:', dados);
            transacoes = dados;
            mostrar();
        })
        .catch(function (erro) {
            console.log('Erro ao carregar:', erro);
        });
>>>>>>> b03fe84803dee48e8f3cb3661cee22b6b6aa4e49
}

function adicionar(evento) {
    evento.preventDefault();
    console.log('Função adicionar chamada!');

    var descricao = document.getElementById('descricao').value;
    var valor = document.getElementById('valor').value;
    var data = document.getElementById('data').value;
    var tipo = document.getElementById('tipo').value;
    var categoria = document.getElementById('categoria').value;

    console.log('Descrição:', descricao, 'Valor:', valor, 'Data:', data, 'Tipo:', tipo, 'Categoria:', categoria);

    var transacao = {
        name: descricao,
        date: data,
        type: tipo,
        category: categoria,
        amount: parseFloat(valor)
    };
<<<<<<< HEAD
    
    // Envia a transação para o servidor que a grava em transacoes.json
    fetch('/transacoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(transacao) })
        .then(function(resposta) { document.getElementById('form-transacao').reset(); carregar(); })
        .catch(function(erro) { console.log('Erro ao adicionar:', erro); });
=======

    fetch('/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transacao)
    })
        .then(function (resposta) {
            console.log('Resposta recebida:', resposta);
            document.querySelector('form').reset();
            carregar();
        })
        .catch(function (erro) {
            console.log('Erro ao adicionar:', erro);
        });
>>>>>>> b03fe84803dee48e8f3cb3661cee22b6b6aa4e49
}

function mostrar() {
    var tabela = document.getElementById('tabelaTransacoes');
    tabela.innerHTML = '';

    var i = 0;
    while (i < transacoes.length) {
        var t = transacoes[i];
    // Formata data para visualização (evita problemas de timezone)
    var d = new Date(t.date).toLocaleDateString('pt-PT', { timeZone: 'UTC' });
        var v = t.amount.toFixed(2);

        var html = '<tr>';
        html += '<td>' + t.name + '</td>';
        html += '<td>' + v + ' €</td>';
        html += '<td>' + d + '</td>';
        html += '<td>' + t.type + '</td>';
        html += '<td>' + t.category + '</td>';
        html += '<td><button class="delete-btn" onclick="deletar(' + t.number + ')">Eliminar</button></td>';
        html += '</tr>';

        tabela.innerHTML = tabela.innerHTML + html;
        i = i + 1;
    }

    calcular();
}

function deletar(numero) {
    var ok = confirm('Tem a certeza?');
    if (ok == true) {
        fetch('/transacoes/' + numero, { method: 'DELETE' })
            .then(function (resposta) {
                carregar();
            });
    }
}

function calcular() {
    var receitas = 0;
    var despesas = 0;

    var i = 0;
    while (i < transacoes.length) {
        var t = transacoes[i];
        if (t.type == 'Receita') {
            receitas = receitas + t.amount;
        } else {
            despesas = despesas + t.amount;
        }
        i = i + 1;
    }

    var saldo = receitas - despesas;

    document.getElementById('totalReceitas').textContent = receitas.toFixed(2);
    document.getElementById('totalDespesas').textContent = despesas.toFixed(2);
    document.getElementById('saldo').textContent = saldo.toFixed(2);
}

<<<<<<< HEAD
window.onload = function() {
  
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('registar-modal').style.display = 'none';
    document.getElementById('conteudo-principal').style.display = 'none';
=======
window.onload = function () {
    carregar();
>>>>>>> b03fe84803dee48e8f3cb3661cee22b6b6aa4e49
};

