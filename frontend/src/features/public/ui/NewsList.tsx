import { PublicNewsItem } from "../../../shared/types";
import { NewsItem } from "./NewsItem";

type Props = {
  items: PublicNewsItem[];
  onSelect: (id: string) => void;
};

export function NewsList({ items, onSelect }: Props) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((n) => (
        <NewsItem key={n.id} item={n} onSelect={onSelect} />
      ))}
    </div>
  );
}
