interface DuplaPillProps {
  texto: string;
  livre: boolean;
}

/**
 * Pill de status de uma dupla em um dia.
 * Livre: azul/ativa com sufixo " - Livre".
 * Indisponível (agendada ou bloqueada): cinza, apenas os nomes.
 */
export default function DuplaPill({ texto, livre }: DuplaPillProps) {
  return (
    <span
      className={`text-xs px-2.5 py-1 rounded-md font-semibold border ${
        livre
          ? "bg-blue-50 text-[#1B2A6B] border-blue-200"
          : "bg-gray-100 text-gray-400 border-gray-200"
      }`}
    >
      {livre ? `${texto} - Livre` : texto}
    </span>
  );
}
