export default function TailwindTest() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 dark:from-slate-900 dark:to-slate-800 p-10 space-y-8">
            <h1 className="text-4xl font-bold text-center text-neutral-800 dark:text-neutral-100">
                🧪 Tailwind Self-Check
            </h1>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-cyan-500"].map(c => (
                    <div key={c} className={`rounded-xl h-20 shadow ${c}`} />
                ))}
            </div>

            <div className="flex flex-col gap-3">
                <button className="px-4 py-2 rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 active:scale-95 transition">
                    Default Button
                </button>
                <input placeholder="Input field" className="px-4 py-2 rounded-xl border border-black/10 bg-white/80 backdrop-blur placeholder:text-neutral-400" />
                <textarea placeholder="Textarea" className="px-4 py-2 rounded-xl border border-black/10 bg-white/80 backdrop-blur placeholder:text-neutral-400" />
            </div>

            <p className="text-center text-sm text-neutral-600 dark:text-neutral-300">
                If you see colorful boxes, styled buttons/inputs, and gradients → Tailwind is working ✅
            </p>
        </main>
    );
}
