import { useMutation } from "@tanstack/react-query";
import { api } from "../instance";

/** Admin: link de redefinição de senha para mandar a quem esqueceu (vale 1 hora e uma vez só). */
export const useCreateResetLink = () =>
  useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post<{ link: string }>("/admin/password-reset-link", { email });
      return data.link;
    },
  });
