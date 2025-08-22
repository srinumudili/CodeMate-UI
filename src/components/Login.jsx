import { useState, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { loginUser } from "../utils/redux/userSlice";
import { getSocket } from "../utils/socket";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, error: serverError } = useSelector((store) => store.user);

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
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validate()) return;

      try {
        await dispatch(loginUser(formData)).unwrap();
        // Initialize socket
        const socket = getSocket();
        if (socket && !socket.connected) socket.connect();

        navigate("/");
      } catch (err) {
        console.error(err);
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
            <label
              className={`input input-bordered flex items-center gap-2 ${
                errors.email ? "input-error" : ""
              }`}
            >
              <Mail size={18} className="text-base-content" />
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email"
                className="grow bg-transparent outline-none"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </label>
            {errors.email && (
              <span className="text-error text-sm mt-1">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-control mb-4">
            <label htmlFor="password" className="label">
              <span className="label-text">Password</span>
            </label>
            <label
              className={`input input-bordered flex items-center gap-2 pr-2 ${
                errors.password ? "input-error" : ""
              }`}
            >
              <Lock size={18} className="text-base-content" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                placeholder="Enter your password"
                className="grow bg-transparent outline-none"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </label>
            {errors.password && (
              <span className="text-error text-sm mt-1">{errors.password}</span>
            )}
          </div>

          {/* Server Error */}
          {serverError &&
            serverError !== "Failed to fetch user profile" &&
            serverError !== "Failed to fetch user" && (
              <p className="text-error text-sm text-center mb-2">
                {serverError}
              </p>
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

        {/* Signup Link */}
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
