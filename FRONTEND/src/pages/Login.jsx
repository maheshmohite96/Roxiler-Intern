import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import RoleSelector from "../components/RoleSelector.jsx";
import { loginApi } from "../services/auth.js";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await loginApi({ email, password, role });
      if (role === "admin") window.location.assign("/admin");
      else if (role === "owner") window.location.assign("/store-owner");
      else window.location.assign("/user");
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-teal-50 to-emerald-200 p-4">
      <form
        className="relative bg-white/40 backdrop-filter backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-96 max-w-sm border border-white border-opacity-30 transform transition-transform duration-500 hover:scale-105"
        onSubmit={onSubmit}
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Login</h2>
        <RoleSelector role={role} onChange={setRole} includeAdmin={true} />
        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-3 mb-4 bg-white/70 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors duration-300"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full px-4 py-3 bg-white/70 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors duration-300 pr-12"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword(v => !v)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
            tabIndex={0}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M3.53 2.47a.75.75 0 1 0-1.06 1.06l2.063 2.062A12.303 12.303 0 0 0 1.5 12s3.75 7.5 10.5 7.5a10.7 10.7 0 0 0 5.028-1.257l3.442 3.442a.75.75 0 1 0 1.06-1.06l-18-18Zm7.31 8.37 2.32 2.32a2.25 2.25 0 0 1-2.32-2.32Zm3.9 3.9 2.54 2.54A9.2 9.2 0 0 1 12 18c-5.625 0-8.86-5.017-9.94-6.996a13.2 13.2 0 0 1 3.52-3.92l2.06 2.06A3.75 3.75 0 0 0 12 15.75a3.7 3.7 0 0 0 2.74-1.01Z" />
                <path d="M15.75 12c0-.216-.02-.426-.058-.63l3.716 3.716C21.243 13.236 22.5 12 22.5 12S18.75 4.5 12 4.5a10.7 10.7 0 0 0-3.18.49l2.025 2.026A3.75 3.75 0 0 1 15.75 12Z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                <path d="M12 5.25C18.75 5.25 22.5 12 22.5 12s-3.75 6.75-10.5 6.75S1.5 12 1.5 12 5.25 5.25 12 5.25Zm0 10.5a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" />
              </svg>
            )}
          </button>
        </div>
        {error && <p className="text-red-700 text-sm mb-2 text-center bg-red-100 p-2 rounded-lg">{error}</p>}
        <button
          type="submit"
          className="w-full bg-emerald-600 text-white px-4 py-3 rounded-full font-bold hover:bg-emerald-700 transition duration-300 ease-in-out shadow-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>
        <div className="mt-6 text-center">
          <a href="/register" className="text-gray-800 hover:underline font-semibold text-sm">Don't have an account? Register</a>
        </div>
      </form>
    </div>
  );
}
