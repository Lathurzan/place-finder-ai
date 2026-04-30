type Props = {
  name: string;
  description: string;
  category?: string;
  rating?: number;
  country?: string;
  imageUrl?: string;
  onClick?: () => void;
};

const PlaceCard = ({ name, description, category, rating, country, imageUrl, onClick }: Props) => {
  const LOCAL_FALLBACK = "/images/fallback.svg";
  return (
    <div
      onClick={onClick}
      className={`
        group flex flex-col
        bg-white dark:bg-[#0b1528]
        border border-gray-100 dark:border-white/[0.07]
        rounded-2xl overflow-hidden
        hover:border-emerald-400/40 dark:hover:border-emerald-500/30
        hover:shadow-lg hover:shadow-emerald-500/5
        transition-all duration-200
        ${onClick ? "cursor-pointer" : ""}
      `}
    >
      {/* Cover image or emoji fallback */}
      <div className="h-36 bg-gradient-to-br from-gray-50 to-white dark:from-white/[0.05] dark:to-white/[0.01] flex items-center justify-center text-5xl select-none border-b border-gray-100 dark:border-white/[0.06] relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              try {
                if (!target.dataset.attemptedFallback) {
                  target.dataset.attemptedFallback = '1';
                  const nameSafe = encodeURIComponent(name || 'travel');
                  const sourceFallback = `https://source.unsplash.com/800x600/?${nameSafe}`;
                  if (target.src !== sourceFallback) { target.src = sourceFallback; return; }
                }
              } catch {}
              target.src = LOCAL_FALLBACK;
            }}
          />
        ) : (
          <span>🗺️</span>
        )}
        {category && (
          <span className="absolute top-3 left-3 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 capitalize">
            {category}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div>
          <h3 className="text-[14px] font-semibold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors leading-snug">
            {name}
          </h3>
          {country && (
            <div className="flex items-center gap-1 mt-0.5 text-[12px] text-gray-400 dark:text-white/40">
              <svg className="w-3 h-3" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M10 2a6 6 0 00-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 00-6-6z"/>
                <circle cx="10" cy="8" r="2"/>
              </svg>
              {country}
            </div>
          )}
        </div>

        <p className="text-[12px] text-gray-500 dark:text-white/40 leading-relaxed line-clamp-2 flex-1">
          {description}
        </p>

        {rating !== undefined && (
          <div className="flex items-center gap-1.5 text-[12px]">
            <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.958a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.922-.755 1.688-1.54 1.118L10 14.347l-3.37 2.449c-.784.57-1.838-.196-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.744 9.385c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.958z"/>
            </svg>
            <span className="font-semibold text-amber-500">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;