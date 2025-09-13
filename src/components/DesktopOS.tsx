"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import RockOS from "@/components/RockOS";
import { Sun, Moon, MonitorCog, MessageSquare, Settings2 } from "lucide-react";
import { useLocalStorage } from "@/lib/useLocalStorage";

interface WindowState {
    id: string;
    title: string;
    z: number;
    x: number;
    y: number;
    w: number;
    h: number;
    open: boolean;
}

const defaultWin = (): WindowState => ({
    id: "rock",
    title: "Pet Rock",
    z: 1,
    x: 80,
    y: 80,
    w: 720,
    h: 560,
    open: true
});

export default function DesktopOS() {
    const [theme, setTheme] = useLocalStorage<"light" | "dark">("pro_theme", "light");
    const [wallpaper, setWallpaper] = useLocalStorage<string>("pro_wallpaper", "radial");
    const [rockWin, setRockWin] = useLocalStorage<WindowState>("pro_win_rock", defaultWin());
    const [zTop, setZTop] = useState(1);
    const deskRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme]);

    function focus(win: WindowState, set: (w: WindowState) => void) {
        const nz = zTop + 1;
        setZTop(nz);
        set({ ...win, z: nz });
    }

    function startDrag(e: React.PointerEvent, win: WindowState, set: (w: WindowState) => void) {
        (e.target as Element).setPointerCapture(e.pointerId);
        const startX = e.clientX, startY = e.clientY;
        const sX = win.x, sY = win.y;

        function onMove(ev: PointerEvent) {
            set({ ...win, x: sX + (ev.clientX - startX), y: sY + (ev.clientY - startY) });
        }
        function onUp(ev: PointerEvent) {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        }
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
    }

    const wallClass = wallpaper === "grid"
        ? "bg-[linear-gradient(90deg,rgba(0,0,0,.06)_1px,transparent_1px),linear-gradient(180deg,rgba(0,0,0,.06)_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[linear-gradient(90deg,rgba(255,255,255,.06)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,.06)_1px,transparent_1px)]"
        : wallpaper === "glass"
            ? "backdrop-blur bg-white/30 dark:bg-black/30"
            : "bg-neutral-100 dark:bg-neutral-950";

    return (
        <div ref={deskRef} className={`min-h-dvh ${wallClass} transition-colors`}>
            {/* Top bar */}
            <div className="flex items-center justify-between px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300">
                <div className="font-semibold">Pet Rock OS</div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                        title="Toggle theme"
                        className="px-2 py-1"
                    >
                        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={() => setWallpaper(wallpaper === 'radial' ? 'grid' : (wallpaper === 'grid' ? 'glass' : 'radial'))}
                        title="Change wallpaper"
                        className="px-2 py-1"
                    >
                        <MonitorCog className="h-4 w-4" />
                    </Button>
                    <a
                        className="rounded-xl border border-black/10 bg-white/60 px-2 py-1 backdrop-blur dark:bg-white/10"
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            setRockWin({ ...rockWin, open: true });
                            focus(rockWin, setRockWin);
                        }}
                    >
                        <MessageSquare className="inline-block mr-1 h-3.5 w-3.5" /> Open Rock
                    </a>
                </div>
            </div>

            {/* Windows */}
            {rockWin.open && (
                <div
                    className="absolute"
                    style={{ left: rockWin.x, top: rockWin.y, width: rockWin.w, height: rockWin.h, zIndex: rockWin.z }}
                    onPointerDown={() => focus(rockWin, setRockWin)}
                >
                    <Card className="h-full overflow-hidden shadow-2xl border border-black/10 dark:border-white/10">
                        {/* Title bar */}
                        <div
                            className="flex items-center justify-between gap-2 border-b border-black/5 bg-white/60 px-3 py-2 text-sm backdrop-blur dark:bg-white/10"
                            onPointerDown={(e) => startDrag(e, rockWin, setRockWin)}
                        >
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded-full bg-red-400" />
                                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                                <span className="h-3 w-3 rounded-full bg-green-400" />
                                <b className="ml-2">{rockWin.title}</b>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    className="px-2 py-1"
                                    onClick={() => setRockWin({ ...rockWin, open: false })}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                        {/* App content */}
                        <div className="h-[calc(100%-40px)] overflow-hidden">
                            <RockOS embed={true} />
                        </div>
                    </Card>
                </div>
            )}

            {/* Dock */}
            <div className="pointer-events-none fixed inset-x-0 bottom-4 flex justify-center">
                <div className="pointer-events-auto rounded-3xl border border-black/10 bg-white/70 px-3 py-2 shadow-xl backdrop-blur dark:bg-white/10">
                    <div className="flex items-end gap-3">
                        <DockIcon
                            label="Rock"
                            onClick={() => {
                                setRockWin({ ...rockWin, open: true });
                                focus(rockWin, setRockWin);
                            }}
                        />
                        <DockIcon
                            label="Settings"
                            onClick={() => alert("Aesthetic settings are in the top bar: theme & wallpaper.")}
                            icon={<Settings2 className="h-5 w-5" />}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function DockIcon({
    label,
    onClick,
    icon
}: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
}) {
    return (
        <button onClick={onClick} className="group flex flex-col items-center">
            <div className="rounded-2xl bg-gradient-to-b from-white to-neutral-100 p-3 shadow-sm border border-black/10 dark:from-neutral-900 dark:to-neutral-800 hover:scale-105 transition-transform">
                {icon ?? <MessageSquare className="h-5 w-5" />}
            </div>
            <span className="mt-1 text-xs text-neutral-700 dark:text-neutral-300 opacity-0 group-hover:opacity-100 transition">
                {label}
            </span>
        </button>
    );
}
