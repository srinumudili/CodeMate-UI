import axios from "axios";
import React, { useState, useMemo, useCallback } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const emailRegex = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/, []);

  const validate = useCallback(() => {
    const newErrors = {};
    const { firstName, lastName, email, password, confirmPassword } = form;

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";

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

    if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form, emailRegex]);

  const handleChange = useCallback((e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setServerError("");
  }, []);

  const handleSignUp = async () => {
    if (!validate()) return;

    setLoading(true);
    setServerError("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`,
        {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        },
        { withCredentials: true }
      );

      dispatch(addUser(res.data?.data));
      navigate("/profile");
    } catch (error) {
      const errorMsg = error?.response?.data || "Signup failed";
      setServerError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-100 px-4">
      <div className="w-full max-w-md bg-base-200 backdrop-blur-lg bg-opacity-70 shadow-2xl rounded-2xl p-8 border border-base-300">
        <h2 className="text-3xl font-bold text-center text-primary mb-6">
          Sign Up
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSignUp();
          }}
          noValidate
        >
          {/* First Name */}
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">First Name</span>
            </label>
            <input
              type="text"
              name="firstName"
              className={`input input-bordered w-full ${
                errors.firstName ? "input-error" : ""
              }`}
              placeholder="Enter your first name"
              value={form.firstName}
              onChange={handleChange}
            />
            {errors.firstName && (
              <span className="text-error text-sm mt-1">
                {errors.firstName}
              </span>
            )}
          </div>

          {/* Last Name */}
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Last Name</span>
            </label>
            <input
              type="text"
              name="lastName"
              className={`input input-bordered w-full ${
                errors.lastName ? "input-error" : ""
              }`}
              placeholder="Enter your last name"
              value={form.lastName}
              onChange={handleChange}
            />
            {errors.lastName && (
              <span className="text-error text-sm mt-1">{errors.lastName}</span>
            )}
          </div>

          {/* Email */}
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              name="email"
              className={`input input-bordered w-full ${
                errors.email ? "input-error" : ""
              }`}
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && (
              <span className="text-error text-sm mt-1">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className={`input input-bordered w-full pr-10 ${
                  errors.password ? "input-error" : ""
                }`}
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-2 flex items-center text-sm text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {errors.password && (
              <span className="text-error text-sm mt-1">{errors.password}</span>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              className={`input input-bordered w-full ${
                errors.confirmPassword ? "input-error" : ""
              }`}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <span className="text-error text-sm mt-1">
                {errors.confirmPassword}
              </span>
            )}
          </div>

          {/* Server-side error */}
          {serverError && (
            <p className="text-error text-sm text-center mt-2">{serverError}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary w-full mt-4"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        {/* Login Link */}
        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-primary hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
