export const DIAS_DA_SEMANA = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
];

export const MESES = [
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
  "Dezembro",
];

export function formatarDataISO(date: Date): string {
  const ano = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

export function parseDataISO(dateStr: string): Date {
  const clean = dateStr.split("T")[0];
  const [ano, mes, dia] = clean.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

export function getProximosNDias(n: number = 7, dataInicial: Date = new Date()): Date[] {
  const dias: Date[] = [];
  const base = new Date(dataInicial.getFullYear(), dataInicial.getMonth(), dataInicial.getDate());
  
  for (let i = 0; i < n; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    dias.push(d);
  }
  return dias;
}

export function formatarTituloDia(date: Date, hoje: Date = new Date()): {
  tag?: string;
  diaSemana: string;
  diaEMes: string;
  textoCompleto: string;
} {
  const hojeLimpo = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const dateLimpo = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDias = Math.round((dateLimpo.getTime() - hojeLimpo.getTime()) / (1000 * 60 * 60 * 24));

  const diaSemana = DIAS_DA_SEMANA[date.getDay()];
  const dia = String(date.getDate()).padStart(2, "0");
  const mesNome = MESES[date.getMonth()];
  const diaEMes = `${dia} de ${mesNome}`;

  let tag: string | undefined = undefined;
  if (diffDias === 0) {
    tag = "HOJE";
  } else if (diffDias === 1) {
    tag = "AMANHÃ";
  }

  const textoCompleto = tag
    ? `${tag} • ${diaSemana}, ${diaEMes}`
    : `${diaSemana}, ${diaEMes}`;

  return { tag, diaSemana, diaEMes, textoCompleto };
}

export function formatarDataCurta(date: Date): string {
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = MESES[date.getMonth()].slice(0, 3);
  return `${dia}/${mes}`;
}

export function getDiasDoMes(ano: number, mesZeroIndexed: number): Date[] {
  const dias: Date[] = [];
  const totalDias = new Date(ano, mesZeroIndexed + 1, 0).getDate();
  for (let d = 1; d <= totalDias; d++) {
    dias.push(new Date(ano, mesZeroIndexed, d));
  }
  return dias;
}
