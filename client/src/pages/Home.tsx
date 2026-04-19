import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { mockPlaces } from "../mockData";

const Home = () => {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(Boolean(localStorage.getItem("mock_auth")));
  }, []);

  return (
    <div>
      <Navbar />
      <div className="text-center mt-8 px-4">
        <h1 className="text-4xl font-bold">Place Finder AI</h1>
        {!loggedIn ? (
          <div className="mt-4 space-x-2">
            <button onClick={() => navigate('/login')} className="bg-emerald-400 text-[#022c22] px-4 py-2 rounded">Login</button>
            <button onClick={() => navigate('/register')} className="bg-white/6 text-white px-4 py-2 rounded">Register</button>
          </div>
        ) : (
          <>
            <p className="mt-4 text-gray-300">Welcome back — here are some sample places:</p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 px-4">
              {mockPlaces.map((p) => (
                <div key={p.id} className="bg-[#0b1726] rounded-xl overflow-hidden border border-white/6">
                  <img src={p.image} alt={p.title} className="w-full h-40 object-cover" />
                  <div className="p-3">
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="text-sm text-gray-400">{p.city}</p>
                    <p className="mt-2 text-xs text-gray-300">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
