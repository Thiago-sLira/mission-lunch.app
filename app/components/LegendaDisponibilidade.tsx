interface LegendaDisponibilidadeProps {
  textoIndisponivel: string;
  className?: string;
}

/** Cores das bolinhas, compartilhadas entre calendário e legendas */
export const COR_BOLINHA_DISPONIVEL = "bg-[#3B82D4]";
export const COR_BOLINHA_INDISPONIVEL = "bg-gray-300";

export default function LegendaDisponibilidade({
  textoIndisponivel,
  className = "",
}: LegendaDisponibilidadeProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-gray-600 ${className}`}
    >
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${COR_BOLINHA_DISPONIVEL}`}
        />
        Disponível para agendamento
      </span>
      <span className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className={`w-2.5 h-2.5 rounded-full shrink-0 ${COR_BOLINHA_INDISPONIVEL}`}
        />
        {textoIndisponivel}
      </span>
    </div>
  );
}
