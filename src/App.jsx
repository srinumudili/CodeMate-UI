import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Outlet } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "./utils/constants";
import { addUser } from "./utils/userSlice";
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  const dispatch = useDispatch();
  const userData = useSelector((store) => store.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
        });
        dispatch(addUser(res.data));
      } catch (error) {
        if (error?.response?.status === 401) {
          navigate("/login");
        } else {
          console.error("Error fetching user:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if Redux doesn't already have user
    if (!userData) fetchUser();
    else setLoading(false);
  }, [dispatch, navigate, userData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner text-primary w-12 h-12"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg- text-base-content">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default App;
