import { useMutation } from "@tanstack/react-query";
import { api } from "../instance";

/** Envia a foto (data URL já reduzida) e devolve o endereço dela (/api/public/images/<id>). */
export const useUploadImage = () =>
  useMutation({
    mutationFn: async (data: string) => {
      const { data: res } = await api.post<{ url: string }>("/images", { data });
      return res.url;
    },
  });
