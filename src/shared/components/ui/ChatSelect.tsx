import { MessagesSquare } from "../../icons";
import type { Chat } from "../../../api/queries/useGetChats";
import { Select } from "./Select";

interface ChatSelectProps {
  label: string;
  chats: Chat[] | undefined;
  value: string | null;
  onChange: (id: string) => void;
}

/** Seletor do chat ativo, usado no cabeçalho de Fluxos, Simulador, Aparência e Canais. */
export function ChatSelect({ label, chats, value, onChange }: ChatSelectProps) {
  return (
    <div className="relative flex h-10 items-center rounded-xl border border-border-ui bg-panel pl-3 shadow-card">
      <MessagesSquare size={16} className="shrink-0 text-text-secondary" aria-hidden="true" />
            <Select bare label={label} value={value ?? ""} placeholder="Selecione um chat..." onChange={onChange} options={(chats ?? []).map((chat) => ({ value: chat.id, label: chat.name }))} className="h-full w-44 bg-transparent pl-2 pr-2.5 text-[14px] font-semibold outline-none 2xl:w-56" />
    </div>
  );
}
