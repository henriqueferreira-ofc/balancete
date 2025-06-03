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

function excluirLinha(button) {
  const row = button.parentNode.parentNode;
  const table = row.parentNode;

  // Não permite excluir se for a única linha da tabela
  if (table.rows.length > 2) {
    row.remove();
    calcularTotais(); // Atualiza os totais após excluir
  } else {
    alert("Não é possível excluir a última linha da tabela!");
  }
}

// Modificar as funções adicionarAluno e adicionarDespesa para incluir o botão de excluir
function adicionarAluno() {
  try {
    const tabela = document.getElementById("tabelaAlunos");
    const novaLinha = tabela.insertRow();

    novaLinha.innerHTML = `
            <td><input type="text" name="alunoNome[]" onchange="this.value = this.value.toUpperCase()" /></td>
            <td><input type="number" name="alunoValor[]" step="0.01" min="0" oninput="calcularTotais()" /></td>
            <td><button onclick="excluirLinha(this)" class="btn-excluir">Excluir</button></td>
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
            <td><button onclick="excluirLinha(this)" class="btn-excluir">Excluir</button></td>
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
}

function exportToExcel() {
  try {
    const workbook = XLSX.utils.book_new();
    const mesAtual = document.getElementById("currentMonth").textContent;

    // Coletar dados dos alunos e despesas
    const nomes = document.getElementsByName("alunoNome[]");
    const valores = document.getElementsByName("alunoValor[]");
    const descricoes = document.getElementsByName("despesaDescricao[]");
    const valoresDespesa = document.getElementsByName("despesaValor[]");

    // Montar linhas conforme o modelo da imagem
    const maxLinhas = Math.max(nomes.length, descricoes.length);
    const data = [];

    // Cabeçalho vazio para o título
    data.push([null, null, null, null]);
    // Título mesclado
    data.push([
      `FACULDADE IBADEB - BALANCETE - MÊS DE ${mesAtual}`,
      null,
      null,
      null
    ]);
    // Cabeçalho das colunas em caixa alta
    data.push(["NOME DO ALUNO", "ENTRADA", "DESPESAS", "SALDO"]);

    let totalEntradas = 0;
    let totalDespesas = 0;
    let saldoAcumulado = 0;

    for (let i = 0; i < maxLinhas; i++) {
      const nome = nomes[i] && nomes[i].value ? nomes[i].value : "";
      const entrada =
        valores[i] && valores[i].value ? parseFloat(valores[i].value) : "";
      const despesa =
        valoresDespesa[i] && valoresDespesa[i].value
          ? parseFloat(valoresDespesa[i].value)
          : "";
      let saldo = "";
      if (entrada !== "" && despesa !== "") {
        saldo = entrada - despesa;
      } else if (entrada !== "") {
        saldo = entrada;
      } else if (despesa !== "") {
        saldo = -despesa;
      }
      if (entrada !== "") totalEntradas += entrada;
      if (despesa !== "") totalDespesas += despesa;
      if (saldo !== "") saldoAcumulado += saldo;
      data.push([
        nome,
        entrada !== "" ? entrada : "",
        despesa !== "" ? despesa : "",
        saldo !== "" ? saldo : ""
      ]);
    }

    // Linha de totais
    data.push(["SALDO", totalEntradas, totalDespesas, saldoAcumulado]);

    // Criar a planilha
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Mesclar células para o título
    ws["!merges"] = [
      { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } } // Mescla B2:E2
    ];

    // Estilos (SheetJS open source suporta apenas estilos simples)
    // Título: negrito, centralizado, cor de fundo
    ws["A2"].s = {
      font: { bold: true, sz: 14 },
      alignment: { horizontal: "center", vertical: "center" },
      fill: { fgColor: { rgb: "B7DEE8" } }
    };
    // Cabeçalho: negrito, cor de fundo
    ["A3", "B3", "C3", "D3"].forEach((cell) => {
      ws[cell].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "D9E1F2" } },
        alignment: { horizontal: "center" }
      };
    });
    // Linha de totais (saldo): negrito, cor de fundo
    const saldoRow = 3 + maxLinhas + 1;
    ["A", "B", "C", "D"].forEach((col, idx) => {
      const cell = `${col}${saldoRow}`;
      if (ws[cell]) {
        ws[cell].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: "FCE4D6" } },
          alignment: { horizontal: idx === 0 ? "left" : "center" }
        };
      }
    });

    XLSX.utils.book_append_sheet(workbook, ws, "Balancete");
    XLSX.writeFile(workbook, `balancete_${mesAtual.toLowerCase()}.xlsx`);
    console.log("Excel exportado com sucesso");
  } catch (erro) {
    console.error("Erro ao exportar Excel:", erro);
    alert("Erro ao exportar para Excel!");
  }
}

async function gerarPDF() {
  try {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Carregar a logo
    const logo = new Image();
    logo.src = "public/ibadeb.png";

    await new Promise((resolve, reject) => {
      logo.onload = resolve;
      logo.onerror = reject;
    });

    // Configurações do título
    const pageWidth = doc.internal.pageSize.width;
    const logoWidth = 25;
    const logoHeight = 15;

    // Posição y do cabeçalho (um pouco mais abaixo)
    const headerY = 25;

    // Calcular posição x da logo para centralizar
    const title = `Faculdade IBADEB - Balancete - Mês de ${
      document.getElementById("currentMonth").textContent
    }`;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    const titleWidth =
      (doc.getStringUnitWidth(title) * doc.internal.getFontSize()) /
      doc.internal.scaleFactor;
    const totalWidth = logoWidth + 5 + titleWidth; // 5 é o espaço entre logo e texto
    const startX = (pageWidth - totalWidth) / 2;

    // Adicionar a logo
    doc.addImage(logo, "PNG", startX, headerY - 10, logoWidth, logoHeight);

    // Adicionar o título
    doc.text(title, startX + logoWidth + 5, headerY);

    // Resto do conteúdo começando mais abaixo
    // Tabela de Alunos
    doc.setFont("helvetica", "bold");
    doc.text("CADASTRO DE ALUNOS", 10, headerY + 20);

    let yPos = headerY + 30;
    doc.setFontSize(10);
    doc.text("NOME DO ALUNO", 10, yPos);
    doc.text("Valor (R$)", 150, yPos);

    const alunosNomes = document.getElementsByName("alunoNome[]");
    const alunosValores = document.getElementsByName("alunoValor[]");

    yPos += 10;
    for (let i = 0; i < alunosNomes.length; i++) {
      if (alunosNomes[i].value) {
        doc.text(alunosNomes[i].value, 10, yPos);
        doc.text(alunosValores[i].value || "0.00", 150, yPos);
        yPos += 8;
      }
    }

    // Tabela de Despesas
    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("DESPESAS GERAIS", 10, yPos);

    yPos += 10;
    doc.setFontSize(10);
    doc.text("DECRIÇÃO", 10, yPos);
    doc.text("Valor (R$)", 150, yPos);

    const despesasDesc = document.getElementsByName("despesaDescricao[]");
    const despesasValores = document.getElementsByName("despesaValor[]");

    yPos += 10;
    for (let i = 0; i < despesasDesc.length; i++) {
      if (despesasDesc[i].value) {
        doc.text(despesasDesc[i].value, 10, yPos);
        doc.text(despesasValores[i].value || "0.00", 150, yPos);
        yPos += 8;
      }
    }

    // Totais
    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.text(
      `Entradas: R$ ${document.getElementById("totalEntradas").textContent}`,
      10,
      yPos
    );
    yPos += 8;
    doc.text(
      `Despesas: R$ ${document.getElementById("totalDespesas").textContent}`,
      10,
      yPos
    );
    yPos += 8;
    doc.text(
      `Saldo: R$ ${document.getElementById("totalReceita").textContent}`,
      10,
      yPos
    );

    // Salvar o PDF
    doc.save(
      `balancete-${document.getElementById("currentMonth").textContent}.pdf`
    );
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    alert("Erro ao gerar PDF!");
  }
}

// Função para salvar dados
function salvarDados() {
  try {
    const mesAtual = document.getElementById("currentMonth").textContent;
    const anoAtual = new Date().getFullYear();
    const chave = `balancete_${mesAtual.toLowerCase()}_${anoAtual}`;

    const dados = {
      alunos: [],
      despesas: []
    };

    // Salvar dados dos alunos
    const nomes = document.getElementsByName("alunoNome[]");
    const valores = document.getElementsByName("alunoValor[]");
    for (let i = 0; i < nomes.length; i++) {
      if (nomes[i].value) {
        dados.alunos.push({
          nome: nomes[i].value,
          valor: valores[i].value
        });
      }
    }

    // Salvar dados das despesas
    const descricoes = document.getElementsByName("despesaDescricao[]");
    const valoresDespesa = document.getElementsByName("despesaValor[]");
    for (let i = 0; i < descricoes.length; i++) {
      if (descricoes[i].value) {
        dados.despesas.push({
          descricao: descricoes[i].value,
          valor: valoresDespesa[i].value
        });
      }
    }

    localStorage.setItem(chave, JSON.stringify(dados));
    alert("Dados salvos com sucesso!");
    console.log("Dados salvos:", dados);
  } catch (error) {
    console.error("Erro ao salvar dados:", error);
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
      console.log("Nenhum dado encontrado para este mês");
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
                <td><button onclick="excluirLinha(this)" class="btn-excluir">Excluir</button></td>
            `;
    });

    // Carregar despesas
    dados.despesas.forEach((despesa) => {
      const novaLinha = tabelaDespesas.insertRow();
      novaLinha.innerHTML = `
                <td><input type="text" name="despesaDescricao[]" value="${despesa.descricao}" onchange="this.value = this.value.toUpperCase()" /></td>
                <td><input type="number" name="despesaValor[]" value="${despesa.valor}" step="0.01" min="0" oninput="calcularTotais()" /></td>
                <td><button onclick="excluirLinha(this)" class="btn-excluir">Excluir</button></td>
            `;
    });

    calcularTotais();
    console.log("Dados carregados:", dados);
  } catch (erro) {
    console.error("Erro ao carregar dados:", erro);
    alert("Erro ao carregar dados!");
  }
}
