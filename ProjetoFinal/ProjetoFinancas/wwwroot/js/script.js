var transacoes = [];

function carregar() {
    console.log('Carregando transações...');
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
    
    console.log('Descrição:', descricao, 'Valor:', valor, 'Data:', data, 'Tipo:', tipo);
    
    var transacao = {
        name: descricao,
        date: new Date(data),
        type: tipo,
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
        var d = new Date(t.date).toLocaleDateString();
        var v = t.amount.toFixed(2);
        
        var html = '<tr>';
        html = html + '<td>' + t.name + '</td>';
        html = html + '<td>' + v + ' €</td>';
        html = html + '<td>' + d + '</td>';
        html = html + '<td>' + t.type + '</td>';
        html = html + '<td><button class="delete-btn" onclick="deletar(' + t.number + ')">Eliminar</button></td>';
        html = html + '</tr>';
        
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
    carregar();
};

