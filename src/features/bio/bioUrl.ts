/** Endereço curto das bios, quando configurado (ex.: https://nxbio.vercel.app). Sem ele, /p/:slug no próprio painel. */
const BIO_URL: string | undefined = import.meta.env.VITE_BIO_URL?.replace(/\/$/, "");

export const bioUrl = (slug: string) => (BIO_URL ? `${BIO_URL}/${slug}` : `${window.location.origin}/p/${slug}`);
