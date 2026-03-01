import Image from "next/image";

export function OptimizedImageExample() {
  return (
    <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-border/60">
      <Image
        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa"
        alt="Illustration d'un tableau de bord"
        fill
        priority
        sizes="(max-width: 768px) 100vw, 900px"
        className="object-cover"
      />
    </div>
  );
}
