import { cn } from "@/lib/utils";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "ghost" };
export const Button: React.FC<Props> = ({ className, variant = "default", ...props }) => (
    <button
        className={cn(
            "rounded-2xl px-4 py-2 text-sm shadow-sm transition active:scale-95",
            variant === "default" && "bg-neutral-900 text-white hover:bg-neutral-800",
            variant === "ghost" && "bg-white/60 backdrop-blur border border-black/10 hover:bg-white",
            className
        )}
        {...props}
    />
);
