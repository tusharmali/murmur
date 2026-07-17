"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";

/**
 * Renders a message body as Markdown.
 *
 * Safety: react-markdown builds React elements (no dangerouslySetInnerHTML) and
 * raw HTML is NOT enabled, so message text can't inject markup. `urlTransform`
 * additionally restricts links/images to http(s) and data:image.
 */
function safeUrl(url: string): string {
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  if (/^data:image\//i.test(u)) return u;
  if (/^mailto:/i.test(u)) return u;
  return "";
}

export default function MessageBody({ text }: { text: string }) {
  return (
    <div className="murmur-md text-sm leading-relaxed text-lav-700 dark:text-lav-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        urlTransform={safeUrl}
        components={{
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-lav-600 underline decoration-lav-300 underline-offset-2 hover:text-lav-700 dark:text-lav-300 dark:hover:text-lav-100"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) =>
            src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <a href={String(src)} target="_blank" rel="noopener noreferrer">
                <img
                  src={String(src)}
                  alt={alt || ""}
                  loading="lazy"
                  className="my-1.5 max-h-80 max-w-full rounded-xl border border-lav-200 object-contain dark:border-night-border"
                />
              </a>
            ) : null,
          code: ({ className, children }) => {
            const isBlock = /language-/.test(className || "");
            if (isBlock) {
              return (
                <code className="block whitespace-pre overflow-x-auto text-[12.5px]">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-lav-100 px-1.5 py-0.5 text-[12.5px] text-lav-700 dark:bg-night-700 dark:text-lav-200">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-2 overflow-x-auto rounded-xl bg-lav-50 p-3 ring-1 ring-lav-200 dark:bg-night-800 dark:ring-night-border">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-1.5 border-l-2 border-lav-300 pl-3 text-lav-600 dark:border-lav-500 dark:text-lav-300">
              {children}
            </blockquote>
          ),
          ul: ({ children }) => <ul className="my-1 ml-5 list-disc space-y-0.5">{children}</ul>,
          ol: ({ children }) => <ol className="my-1 ml-5 list-decimal space-y-0.5">{children}</ol>,
          h1: ({ children }) => <p className="mt-1 text-base font-semibold">{children}</p>,
          h2: ({ children }) => <p className="mt-1 text-[15px] font-semibold">{children}</p>,
          h3: ({ children }) => <p className="mt-1 text-sm font-semibold">{children}</p>,
          table: ({ children }) => (
            <div className="my-2 overflow-x-auto">
              <table className="w-full border-collapse text-[12.5px]">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-lav-200 bg-lav-50 px-2 py-1 text-left font-semibold dark:border-night-border dark:bg-night-800">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-lav-200 px-2 py-1 dark:border-night-border">{children}</td>
          ),
          hr: () => <hr className="my-2 border-lav-200 dark:border-night-border" />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
