type Props = {
  onSearch: (query: string) => void;
};

const SearchBar = ({ onSearch }: Props) => {
  return (
    <input
      type="text"
      placeholder="Search places..."
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onSearch((e.target as HTMLInputElement).value);
        }
      }}
      className="p-2 border rounded w-full"
    />
  );
};

export default SearchBar;
