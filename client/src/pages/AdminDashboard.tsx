import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [tab, setTab] = useState("users");

  useEffect(() => {
    axios.get("/api/admin/users", { withCredentials: true }).then(res => setUsers(res.data));
    axios.get("/api/admin/plans", { withCredentials: true }).then(res => setPlans(res.data));
    axios.get("/api/admin/places", { withCredentials: true }).then(res => setPlaces(res.data));
    axios.get("/api/admin/analytics", { withCredentials: true }).then(res => setAnalytics(res.data));
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab("users")} className={tab === "users" ? "font-bold underline" : ""}>Users</button>
        <button onClick={() => setTab("plans")} className={tab === "plans" ? "font-bold underline" : ""}>Plans</button>
        <button onClick={() => setTab("places")} className={tab === "places" ? "font-bold underline" : ""}>Places</button>
        <button onClick={() => setTab("analytics")} className={tab === "analytics" ? "font-bold underline" : ""}>Analytics</button>
      </div>
      {tab === "users" && (
        <div>
          <h2 className="font-semibold mb-2">Users</h2>
          <table className="w-full border mb-6">
            <thead><tr><th>ID</th><th>Email</th><th>Plan</th><th>Joined</th></tr></thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id}><td>{u.id}</td><td>{u.email}</td><td>{u.plan}</td><td>{new Date(u.created_at).toLocaleDateString()}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === "plans" && (
        <div>
          <h2 className="font-semibold mb-2">Plans</h2>
          <table className="w-full border mb-6">
            <thead><tr><th>ID</th><th>Name</th><th>Users</th></tr></thead>
            <tbody>
              {plans.map((p: any) => (
                <tr key={p.id}><td>{p.id}</td><td>{p.name}</td><td>{p.user_count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === "places" && (
        <div>
          <h2 className="font-semibold mb-2">Places</h2>
          <table className="w-full border mb-6">
            <thead><tr><th>ID</th><th>Name</th><th>Reviews</th></tr></thead>
            <tbody>
              {places.map((p: any) => (
                <tr key={p.id}><td>{p.id}</td><td>{p.name}</td><td>{p.review_count}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === "analytics" && analytics && (
        <div>
          <h2 className="font-semibold mb-2">Usage Analytics</h2>
          <div className="mb-2">Total Users: {analytics.total_users}</div>
          <div className="mb-2">Total Bookmarks: {analytics.total_bookmarks}</div>
          <div className="mb-2">Popular Places: {analytics.popular_places?.join(', ')}</div>
          <div className="mb-2">Active Users (last 7d): {analytics.active_users_7d}</div>
        </div>
      )}
    </div>
  );
}
