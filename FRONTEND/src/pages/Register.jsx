import { useState } from "react";
import RoleSelector from "../components/RoleSelector.jsx";
import { registerApi } from "../services/auth.js";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ fullName: "", email: "", address: "", password: "", role: "user" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const user = await registerApi(form);
      if (user.role === "Owner") window.location.assign("/store-owner");
      else window.location.assign("/user");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 to-indigo-500 p-4">
      <form
        className="relative bg-white/30 backdrop-filter backdrop-blur-lg p-8 rounded-3xl shadow-2xl w-96 max-w-sm border border-white border-opacity-20 transform transition-transform duration-500 hover:scale-105"
        onSubmit={onSubmit}
      >
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Register</h2>
        <RoleSelector role={form.role} onChange={v => setForm({ ...form, role: v === "user" ? "User" : "Owner" })} />
        <input
          name="fullName"
          type="text"
          placeholder="Full Name (Min 20 chars)"
          className="w-full px-4 py-2 mb-4 bg-white/70 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-300"
          value={form.fullName}
          onChange={handleChange}
          minLength={20}
          maxLength={60}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 mb-4 bg-white/70 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-300"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          name="address"
          type="text"
          placeholder="Address"
          className="w-full px-4 py-2 mb-4 bg-white/70 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-300"
          value={form.address}
          onChange={handleChange}
          maxLength={400}
          required
        />
        <div className="relative mb-4">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Password (8-16 chars, 1 uppercase, 1 special)"
            className="w-full px-4 py-2 bg-white/70 border border-gray-300 rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors duration-300 pr-12"
            value={form.password}
            onChange={handleChange}
            minLength={8}
            maxLength={16}
            required
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword(v => !v)}
            className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-600 hover:text-gray-800 focus:outline-none"
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
          className="w-full bg-orange-600 text-white px-4 py-3 rounded-full font-bold hover:bg-orange-700 transition duration-300 ease-in-out shadow-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
}
