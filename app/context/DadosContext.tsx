"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Agendamento,
  DuplaInfo,
  Missionario,
  agruparDuplas,
} from "@/app/types/agendamento";
import { getAgendamentos } from "@/app/services/agendamentos";
import { getMissionarios } from "@/app/services/missionarios";

interface DadosContextValue {
  agendamentos: Agendamento[];
  missionarios: Missionario[];
  duplas: DuplaInfo[];
  /** true apenas enquanto ainda não há dados carregados */
  carregando: boolean;
  erro: string | null;
  /** Revalida em segundo plano, sem limpar os dados atuais */
  refresh: () => Promise<void>;
}

const DadosContext = createContext<DadosContextValue | null>(null);

/** Intervalo do polling de revalidação (apenas com a aba visível) */
const INTERVALO_REVALIDACAO_MS = 180000;

export function DadosProvider({ children }: { children: ReactNode }) {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [missionarios, setMissionarios] = useState<Missionario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const emAndamento = useRef<Promise<void> | null>(null);
  const temDados = useRef(false);

  const refresh = useCallback((): Promise<void> => {
    if (emAndamento.current) return emAndamento.current;

    // Sem dados ainda: mostra estado de carregamento (inclusive em "Tentar novamente")
    if (!temDados.current) {
      setCarregando(true);
      setErro(null);
    }

    const promessa = Promise.all([getAgendamentos(), getMissionarios()])
      .then(([agendamentosData, missionariosData]) => {
        temDados.current = true;
        setAgendamentos(agendamentosData);
        setMissionarios(missionariosData);
        setErro(null);
      })
      .catch((err) => {
        console.error(err);
        // Com dados em cache, falha de revalidação é silenciosa
        if (!temDados.current) {
          setErro("Não foi possível carregar a disponibilidade dos dias.");
        }
      })
      .finally(() => {
        setCarregando(false);
        emAndamento.current = null;
      });

    emAndamento.current = promessa;
    return promessa;
  }, []);

  // Carga inicial + revalidação silenciosa: ao voltar para a aba/janela e a cada
  // 3 min (só com a aba visível). Chamadas simultâneas são deduplicadas em refresh().
  useEffect(() => {
    void refresh();

    const aoMudarVisibilidade = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const aoFocar = () => {
      void refresh();
    };

    document.addEventListener("visibilitychange", aoMudarVisibilidade);
    window.addEventListener("focus", aoFocar);

    const intervalo = setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, INTERVALO_REVALIDACAO_MS);

    return () => {
      clearInterval(intervalo);
      document.removeEventListener("visibilitychange", aoMudarVisibilidade);
      window.removeEventListener("focus", aoFocar);
    };
  }, [refresh]);

  const duplas = useMemo(() => agruparDuplas(missionarios), [missionarios]);

  const value = useMemo(
    () => ({ agendamentos, missionarios, duplas, carregando, erro, refresh }),
    [agendamentos, missionarios, duplas, carregando, erro, refresh]
  );

  return <DadosContext.Provider value={value}>{children}</DadosContext.Provider>;
}

export function useDados(): DadosContextValue {
  const ctx = useContext(DadosContext);
  if (!ctx) {
    throw new Error("useDados deve ser usado dentro de DadosProvider");
  }
  return ctx;
}
