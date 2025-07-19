import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const SignUp = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setLoading(true);
    setServerError("");

    try {
      const res = await axios.post(
        `${BASE_URL}/signup`,
        { firstName, lastName, email, password },
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
        >
          {/* First Name */}
          <div className="form-control mb-3">
            <label className="label">
              <span className="label-text">First Name</span>
            </label>
            <input
              type="text"
              className={`input input-bordered w-full ${
                errors.firstName ? "input-error" : ""
              }`}
              placeholder="Enter your first name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
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
              className={`input input-bordered w-full ${
                errors.lastName ? "input-error" : ""
              }`}
              placeholder="Enter your last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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
              className={`input input-bordered w-full ${
                errors.email ? "input-error" : ""
              }`}
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && (
              <span className="text-error text-sm mt-1">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-control mb-1">
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              type="password"
              className={`input input-bordered w-full ${
                errors.password ? "input-error" : ""
              }`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {errors.password && (
              <span className="text-error text-sm mt-1">{errors.password}</span>
            )}
          </div>

          {/* Server-side error */}
          {serverError && (
            <p className="text-error text-sm text-center mt-2">{serverError}</p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary w-full mt-4"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        {/* Link to login */}
        <p className="text-center mt-4 text-sm">
          Already have a profile?{" "}
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
