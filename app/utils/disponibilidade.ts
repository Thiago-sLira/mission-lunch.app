import {
  Agendamento,
  Dupla,
  DuplaInfo,
  isDataDesabilitada,
} from "@/app/types/agendamento";

export interface DisponibilidadeDia {
  duplasLivres: Dupla[];
  duplasAgendadas: Dupla[];
  duplasDesabilitadas: Dupla[];
  /** Todas as duplas cadastradas estão com data_desabilitada */
  todasDesabilitadas: boolean;
  /** Nenhuma dupla livre */
  totalmenteOcupado: boolean;
}

/**
 * Calcula a disponibilidade das duplas para um dia (YYYY-MM-DD).
 * Livre = sem registro, ou registro sem nome_familia e não desabilitado.
 */
export function calcularDisponibilidadeDia(
  diaISO: string,
  agendamentos: Agendamento[],
  duplas: DuplaInfo[]
): DisponibilidadeDia {
  const registrosDoDia = agendamentos.filter(
    (a) => a.data && a.data.startsWith(diaISO)
  );

  const duplasLivres: Dupla[] = [];
  const duplasAgendadas: Dupla[] = [];
  const duplasDesabilitadas: Dupla[] = [];

  duplas.forEach((conf) => {
    const registro = registrosDoDia.find((a) => a.dupla === conf.id);
    if (registro) {
      if (isDataDesabilitada(registro.data_desabilitada)) {
        duplasDesabilitadas.push(conf.id);
      } else if (registro.nome_familia && registro.nome_familia.trim().length > 0) {
        duplasAgendadas.push(conf.id);
      } else {
        duplasLivres.push(conf.id);
      }
    } else {
      duplasLivres.push(conf.id);
    }
  });

  return {
    duplasLivres,
    duplasAgendadas,
    duplasDesabilitadas,
    todasDesabilitadas:
      duplas.length > 0 && duplasDesabilitadas.length === duplas.length,
    totalmenteOcupado: duplasLivres.length === 0,
  };
}
