import { useState, useCallback, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { logoutUser } from "../utils/redux/userSlice";
import defaultAvatar from "../assets/defaultAvatar.jpg";
import ThemeToggle from "./ThemeToggle";
import { User, Users, UserPlus, LogOut } from "lucide-react";
import { HiOutlineChat } from "react-icons/hi";
import { getSocket } from "../utils/socket";
import { resetChatUI } from "../utils/redux/chatUISlice";

const Navbar = () => {
  const user = useSelector((store) => store.user.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const totalUnread = useSelector((store) => store.conversations.totalUnread);
  const handleLogout = useCallback(async () => {
    try {
      const socket = getSocket();
      if (socket) {
        socket.emit("logout");
        socket.disconnect();
      }
      dispatch(resetChatUI());
      await dispatch(logoutUser()).unwrap();
      navigate("/login");
      setDropdownOpen(false); // close dropdown
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Logout failed. Please try again.");
    }
  }, [dispatch, navigate]);

  const handleDropdownLinkClick = () => setDropdownOpen(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

        <NavLink
          to="/messages"
          className={({ isActive }) =>
            `btn btn-ghost btn-circle tooltip tooltip-bottom ${
              isActive ? "btn-primary" : ""
            }`
          }
          data-tip="Messages"
          onClick={(e) => e.currentTarget.blur()}
        >
          <HiOutlineChat className="w-6 h-6" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {totalUnread > 4 ? "4+" : totalUnread}
            </span>
          )}
        </NavLink>

        <span className="text-sm md:text-base text-gray-600">
          Hi, <span className="font-semibold capitalize">{user.firstName}</span>
        </span>

        {/* Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="btn btn-circle btn-ghost avatar hover:ring hover:ring-primary transition"
          >
            <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 overflow-hidden">
              <img
                alt="User Avatar"
                src={user.profileUrl || defaultAvatar}
                className="object-cover"
              />
            </div>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <ul className="absolute right-0 mt-3 p-2 w-56 bg-base-100 rounded-xl shadow-lg border border-base-200 z-50 flex flex-col gap-1">
              <li>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 p-2 rounded hover:bg-base-200"
                  onClick={handleDropdownLinkClick}
                >
                  <User size={18} />
                  <span>Profile</span>
                  <span className="badge badge-info ml-auto">New</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/connections"
                  className="flex items-center gap-2 p-2 rounded hover:bg-base-200"
                  onClick={handleDropdownLinkClick}
                >
                  <Users size={18} />
                  <span>Connections</span>
                </Link>
              </li>

              <li>
                <Link
                  to="/requests"
                  className="flex items-center gap-2 p-2 rounded hover:bg-base-200"
                  onClick={handleDropdownLinkClick}
                >
                  <UserPlus size={18} />
                  <span>Requests</span>
                </Link>
              </li>

              <li>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 p-2 rounded text-error hover:bg-base-200"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
