import { MessagesSquare } from "lucide-react";
import type { Chat } from "../../../api/queries/useGetChats";

const CHEVRON =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239aa6bc' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

interface ChatSelectProps {
  label: string;
  chats: Chat[] | undefined;
  value: string | null;
  onChange: (id: string) => void;
}

/** Seletor do chat ativo, usado no cabeçalho de Fluxos, Simulador, Aparência e Canais. */
export function ChatSelect({ label, chats, value, onChange }: ChatSelectProps) {
  return (
    <label className="relative flex h-10 items-center rounded-xl border border-border-ui bg-panel pl-3 shadow-card">
      <MessagesSquare size={16} className="shrink-0 text-text-secondary" aria-hidden="true" />
      <span className="sr-only">{label}</span>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-full min-w-44 cursor-pointer appearance-none bg-transparent pl-2 pr-9 text-[14px] font-semibold text-text-primary outline-none"
        style={{ backgroundImage: CHEVRON, backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundSize: "16px" }}
      >
        <option value="" disabled>
          Selecione um chat...
        </option>
        {chats?.map((chat) => (
          <option key={chat.id} value={chat.id}>
            {chat.name}
          </option>
        ))}
      </select>
    </label>
  );
}
