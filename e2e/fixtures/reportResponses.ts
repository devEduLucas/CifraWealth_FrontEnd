import type { DetailedReportResponse } from '../../src/types/reports.types';

// Fixed API contract examples: browser checks never calculate report totals.
// Covers monthly, multi-month, negative balance and empty periods with known cents.
export const REPORT_RESPONSES: Readonly<Record<string, DetailedReportResponse>> = {
  "2026-10-01|2026-10-25": {
    "dataInicio": "2026-10-01",
    "dataFim": "2026-10-25",
    "summary": {
      "receitas": 3200.55,
      "despesas": 800.25,
      "saldo": 2400.3,
      "taxaEconomiaPercentual": 75,
      "variacaoReceitas": 166.69,
      "variacaoDespesas": -42.84,
      "variacaoSaldo": 1300.15,
      "variacaoTaxaEconomia": 549.91
    },
    "evolution": [
      {
        "mes": "out. de 26",
        "receitas": 3200.55,
        "despesas": 800.25,
        "saldo": 2400.3
      }
    ],
    "monthlyComparison": [
      {
        "mes": "out. de 26",
        "receitas": 3200.55,
        "despesas": 800.25
      }
    ],
    "history": [
      {
        "id": "2026-10",
        "periodo": "out. de 26",
        "receitas": 3200.55,
        "despesas": 800.25,
        "saldo": 2400.3,
        "variacaoPercentual": null
      }
    ],
    "categoryBreakdown": [
      {
        "id": 2,
        "nome": "Moradia",
        "cor": "#ef4444",
        "total": 800.25,
        "percentual": 100
      }
    ],
    "insights": [
      {
        "id": "balance",
        "tipo": "positivo",
        "mensagem": "As receitas cobrem as despesas neste período."
      },
      {
        "id": "category",
        "tipo": "neutro",
        "mensagem": "Moradia representa 100% das despesas."
      },
      {
        "id": "expenses",
        "tipo": "positivo",
        "mensagem": "As despesas caíram 42.84% em relação ao período anterior de mesma duração."
      }
    ],
    "goals": [],
    "transactions": [
      {
        "id": 4,
        "data": "2026-10-15",
        "descricao": "Despesa de outubro",
        "categoria": "Moradia",
        "tipo": "despesa",
        "valor": 800.25
      },
      {
        "id": 3,
        "data": "2026-10-05",
        "descricao": "Receita de outubro",
        "categoria": "Salário",
        "tipo": "receita",
        "valor": 3200.55
      }
    ]
  },
  "2026-08-01|2026-10-25": {
    "dataInicio": "2026-08-01",
    "dataFim": "2026-10-25",
    "summary": {
      "receitas": 4400.65,
      "despesas": 2200.35,
      "saldo": 2200.3,
      "taxaEconomiaPercentual": 50,
      "variacaoReceitas": null,
      "variacaoDespesas": null,
      "variacaoSaldo": null,
      "variacaoTaxaEconomia": null
    },
    "evolution": [
      {
        "mes": "ago. de 26",
        "receitas": 0,
        "despesas": 0,
        "saldo": 0
      },
      {
        "mes": "set. de 26",
        "receitas": 1200.1,
        "despesas": 1400.1,
        "saldo": -200
      },
      {
        "mes": "out. de 26",
        "receitas": 3200.55,
        "despesas": 800.25,
        "saldo": 2400.3
      }
    ],
    "monthlyComparison": [
      {
        "mes": "ago. de 26",
        "receitas": 0,
        "despesas": 0
      },
      {
        "mes": "set. de 26",
        "receitas": 1200.1,
        "despesas": 1400.1
      },
      {
        "mes": "out. de 26",
        "receitas": 3200.55,
        "despesas": 800.25
      }
    ],
    "history": [
      {
        "id": "2026-08",
        "periodo": "ago. de 26",
        "receitas": 0,
        "despesas": 0,
        "saldo": 0,
        "variacaoPercentual": null
      },
      {
        "id": "2026-09",
        "periodo": "set. de 26",
        "receitas": 1200.1,
        "despesas": 1400.1,
        "saldo": -200,
        "variacaoPercentual": null
      },
      {
        "id": "2026-10",
        "periodo": "out. de 26",
        "receitas": 3200.55,
        "despesas": 800.25,
        "saldo": 2400.3,
        "variacaoPercentual": 1300.15
      }
    ],
    "categoryBreakdown": [
      {
        "id": 2,
        "nome": "Moradia",
        "cor": "#ef4444",
        "total": 2200.35,
        "percentual": 100
      }
    ],
    "insights": [
      {
        "id": "balance",
        "tipo": "positivo",
        "mensagem": "As receitas cobrem as despesas neste período."
      },
      {
        "id": "category",
        "tipo": "neutro",
        "mensagem": "Moradia representa 100% das despesas."
      }
    ],
    "goals": [],
    "transactions": [
      {
        "id": 4,
        "data": "2026-10-15",
        "descricao": "Despesa de outubro",
        "categoria": "Moradia",
        "tipo": "despesa",
        "valor": 800.25
      },
      {
        "id": 3,
        "data": "2026-10-05",
        "descricao": "Receita de outubro",
        "categoria": "Salário",
        "tipo": "receita",
        "valor": 3200.55
      },
      {
        "id": 2,
        "data": "2026-09-20",
        "descricao": "Despesa de setembro",
        "categoria": "Moradia",
        "tipo": "despesa",
        "valor": 1400.1
      },
      {
        "id": 1,
        "data": "2026-09-10",
        "descricao": "Receita de setembro",
        "categoria": "Salário",
        "tipo": "receita",
        "valor": 1200.1
      }
    ]
  },
  "2026-09-01|2026-09-30": {
    "dataInicio": "2026-09-01",
    "dataFim": "2026-09-30",
    "summary": {
      "receitas": 1200.1,
      "despesas": 1400.1,
      "saldo": -200,
      "taxaEconomiaPercentual": -16.67,
      "variacaoReceitas": null,
      "variacaoDespesas": null,
      "variacaoSaldo": null,
      "variacaoTaxaEconomia": null
    },
    "evolution": [
      {
        "mes": "set. de 26",
        "receitas": 1200.1,
        "despesas": 1400.1,
        "saldo": -200
      }
    ],
    "monthlyComparison": [
      {
        "mes": "set. de 26",
        "receitas": 1200.1,
        "despesas": 1400.1
      }
    ],
    "history": [
      {
        "id": "2026-09",
        "periodo": "set. de 26",
        "receitas": 1200.1,
        "despesas": 1400.1,
        "saldo": -200,
        "variacaoPercentual": null
      }
    ],
    "categoryBreakdown": [
      {
        "id": 2,
        "nome": "Moradia",
        "cor": "#ef4444",
        "total": 1400.1,
        "percentual": 100
      }
    ],
    "insights": [
      {
        "id": "balance",
        "tipo": "negativo",
        "mensagem": "As despesas superam as receitas neste período."
      },
      {
        "id": "category",
        "tipo": "neutro",
        "mensagem": "Moradia representa 100% das despesas."
      }
    ],
    "goals": [],
    "transactions": [
      {
        "id": 2,
        "data": "2026-09-20",
        "descricao": "Despesa de setembro",
        "categoria": "Moradia",
        "tipo": "despesa",
        "valor": 1400.1
      },
      {
        "id": 1,
        "data": "2026-09-10",
        "descricao": "Receita de setembro",
        "categoria": "Salário",
        "tipo": "receita",
        "valor": 1200.1
      }
    ]
  },
  "2025-01-01|2025-01-31": {
    "dataInicio": "2025-01-01",
    "dataFim": "2025-01-31",
    "summary": {
      "receitas": 0,
      "despesas": 0,
      "saldo": 0,
      "taxaEconomiaPercentual": 0,
      "variacaoReceitas": null,
      "variacaoDespesas": null,
      "variacaoSaldo": null,
      "variacaoTaxaEconomia": null
    },
    "evolution": [
      {
        "mes": "jan. de 25",
        "receitas": 0,
        "despesas": 0,
        "saldo": 0
      }
    ],
    "monthlyComparison": [
      {
        "mes": "jan. de 25",
        "receitas": 0,
        "despesas": 0
      }
    ],
    "history": [
      {
        "id": "2025-01",
        "periodo": "jan. de 25",
        "receitas": 0,
        "despesas": 0,
        "saldo": 0,
        "variacaoPercentual": null
      }
    ],
    "categoryBreakdown": [],
    "insights": [
      {
        "id": "empty",
        "tipo": "neutro",
        "mensagem": "Nenhuma transação confirmada no período selecionado."
      }
    ],
    "goals": [],
    "transactions": []
  }
};
