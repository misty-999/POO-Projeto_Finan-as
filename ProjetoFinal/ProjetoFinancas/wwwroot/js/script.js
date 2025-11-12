// Estado global para armazenar as transações
let transacoes = [];

document.addEventListener('DOMContentLoaded', () => {
    // Adicionar listener para o formulário
    document.getElementById('transaction-form').addEventListener('submit', adicionarTransacao);
    // Carregar transações existentes
    carregarTransacoes();
});

// Função para adicionar uma nova transação
async function adicionarTransacao(event) {
    event.preventDefault();

    const transacao = {
        name: document.getElementById('descricao').value,
        date: new Date(document.getElementById('data').value),
        type: document.getElementById('tipo').value,
        amount: parseFloat(document.getElementById('valor').value)
    };

    try {
        const response = await fetch('/transacoes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transacao)
        });

        if (response.ok) {
            const novaTransacao = await response.json();
            transacoes.push(novaTransacao);
            atualizarListaTransacoes();
            calcularTotais();
            document.getElementById('transaction-form').reset();
            alert('Transação adicionada com sucesso!');
        } else {
            alert('Erro ao adicionar transação');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao comunicar com o servidor');
    }
}

// Função para carregar transações existentes
async function carregarTransacoes() {
    try {
        const response = await fetch('/transacoes');
        const data = await response.json();
        if (Array.isArray(data)) {
            transacoes = data;
        } else if (data) {
            transacoes = [data]; // Se receber apenas uma transação
        }
        atualizarListaTransacoes();
        calcularTotais();
    } catch (error) {
        console.error('Erro ao carregar transações:', error);
    }
}

// Função para atualizar a lista de transações na interface
function atualizarListaTransacoes() {
    const lista = document.getElementById('transaction-list');
    lista.innerHTML = '';

    transacoes.forEach((transacao, index) => {
        const row = document.createElement('tr');
        const dataFormatada = new Date(transacao.date).toLocaleDateString();
        row.innerHTML = `
            <td>${transacao.name || ''}</td>
            <td>${transacao.amount.toFixed(2)} €</td>
            <td>${dataFormatada}</td>
            <td>${transacao.type}</td>
            <td>${transacao.category || 'N/A'}</td>
            <td>
                <button onclick="excluirTransacao(${transacao.number})" class="btn-excluir">Excluir</button>
            </td>
        `;
        lista.appendChild(row);
    });
}

// Função para calcular totais
function calcularTotais() {
    const totais = transacoes.reduce((acc, transacao) => {
        const valor = parseFloat(transacao.amount);
        if (transacao.type === 'Receita' || transacao.type === 'Credit' || transacao.type === 'receita') {
            acc.receitas += valor;
        } else {
            acc.despesas += valor;
        }
        return acc;
    }, { receitas: 0, despesas: 0 });

    document.getElementById('total-receitas').textContent = totais.receitas.toFixed(2);
    document.getElementById('total-despesas').textContent = totais.despesas.toFixed(2);
    document.getElementById('saldo').textContent = (totais.receitas - totais.despesas).toFixed(2);
}

// Função para excluir uma transação
async function excluirTransacao(number) {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
        return;
    }

    try {
        const response = await fetch(`/transacoes/${number}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            transacoes = transacoes.filter(t => t.number !== number);
            atualizarListaTransacoes();
            calcularTotais();
            alert('Transação excluída com sucesso!');
        } else {
            alert('Erro ao excluir transação');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao comunicar com o servidor');
    }
}
