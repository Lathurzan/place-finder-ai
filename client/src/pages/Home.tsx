import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />
      <div className="text-center mt-20">
        <h1 className="text-4xl font-bold">Place Finder AI</h1>
        <button
          onClick={() => navigate("/finder")}
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
        >
          Start Searching
        </button>
      </div>
    </div>
  );
};

export default Home;
