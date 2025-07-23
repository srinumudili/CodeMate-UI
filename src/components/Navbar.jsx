import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import { removeUser } from "../utils/userSlice";

const Navbar = () => {
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post(`${BASE_URL}/logout`, {}, { withCredentials: true });
      dispatch(removeUser());
      navigate("/login");
    } catch (error) {
      console.error(
        "Logout failed:",
        error?.response?.data?.message || error.message
      );
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <div className="navbar bg-base-200 shadow-md px-4">
      <div className="flex-1">
        <Link
          to="/"
          className="btn btn-ghost normal-case text-2xl font-bold text-primary"
        >
          CodeMate
        </Link>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <span className="text-sm md:text-base">
            Hi, <span className="font-medium capitalize">{user.firstName}</span>
          </span>

          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  alt="User Avatar"
                  src={
                    user.profileUrl || "https://placehold.co/100x100?text=User"
                  }
                />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <Link to="/profile" className="justify-between">
                  Profile
                  <span className="badge badge-info">New</span>
                </Link>
              </li>
              <li>
                <Link to="/connections">Connections</Link>
              </li>
              <li>
                <Link to="/requests">Requests</Link>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
