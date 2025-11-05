document.getElementById('transaction-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const descricao = document.getElementById('descricao').value;
    const valor = document.getElementById('valor').value;
    const data = document.getElementById('data').value;
    const tipo = document.getElementById('tipo').value;
    const categoria = document.getElementById('categoria').value;

    const novaTransacao = {
        descricao: descricao,
        valor: parseFloat(valor),
        data: data,
        tipo: tipo,
        categoria: categoria
    };

    // Enviar a transação para o backend
    fetch('/adicionar-transacao', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(novaTransacao)
    })
    .then(response => response.json())
    .then(data => {
        // Atualizar a tabela de transações após adicionar
        atualizarTabelaTransacoes();
    });
});

// Função para atualizar a tabela de transações
function atualizarTabelaTransacoes() {
    fetch('/obter-transacoes')
        .then(response => response.json())
        .then(transacoes => {
            const tabela = document.getElementById('transactions-table');
            tabela.innerHTML = '';  // Limpar a tabela

            // Adicionar as transações à tabela
            transacoes.forEach(transacao => {
                const row = tabela.insertRow();
                row.insertCell(0).textContent = transacao.descricao;
                row.insertCell(1).textContent = transacao.valor;
                row.insertCell(2).textContent = transacao.data;
                row.insertCell(3).textContent = transacao.tipo;
                row.insertCell(4).textContent = transacao.categoria;
            });
        });
}
