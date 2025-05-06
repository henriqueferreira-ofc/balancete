console.log("Carregando JavaScript...");

document.addEventListener("DOMContentLoaded", function () {
  console.log("Página carregada");
  updateMonth();
  carregarDados(); // Carregar dados salvos
  calcularTotais();
});

function updateMonth() {
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
  ];
  const currentDate = new Date();
  document.getElementById("currentMonth").textContent =
    months[currentDate.getMonth()];
}

function adicionarAluno() {
  try {
    const tabela = document.getElementById("tabelaAlunos");
    const novaLinha = tabela.insertRow();

    novaLinha.innerHTML = `
            <td><input type="text" name="alunoNome[]" onchange="this.value = this.value.toUpperCase()" /></td>
            <td><input type="number" name="alunoValor[]" step="0.01" min="0" oninput="calcularTotais()" /></td>
        `;

    calcularTotais();
    console.log("Novo aluno adicionado");
  } catch (error) {
    console.error("Erro ao adicionar aluno:", error);
  }
}

function adicionarDespesa() {
  try {
    const tabela = document.getElementById("tabelaDespesas");
    const novaLinha = tabela.insertRow();

    novaLinha.innerHTML = `
            <td><input type="text" name="despesaDescricao[]" onchange="this.value = this.value.toUpperCase()" /></td>
            <td><input type="number" name="despesaValor[]" step="0.01" min="0" oninput="calcularTotais()" /></td>
        `;

    calcularTotais();
    console.log("Nova despesa adicionada");
  } catch (error) {
    console.error("Erro ao adicionar despesa:", error);
  }
}

function calcularTotais() {
  try {
    let totalEntradas = 0;
    let totalDespesas = 0;

    // Calcula total de entradas
    document.getElementsByName("alunoValor[]").forEach((input) => {
      if (input.value) {
        totalEntradas += parseFloat(input.value);
      }
    });

    // Calcula total de despesas
    document.getElementsByName("despesaValor[]").forEach((input) => {
      if (input.value) {
        totalDespesas += parseFloat(input.value);
      }
    });

    const totalReceita = totalEntradas - totalDespesas;

    // Atualiza os valores na tela
    document.getElementById("totalEntradas").textContent =
      totalEntradas.toFixed(2);
    document.getElementById("totalDespesas").textContent =
      totalDespesas.toFixed(2);
    document.getElementById("totalReceita").textContent =
      totalReceita.toFixed(2);

    console.log("Totais atualizados:", {
      totalEntradas,
      totalDespesas,
      totalReceita
    });
  } catch (error) {
    console.error("Erro ao calcular totais:", error);
  }
  salvarDados(); // Adicionar esta linha no final da função
}

function exportToExcel() {
  try {
    // Criar um novo workbook
    const workbook = XLSX.utils.book_new();
    const mesAtual = document.getElementById("currentMonth").textContent;

    // Dados dos alunos
    const alunosData = [];
    const nomes = document.getElementsByName("alunoNome[]");
    const valores = document.getElementsByName("alunoValor[]");

    for (let i = 0; i < nomes.length; i++) {
      if (nomes[i].value) {
        alunosData.push({
          "Nome do Aluno": nomes[i].value,
          "Valor Pago (R$)": parseFloat(valores[i].value || 0).toFixed(2)
        });
      }
    }

    // Dados das despesas
    const despesasData = [];
    const descricoes = document.getElementsByName("despesaDescricao[]");
    const valoresDespesa = document.getElementsByName("despesaValor[]");

    for (let i = 0; i < descricoes.length; i++) {
      if (descricoes[i].value) {
        despesasData.push({
          Descrição: descricoes[i].value,
          "Valor (R$)": parseFloat(valoresDespesa[i].value || 0).toFixed(2)
        });
      }
    }

    // Criar planilhas
    const alunosSheet = XLSX.utils.json_to_sheet(alunosData);
    const despesasSheet = XLSX.utils.json_to_sheet(despesasData);

    // Adicionar resumo
    const resumoData = [
      { Resumo: "Valor" },
      {
        Resumo: "Total de Entradas",
        Valor: document.getElementById("totalEntradas").textContent
      },
      {
        Resumo: "Total de Despesas",
        Valor: document.getElementById("totalDespesas").textContent
      },
      {
        Resumo: "Total de Receita",
        Valor: document.getElementById("totalReceita").textContent
      }
    ];
    const resumoSheet = XLSX.utils.json_to_sheet(resumoData);

    // Adicionar planilhas ao workbook
    XLSX.utils.book_append_sheet(workbook, alunosSheet, "Alunos");
    XLSX.utils.book_append_sheet(workbook, despesasSheet, "Despesas");
    XLSX.utils.book_append_sheet(workbook, resumoSheet, "Resumo");

    // Salvar arquivo
    XLSX.writeFile(workbook, `balancete_${mesAtual.toLowerCase()}.xlsx`);

    console.log("Excel exportado com sucesso");
  } catch (erro) {
    console.error("Erro ao exportar Excel:", erro);
    alert("Erro ao exportar para Excel!");
  }
}

function gerarPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const mesAtual = document.getElementById("currentMonth").textContent;

    // Configurações
    doc.setFont("helvetica");
    doc.setFontSize(16);

    // Título
    doc.text(`BALANCETE - ${mesAtual.toUpperCase()}`, 105, 20, {
      align: "center"
    });

    let y = 40;

    // Lista de Alunos
    doc.setFontSize(14);
    doc.text("ALUNOS E VALORES PAGOS:", 20, y);
    y += 10;

    const nomes = document.getElementsByName("alunoNome[]");
    const valores = document.getElementsByName("alunoValor[]");

    doc.setFontSize(12);
    for (let i = 0; i < nomes.length; i++) {
      if (nomes[i].value) {
        doc.text(`${nomes[i].value}: R$ ${valores[i].value || "0.00"}`, 30, y);
        y += 8;
      }
    }

    // Lista de Despesas
    y += 10;
    doc.setFontSize(14);
    doc.text("DESPESAS:", 20, y);
    y += 10;

    const descricoes = document.getElementsByName("despesaDescricao[]");
    const valoresDespesa = document.getElementsByName("despesaValor[]");

    doc.setFontSize(12);
    for (let i = 0; i < descricoes.length; i++) {
      if (descricoes[i].value) {
        doc.text(
          `${descricoes[i].value}: R$ ${valoresDespesa[i].value || "0.00"}`,
          30,
          y
        );
        y += 8;
      }
    }

    // Totais
    y += 15;
    doc.setFontSize(14);
    doc.text("RESUMO:", 20, y);
    y += 10;
    doc.text(
      `Total de Entradas: R$ ${
        document.getElementById("totalEntradas").textContent
      }`,
      30,
      y
    );
    y += 8;
    doc.text(
      `Total de Despesas: R$ ${
        document.getElementById("totalDespesas").textContent
      }`,
      30,
      y
    );
    y += 8;
    doc.text(
      `Total de Receita: R$ ${
        document.getElementById("totalReceita").textContent
      }`,
      30,
      y
    );

    // Salvar PDF
    doc.save(`balancete_${mesAtual.toLowerCase()}.pdf`);

    console.log("PDF gerado com sucesso");
  } catch (erro) {
    console.error("Erro ao gerar PDF:", erro);
    alert("Erro ao gerar PDF!");
  }
}

// Função para salvar dados
function salvarDados() {
  try {
    const mesAtual = document.getElementById("currentMonth").textContent;
    const anoAtual = new Date().getFullYear();

    // Coletar dados dos alunos
    const alunos = [];
    const nomes = document.getElementsByName("alunoNome[]");
    const valores = document.getElementsByName("alunoValor[]");

    for (let i = 0; i < nomes.length; i++) {
      if (nomes[i].value) {
        alunos.push({
          nome: nomes[i].value,
          valor: valores[i].value
        });
      }
    }

    // Coletar dados das despesas
    const despesas = [];
    const descricoes = document.getElementsByName("despesaDescricao[]");
    const valoresDespesa = document.getElementsByName("despesaValor[]");

    for (let i = 0; i < descricoes.length; i++) {
      if (descricoes[i].value) {
        despesas.push({
          descricao: descricoes[i].value,
          valor: valoresDespesa[i].value
        });
      }
    }

    // Criar objeto com todos os dados
    const dados = {
      mes: mesAtual,
      ano: anoAtual,
      alunos: alunos,
      despesas: despesas,
      totais: {
        entradas: document.getElementById("totalEntradas").textContent,
        despesas: document.getElementById("totalDespesas").textContent,
        receita: document.getElementById("totalReceita").textContent
      }
    };

    // Salvar no localStorage
    const chave = `balancete_${mesAtual.toLowerCase()}_${anoAtual}`;
    localStorage.setItem(chave, JSON.stringify(dados));

    alert("Dados salvos com sucesso!");
    console.log("Dados salvos:", dados);
  } catch (erro) {
    console.error("Erro ao salvar dados:", erro);
    alert("Erro ao salvar dados!");
  }
}

function carregarDados() {
  try {
    const mesAtual = document.getElementById("currentMonth").textContent;
    const anoAtual = new Date().getFullYear();
    const chave = `balancete_${mesAtual.toLowerCase()}_${anoAtual}`;

    const dadosSalvos = localStorage.getItem(chave);
    if (!dadosSalvos) {
      alert("Nenhum dado encontrado para este mês!");
      return;
    }

    const dados = JSON.parse(dadosSalvos);

    // Limpar tabelas existentes
    const tabelaAlunos = document.getElementById("tabelaAlunos");
    const tabelaDespesas = document.getElementById("tabelaDespesas");

    // Manter apenas o cabeçalho das tabelas
    tabelaAlunos.innerHTML = `
            <tr>
                <th>Nome do Aluno</th>
                <th>Valor Pago (R$)</th>
            </tr>
        `;

    tabelaDespesas.innerHTML = `
            <tr>
                <th>Descrição da Despesa</th>
                <th>Valor (R$)</th>
            </tr>
        `;

    // Carregar alunos
    dados.alunos.forEach((aluno) => {
      const novaLinha = tabelaAlunos.insertRow();
      novaLinha.innerHTML = `
                <td><input type="text" name="alunoNome[]" value="${aluno.nome}" onchange="this.value = this.value.toUpperCase()" /></td>
                <td><input type="number" name="alunoValor[]" value="${aluno.valor}" step="0.01" min="0" oninput="calcularTotais()" /></td>
            `;
    });

    // Carregar despesas
    dados.despesas.forEach((despesa) => {
      const novaLinha = tabelaDespesas.insertRow();
      novaLinha.innerHTML = `
                <td><input type="text" name="despesaDescricao[]" value="${despesa.descricao}" onchange="this.value = this.value.toUpperCase()" /></td>
                <td><input type="number" name="despesaValor[]" value="${despesa.valor}" step="0.01" min="0" oninput="calcularTotais()" /></td>
            `;
    });

    calcularTotais();
    alert("Dados carregados com sucesso!");
    console.log("Dados carregados:", dados);
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    alert("Erro ao carregar dados!");
  }
}
