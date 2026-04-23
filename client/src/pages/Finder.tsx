
import MapView from "../components/MapView";
import AppLayout from "../layouts/AppLayout";

const Finder = () => {
  return (
    <AppLayout>
      <div className="p-4 pt-2 space-y-4">
        <MapView />
      </div>
    </AppLayout>
  );
};

export default Finder;
