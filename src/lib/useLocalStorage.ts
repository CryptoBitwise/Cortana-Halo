import { useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initial: T) {
    const [val, setVal] = useState<T>(() => {
        if (typeof window === "undefined") return initial;
        const raw = localStorage.getItem(key);
        return raw ? (JSON.parse(raw) as T) : initial;
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            localStorage.setItem(key, JSON.stringify(val));
        }
    }, [key, val]);

    return [val, setVal] as const;
}
