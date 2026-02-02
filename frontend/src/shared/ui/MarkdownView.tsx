import ReactMarkdown from "react-markdown";

export function MarkdownView({ content }: { content: string }) {
  return (
    <div className="prose max-w-none prose-headings:font-semibold prose-a:text-brand-700 prose-a:underline hover:prose-a:text-brand-900 dark:prose-invert">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
