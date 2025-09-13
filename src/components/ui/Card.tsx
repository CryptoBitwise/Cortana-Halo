import { cn } from "@/lib/utils";
import React from "react";

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
    <div className={cn("rounded-3xl border border-black/10 bg-white/70 backdrop-blur p-4 shadow", className)} {...props} />
);
