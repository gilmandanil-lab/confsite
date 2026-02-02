import { useTranslation } from "react-i18next";
import { PublicNewsItem } from "../../../shared/types";

type Props = {
  item: PublicNewsItem;
  onSelect?: (id: string) => void;
};

export function NewsItem({ item, onSelect }: Props) {
  const { i18n, t } = useTranslation();
  const date = item.publishedAt ? new Date(item.publishedAt) : null;
  const formatted = date
    ? new Intl.DateTimeFormat(i18n.language || "ru", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(date)
    : "";

  return (
    <article
      onClick={() => onSelect?.(item.id)}
      className="card cursor-pointer p-4 transition hover:-translate-y-[2px] hover:shadow-xl"
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">
        {formatted}
        {item.pinned ? (
          <span className="pill bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-100">
            {t("news.pinned")}
          </span>
        ) : null}
      </div>
      <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{item.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">{item.body}</p>
    </article>
  );
}
