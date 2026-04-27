import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/**
 * Editorial markdown renderer. Dark-mode prose styles inline so we don't
 * depend on @tailwindcss/typography.
 */
export default function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "max-w-none text-sm leading-relaxed text-zinc-300",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="my-3 first:mt-0 last:mb-0">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="text-white font-medium">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-zinc-200 italic">{children}</em>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 underline-offset-2 hover:underline"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="my-3 space-y-1.5 pl-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="my-3 space-y-1.5 pl-5 list-decimal">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="flex gap-2 before:content-['•'] before:text-zinc-600 before:flex-shrink-0">
              <span className="flex-1">{children}</span>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-4 border-l-2 border-emerald-400/40 pl-4 text-zinc-300 italic">
              {children}
            </blockquote>
          ),
          h2: ({ children }) => (
            <h3 className="mt-6 mb-2 text-base font-medium text-white">
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4 className="mt-5 mb-2 text-sm font-medium text-white">
              {children}
            </h4>
          ),
          code: ({ children }) => (
            <code className="px-1 py-0.5 rounded bg-white/5 text-emerald-300 text-[13px]">
              {children}
            </code>
          ),
          hr: () => <hr className="my-6 border-white/5" />,
          table: ({ children }) => (
            <div className="my-4 overflow-x-auto rounded-lg border border-white/5">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-zinc-900 text-[10px] uppercase tracking-wider text-zinc-500">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left font-medium">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 border-t border-white/5">{children}</td>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
