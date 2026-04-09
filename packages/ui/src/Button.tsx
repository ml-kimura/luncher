import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary";
} & ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  children,
  variant = "primary",
  style,
  ...props
}: ButtonProps) {
  const baseStyle: CSSProperties = {
    borderRadius: 8,
    border: "1px solid transparent",
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 600,
    padding: "8px 14px",
  };

  const variantStyle: Record<NonNullable<ButtonProps["variant"]>, CSSProperties> =
    {
      primary: {
        backgroundColor: "#111827",
        color: "#ffffff",
      },
      secondary: {
        backgroundColor: "#ffffff",
        borderColor: "#d1d5db",
        color: "#111827",
      },
    };

  return (
    <button {...props} style={{ ...baseStyle, ...variantStyle[variant], ...style }}>
      {children}
    </button>
  );
}
