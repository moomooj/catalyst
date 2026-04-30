import Image from "next/image";
import { Playfair_Display, Raleway } from "next/font/google";

const playfair = Playfair_Display({ subsets: ["latin"], display: "swap" });
const raleway = Raleway({ subsets: ["latin"], display: "swap" });

interface DrinkCardProps {
  name: string;
  description: string;
  image: string;
  alcoholTypes: string[];
}

export default function DrinkCard({ name, description, image, alcoholTypes }: DrinkCardProps) {
  return (
    <div className="group relative flex flex-col space-y-4">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#EAE8E4]">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/5 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h3 className={`${playfair.className} text-xl md:text-2xl font-light text-[#303520]`}>
            {name}
          </h3>
          <span className={`${raleway.className} text-[10px] font-bold tracking-[0.2em] uppercase text-[#7C826F]/60`}>
            {alcoholTypes[0]}
          </span>
        </div>
        <p className={`${raleway.className} text-sm leading-relaxed text-[#7C826F] font-light line-clamp-2`}>
          {description}
        </p>
      </div>
    </div>
  );
}
