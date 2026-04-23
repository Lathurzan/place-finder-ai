import { useTheme } from "../context/ThemeContext";

const ThemeToggle: React.FC = () => {
  const { theme, toggle } = useTheme();
  return (
    <button
      aria-label="Toggle theme"
      onClick={toggle}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="
        w-[34px] h-[34px] flex items-center justify-center rounded-full
        border border-gray-200 dark:border-white/[0.12]
        bg-white dark:bg-white/[0.05]
        text-gray-500 dark:text-white/50
        hover:bg-gray-50 dark:hover:bg-white/[0.09]
        hover:border-gray-300 dark:hover:border-white/20
        transition-all duration-150
      "
    >
      {theme === "dark" ? (
        <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      ) : (
        <svg className="w-[15px] h-[15px]" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
