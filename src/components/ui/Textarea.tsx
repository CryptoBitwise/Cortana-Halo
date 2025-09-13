import { cn } from "@/lib/utils";
import React from "react";

type Props = React.TextareaHTMLAttributes<HTMLTextAreaElement>;
export const Textarea = React.forwardRef<HTMLTextAreaElement, Props>(function T({ className, ...props }, ref) {
    return (
        <textarea
            ref={ref}
            className={cn(
                "w-full resize-none rounded-2xl border border-black/10 bg-white/70 p-3 outline-none ring-0 placeholder:text-neutral-400",
                className
            )}
            {...props}
        />
    );
});
