export type Mood = "Stoic" | "Pebbly" | "Cranky" | "Zen" | "Sleepy" | "Geode-Curious";

export function randomMood(): Mood {
    const moods: Mood[] = ["Stoic", "Pebbly", "Cranky", "Zen", "Sleepy", "Geode-Curious"];
    return moods[Math.floor(Math.random() * moods.length)];
}

export function moodTooltip(m: Mood): string {
    switch (m) {
        case "Stoic": return "As solid as ever.";
        case "Pebbly": return "Small joys, small stones.";
        case "Cranky": return "Don't take it for granite.";
        case "Zen": return "Be like water; I'll be like rock.";
        case "Sleepy": return "Power-saving mode engaged.";
        case "Geode-Curious": return "If ignored, may crystallize.";
    }
}
