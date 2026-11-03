"use client";

import { useMemo } from "react";
import { useDados } from "@/app/context/DadosContext";
import { formatarDataISO, getDiasDoMes, MESES } from "@/app/utils/date";
import { calcularDisponibilidadeDia } from "@/app/utils/disponibilidade";
import LegendaDisponibilidade, {
  COR_BOLINHA_DISPONIVEL,
  COR_BOLINHA_INDISPONIVEL,
} from "@/app/components/LegendaDisponibilidade";

const DIAS_SEMANA_CURTO = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

interface CalendarioMensalProps {
  onClick: () => void;
}

export default function CalendarioMensal({ onClick }: CalendarioMensalProps) {
  const { agendamentos, duplas, carregando, erro } = useDados();

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const hojeISO = formatarDataISO(hoje);

  const dias = useMemo(() => {
    const diasDoMes = getDiasDoMes(ano, mes);
    return diasDoMes.map((dia) => {
      const diaISO = formatarDataISO(dia);
      const passado = diaISO < hojeISO;
      const disponivel =
        !passado &&
        calcularDisponibilidadeDia(diaISO, agendamentos, duplas).duplasLivres
          .length > 0;
      return { dia: dia.getDate(), diaISO, disponivel };
    });
  }, [ano, mes, hojeISO, agendamentos, duplas]);

  // Células vazias antes do dia 1 (0 = domingo)
  const deslocamento = new Date(ano, mes, 1).getDay();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`Calendário de ${MESES[mes]} ${ano}. Toque para agendar um almoço`}
      className="w-full min-w-0 bg-white rounded-2xl border border-gray-200/90 shadow-sm p-4 flex flex-col gap-3 cursor-pointer transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B2A6B]"
    >
      <h3 className="text-center text-lg font-bold text-[#1B2A6B] tracking-tight">
        {MESES[mes]} {ano}
      </h3>

      {carregando ? (
        <div
          role="status"
          aria-label="Carregando calendário"
          className="flex items-center justify-center py-16"
        >
          <span className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#1B2A6B] animate-spin" />
        </div>
      ) : erro ? (
        <p className="py-10 text-center text-sm text-gray-500">
          Não foi possível carregar a disponibilidade.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-y-1 text-center">
            {DIAS_SEMANA_CURTO.map((d) => (
              <span
                key={d}
                className="text-[11px] font-semibold uppercase text-gray-500 pb-1"
              >
                {d}
              </span>
            ))}

            {Array.from({ length: deslocamento }).map((_, i) => (
              <span key={`vazio-${i}`} />
            ))}

            {dias.map(({ dia, diaISO, disponivel }) => {
              const ehHoje = diaISO === hojeISO;
              return (
                <div
                  key={diaISO}
                  className="flex flex-col items-center gap-0.5 py-1"
                >
                  <span
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold ${
                      ehHoje
                        ? "ring-2 ring-[#1B2A6B] text-[#1B2A6B]"
                        : "text-gray-900"
                    }`}
                  >
                    {dia}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`w-2 h-2 rounded-full ${
                      disponivel
                        ? COR_BOLINHA_DISPONIVEL
                        : COR_BOLINHA_INDISPONIVEL
                    }`}
                  />
                </div>
              );
            })}
          </div>

          <LegendaDisponibilidade
            textoIndisponivel="Almoço agendado ou indisponível"
            className="pt-1"
          />
        </>
      )}

      <p className="text-center text-xs text-gray-500">
        📅 Toque no calendário para agendar
      </p>
    </div>
  );
}
