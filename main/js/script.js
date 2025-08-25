// Mensagens motivacionais para incentivar o usuário
const mensagensMotivacionais = [
  'Continue registrando! O controle é o primeiro passo para a liberdade financeira. 💡',
  'Cada lançamento é um passo rumo aos seus sonhos! ✨',
  'Você está no caminho certo para conquistar sua independência financeira! 🚀',
  'Organizar suas finanças é investir no seu futuro! 💰',
  'Pequenas ações hoje, grandes conquistas amanhã! 🌟',
  'Seu esforço será recompensado. Continue assim! 🏆',
  'A disciplina financeira abre portas para novas oportunidades! 🔑',
  'Você está dominando seu dinheiro, não o contrário! 👏',
  'Persistência é o segredo do sucesso financeiro! 💪',
  'A cada registro, você se aproxima dos seus objetivos! 🎯'
];

// Atualiza a mensagem motivacional exibida na tela
function atualizarMensagemMotivacional() {
  const box = document.getElementById('motivacionalBox');
  if (box) {
    const idx = Math.floor(Math.random() * mensagensMotivacionais.length);
    box.textContent = mensagensMotivacionais[idx];
  }
}

// ================== NOVO SISTEMA DE CONTROLE DE FINANÇAS ==================

const form = document.getElementById('form-transacao');
const saldoEl = document.getElementById('saldo');
const historicoEl = document.getElementById('historico');
const graficoCanvas = document.getElementById('graficoTransacoes');
const chartBalanceCanvas = document.getElementById('chartBalance');
const chartDonutCanvas = document.getElementById('chartDonut');
let grafico;
let chartBalance;
let chartDonut;
// Atualiza o gráfico de linha de entradas e saídas
function atualizarGraficoLinha() {
  const { labels, entradas, saidas } = prepararDadosGrafico();
  if (grafico) grafico.destroy();
  grafico = new Chart(graficoCanvas, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Entradas',
          data: entradas,
          fill: false,
          backgroundColor: 'rgba(46, 160, 67, 0.7)',
          borderColor: 'rgba(46, 160, 67, 1)',
          borderWidth: 3,
          tension: 0.3,
          pointBackgroundColor: 'rgba(46, 160, 67, 1)',
          pointRadius: 5
        },
        {
          label: 'Saídas',
          data: saidas,
          fill: false,
          backgroundColor: 'rgba(248, 81, 73, 0.7)',
          borderColor: 'rgba(248, 81, 73, 1)',
          borderWidth: 3,
          tension: 0.3,
          pointBackgroundColor: 'rgba(248, 81, 73, 1)',
          pointRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Entradas e Saídas por Mês' }
      },
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}
// Função para preparar dados do gráfico
// Prepara os dados agrupando por mês/ano para o gráfico de linha
function prepararDadosGrafico() {
  // Agrupa por mês/ano
  const dados = {};
  transacoes.forEach(t => {
    // Extrai mês/ano da data completa (YYYY-MM-DD)
    const data = t.data ? t.data.slice(0,7) : new Date().toISOString().slice(0,7);
    if (!dados[data]) dados[data] = { entrada: 0, saida: 0 };
    if (t.tipo === 'entrada') dados[data].entrada += t.valor;
    else dados[data].saida += t.valor;
  });
  const labels = Object.keys(dados).sort();
  const entradas = labels.map(l => dados[l].entrada);
  const saidas = labels.map(l => dados[l].saida);
  return { labels, entradas, saidas };
}

// Atualiza os gráficos de pizza: saldo acumulado e entradas vs saídas
function atualizarGraficosPizza() {
  // Gráfico de saldo acumulado (Entradas, Saídas, Saldo)
  const totalEntradas = transacoes.filter(t => t.tipo === 'entrada').reduce((a, b) => a + b.valor, 0);
  const totalSaidas = transacoes.filter(t => t.tipo === 'saida').reduce((a, b) => a + b.valor, 0);
  const saldo = totalEntradas - totalSaidas;
  const saldoPositivo = saldo > 0 ? saldo : 0;
  const saldoNegativo = saldo < 0 ? Math.abs(saldo) : 0;

  if (chartBalance) chartBalance.destroy();
  chartBalance = new Chart(chartBalanceCanvas, {
    type: 'pie',
    data: {
      labels: ['Entradas', 'Saídas', saldo >= 0 ? 'Saldo' : 'Déficit'],
      datasets: [{
        data: [totalEntradas, totalSaidas, Math.abs(saldo)],
        backgroundColor: [
          'rgba(46, 160, 67, 0.8)',
          'rgba(248, 81, 73, 0.8)',
          saldo >= 0 ? 'rgba(242, 208, 0, 0.8)' : 'rgba(81, 81, 248, 0.8)'
        ],
        borderColor: '#222',
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Saldo acumulado' }
      }
    }
  });
  chartDonut = new Chart(chartDonutCanvas, {
    type: 'doughnut',
    data: {
      labels: ['Entradas', 'Saídas'],
      datasets: [{
        data: [totalEntradas, totalSaidas],
        backgroundColor: [
          'rgba(46, 160, 67, 0.8)',
          'rgba(248, 81, 73, 0.8)'
        ],
        borderColor: '#222',
        borderWidth: 2
      }]
    },
    options: {
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: 'Entradas vs Saídas' }
      }
    }
  });
}

let transacoes = JSON.parse(localStorage.getItem('financas_transacoes')) || [];

// Atualiza o saldo exibido na tela
function atualizarSaldo() {
  const saldo = transacoes.reduce((acc, t) => {
    return t.tipo === 'entrada' ? acc + t.valor : acc - t.valor;
  }, 0);
  saldoEl.textContent = saldo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  if (saldo >= 0) {
    saldoEl.style.color = '#2ea043';
  } else {
    saldoEl.style.color = '#f85149';
  }
}

// Renderiza a lista de transações no histórico
function renderizarHistorico() {
  historicoEl.innerHTML = '';
  transacoes.slice().reverse().forEach((t, idx) => {
    const li = document.createElement('li');
    // Formata a data para DD/MM/AAAA
    let dataFormatada = '';
    if (t.data) {
      const [ano, mes, dia] = t.data.split('-');
      dataFormatada = `${dia}/${mes}/${ano}`;
    }
    li.innerHTML = `
      <span>${t.descricao} <small style="color:#888;font-size:.95em;">${dataFormatada ? '('+dataFormatada+')' : ''}</small></span>
      <span class="${t.tipo}">${t.tipo === 'entrada' ? '+' : '-'} R$ ${t.valor.toFixed(2)}</span>
      <button class="remover" title="Remover" onclick="removerTransacao(${transacoes.length - 1 - idx})">×</button>
    `;
    historicoEl.appendChild(li);
  });
}

// Remove uma transação do histórico pelo índice
window.removerTransacao = function(idx) {
  transacoes.splice(idx, 1);
  salvarTransacoes();
  atualizarSaldo();
  renderizarHistorico();
};

// Salva as transações no localStorage
function salvarTransacoes() {
  localStorage.setItem('financas_transacoes', JSON.stringify(transacoes));
}

// Evento de submit do formulário: adiciona nova transação
form.addEventListener('submit', function(e) {
  e.preventDefault();
  const descricao = document.getElementById('descricao').value.trim();
  const valor = parseFloat(document.getElementById('valor').value);
  const tipo = document.getElementById('tipo').value;
  const dataInput = document.getElementById('data').value;
  if (!descricao || isNaN(valor) || valor <= 0 || !dataInput) {
    alert('Preencha todos os campos corretamente!');
    return;
  }
  // Salva a data completa (YYYY-MM-DD)
  transacoes.push({ descricao, valor, tipo, data: dataInput });
  salvarTransacoes();
  atualizarSaldo();
  renderizarHistorico();
  atualizarGraficoLinha();
  atualizarGraficosPizza();
  atualizarMensagemMotivacional();
  form.reset();
});

// Inicialização
atualizarSaldo();
renderizarHistorico();
atualizarGraficoLinha();
atualizarGraficosPizza();
atualizarMensagemMotivacional();
