/**
 * Ícones do Nexo: MingCute Icon (https://www.mingcute.com, licença Apache 2.0), com traço arredondado no estilo
 * dos ícones do iPhone. Cada ícone tem o contorno (padrão) e o preenchido (`filled`), usado no item ativo do menu.
 *
 * GERADO por um script a partir de @iconify-json/mingcute: para incluir um ícone, adicione o nome no mapa do
 * script e gere de novo (ver docs/ICONES.md no repositório nexo). Os nomes seguem os do Lucide, que o Nexo usava antes.
 */
import { forwardRef, type ForwardRefExoticComponent, type RefAttributes, type SVGProps } from "react";

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "ref" | "dangerouslySetInnerHTML"> {
  size?: number | string;
  /** Aceito por compatibilidade; a MingCute tem traço fixo. */
  strokeWidth?: number | string;
  /** Versão preenchida (item ativo). */
  filled?: boolean;
}

export type IconComponent = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;

export function icon(name: string, line: string, fill: string): IconComponent {
  const Icon = forwardRef<SVGSVGElement, IconProps>(function Icon({ size = 24, strokeWidth, filled = false, className, ...rest }, ref) {
    void strokeWidth;
    return (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden={rest["aria-label"] ? undefined : true}
        focusable="false"
        className={className ? `nx-icon ${className}` : "nx-icon"}
        {...rest}
        dangerouslySetInnerHTML={{ __html: filled ? fill : line }}
      />
    );
  });
  Icon.displayName = name;
  return Icon;
}

