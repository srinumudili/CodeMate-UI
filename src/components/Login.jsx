import React, { useState, useCallback, useMemo } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { addUser } from "../utils/userSlice";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  const validate = useCallback(() => {
    const { email, password } = formData;
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, emailRegex]);

  const handleChange = useCallback((e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setServerError("");
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validate()) return;

      setLoading(true);
      setServerError("");

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
          formData,
          {
            withCredentials: true,
          }
        );

        dispatch(addUser(res.data?.data));
        navigate("/");
      } catch (error) {
        const errorMsg =
          error?.response?.data?.message ||
          error?.response?.data ||
          "Login failed. Please try again.";
        setServerError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [formData, dispatch, navigate, validate]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-4">
      <div className="w-full max-w-sm shadow-xl bg-base-200 rounded-xl p-6">
        <h2 className="text-2xl font-semibold text-center text-primary mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* Email */}
          <div className="form-control mb-4">
            <label htmlFor="email" className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              className={`input input-bordered ${
                errors.email ? "input-error" : ""
              }`}
              value={formData.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="text-error text-sm mt-1">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-control mb-4">
            <label htmlFor="password" className="label">
              <span className="label-text">Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Enter your password"
                className={`input input-bordered w-full pr-12 ${
                  errors.password ? "input-error" : ""
                }`}
                value={formData.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <span className="text-error text-sm mt-1">{errors.password}</span>
            )}
          </div>

          {/* Server Error */}
          {serverError && (
            <p className="text-error text-sm text-center mb-2">{serverError}</p>
          )}

          {/* Submit */}
          <div className="form-control mt-4">
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={loading}
            >
              {loading && (
                <span className="loading loading-spinner loading-sm mr-2" />
              )}
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        {/* Signup Redirect */}
        <div className="mt-4 text-center">
          <p className="text-sm">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="text-primary hover:underline font-medium"
            >
              Signup
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
