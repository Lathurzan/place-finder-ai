import { Routes, Route } from "react-router-dom";
// ...existing code...
import Finder from "./pages/Finder";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Settings from "./pages/Setting";
import Itineraries from "./pages/Itineraries";
import Explore from "./pages/Explore";
import Bookmarks from "./pages/Bookmarks";
import Success from "./pages/Success";
import Checkout from "./pages/Checkout";
import Recommendations from "./pages/Recommendations";

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
  <Route path="/finder" element={<Finder />} />
  <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/itineraries" element={<Itineraries />} />
      <Route path="/explore" element={<Explore />} />
      <Route path="/bookmarks" element={<Bookmarks />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/success" element={<Success />} />
  <Route path="/recommendations" element={<Recommendations />} />
    </Routes>
  );
};

export default AppRoutes;
