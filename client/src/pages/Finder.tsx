import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar";
import ImageUpload from "../components/ImageUpload";
import MapView from "../components/MapView";

const Finder = () => {
  const handleSearch = (query: string) => {
    console.log("Search:", query);
  };

  const handleUpload = (file: File) => {
    console.log("Image uploaded:", file);
  };

  return (
    <div>
      <Navbar />

      <div className="p-4 space-y-4">
        <SearchBar onSearch={handleSearch} />
        <ImageUpload onUpload={handleUpload} />
        <MapView />
      </div>
    </div>
  );
};

export default Finder;
