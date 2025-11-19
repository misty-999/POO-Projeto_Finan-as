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
    
    var nome = document.getElementById('nome-login').value;
    var senha = document.getElementById('senha').value;

    var credenciais = {
        nome: nome,
        senha: senha
    };
    
    fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credenciais)
    })
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
        // mostrar nome no header e botão sair
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
    
    var nome = document.getElementById('nome').value;
    var senha = document.getElementById('senha-registar').value;
    var confirmacao = document.getElementById('senha-confirmacao').value;
    
    if (senha !== confirmacao) {
        alert('As senhas não correspondem!');
        return;
    }
    
    var utilizador = {
        nome: nome,
        senha: senha,
        perfil: 'comum'
    };
    
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

function carregar() {
    console.log('A carregar transações...');
    fetch('/transacoes')
        .then(function(resposta) {
            console.log('Status:', resposta.status);
            return resposta.json();
        })
        .then(function(dados) {
            console.log('Dados recebidos:', dados);
            transacoes = dados;
            mostrar();
        })
        .catch(function(erro) {
            console.log('Erro ao carregar:', erro);
        });
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
    
    fetch('/transacoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transacao)
    })
    .then(function(resposta) {
        console.log('Resposta recebida:', resposta);
        document.querySelector('form').reset();
        carregar();
    })
    .catch(function(erro) {
        console.log('Erro ao adicionar:', erro);
    });
}

function mostrar() {
    var tabela = document.getElementById('tabelaTransacoes');
    tabela.innerHTML = '';
    
    var i = 0;
    while (i < transacoes.length) {
        var t = transacoes[i];
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
            .then(function(resposta) {
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

window.onload = function() {
    // start showing login modal; do NOT carregar transações until login
    document.getElementById('login-modal').style.display = 'flex';
    document.getElementById('registar-modal').style.display = 'none';
    document.getElementById('conteudo-principal').style.display = 'none';
};

