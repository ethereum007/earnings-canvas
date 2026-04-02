export const getSignalColor = (signal: string | null) => {
  switch (signal) {
    case "STRONG_BUY": return "text-emerald bg-emerald-muted border-emerald/30";
    case "BUY": return "text-emerald bg-emerald-muted border-emerald/30";
    case "HOLD": return "text-amber bg-amber-muted border-amber/30";
    case "SELL": return "text-rose bg-rose-muted border-rose/30";
    case "STRONG_SELL": return "text-rose bg-rose-muted border-rose/30";
    default: return "text-muted-foreground bg-secondary border-border";
  }
};

export const getSignalLabel = (signal: string | null) => {
  if (!signal) return "N/A";
  return signal.replace("_", " ");
};

export const getSentimentColor = (score: number | null) => {
  if (score === null) return "text-muted-foreground";
  if (score >= 0.3) return "text-emerald";
  if (score >= -0.3) return "text-amber";
  return "text-rose";
};

export const getToneEmoji = (tone: string | null) => {
  switch (tone?.toLowerCase()) {
    case "confident": return "💪";
    case "optimistic": return "😊";
    case "cautious": return "🤔";
    case "defensive": return "🛡️";
    case "neutral": return "😐";
    case "pessimistic": return "😟";
    default: return "📊";
  }
};

export const getSentimentBarWidth = (score: number | null) => {
  if (score === null) return 50;
  return ((score + 1) / 2) * 100;
};
