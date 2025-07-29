import axios from "axios";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { removeUser } from "../utils/userSlice";
import defaultAvatar from "../assets/defaultAvatar.jpg";
import ThemeToggle from "./ThemeToggle";

import { User, Users, UserPlus, LogOut } from "lucide-react"; // Lucide icons

const Navbar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = useCallback(async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );
      dispatch(removeUser());
      navigate("/login");
    } catch (error) {
      console.error(
        "Logout failed:",
        error?.response?.data?.message || error.message
      );
      alert("Logout failed. Please try again.");
    }
  }, [dispatch, navigate]);

  if (!user) return null;

  return (
    <div className="navbar bg-base-100 shadow-md px-4 py-2 backdrop-blur-md border-b border-base-200">
      <div className="flex-1">
        <Link
          to="/"
          className="text-2xl font-bold text-primary hover:opacity-90 transition-opacity"
        >
          CodeMate
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />

        <span className="text-sm md:text-base text-gray-600">
          Hi, <span className="font-semibold capitalize">{user.firstName}</span>
        </span>

        <div className="dropdown dropdown-end">
          <label
            tabIndex={0}
            className="btn btn-circle btn-ghost avatar hover:ring hover:ring-primary transition"
          >
            <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
              <img
                alt="User Avatar"
                src={user.profileUrl || defaultAvatar}
                className="object-cover"
              />
            </div>
          </label>

          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 z-[50] p-2 shadow-lg bg-base-100 rounded-xl w-56 border border-base-200"
          >
            <li>
              <Link to="/profile" className="flex items-center gap-2">
                <User size={18} />
                <span>Profile</span>
                <span className="badge badge-info ml-auto">New</span>
              </Link>
            </li>

            <li>
              <Link to="/connections" className="flex items-center gap-2">
                <Users size={18} />
                <span>Connections</span>
              </Link>
            </li>

            <li>
              <Link to="/requests" className="flex items-center gap-2">
                <UserPlus size={18} />
                <span>Requests</span>
              </Link>
            </li>

            <li>
              <button
                onClick={handleLogout}
                className="text-error flex items-center gap-2"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
