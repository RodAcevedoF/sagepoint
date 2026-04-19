export const slugToLabel: Record<string, string> = {
  "web-development": "Web Development",
  "mobile-development": "Mobile Development",
  "machine-learning": "Machine Learning",
  "data-science": "Data Science",
  devops: "DevOps",
  cybersecurity: "Cybersecurity",
  "cloud-computing": "Cloud Computing",
  databases: "Databases",
  "programming-languages": "Programming Languages",
  "system-design": "System Design",
  "artificial-intelligence": "Artificial Intelligence",
  "game-development": "Game Development",
  "ui-ux-design": "UI/UX Design",
  blockchain: "Blockchain & Web3",
  "software-testing": "Software Testing",
};

export const categoryImageFallback: Record<string, string> = {
  "web-development":
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=800",
  "mobile-development":
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80&w=800",
  "machine-learning":
    "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800",
  "data-science":
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
  devops:
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=800",
  cybersecurity:
    "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&q=80&w=800",
  "cloud-computing":
    "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800",
  databases:
    "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=800",
  "programming-languages":
    "https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&q=80&w=800",
  "system-design":
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
  "artificial-intelligence":
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
  "game-development":
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800",
  "ui-ux-design":
    "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800",
  blockchain:
    "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=800",
  "software-testing":
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
};

const GENERIC_FALLBACK =
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800";

export function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function resolveImage(
  imageUrl: string | null,
  categorySlug: string,
): string {
  return imageUrl ?? categoryImageFallback[categorySlug] ?? GENERIC_FALLBACK;
}
