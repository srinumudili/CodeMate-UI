import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Outlet } from "react-router-dom";
import axios from "axios";
import { addUser } from "./utils/userSlice";

const Header = lazy(() => import("./components/Header"));
const Footer = lazy(() => import("./components/Footer"));

function App() {
  const dispatch = useDispatch();
  const userData = useSelector((store) => store.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/profile/view`,
        {
          withCredentials: true,
        }
      );
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
  }, [dispatch, navigate]);

  useEffect(() => {
    if (!userData?._id) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [userData, fetchUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner text-primary w-12 h-12"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-base-200 text-base-content">
      {userData?._id && (
        <Suspense
          fallback={
            <div className="h-16 w-full bg-base-200 animate-pulse flex items-center px-4">
              <div className="w-32 h-6 bg-base-300 rounded-md"></div>
            </div>
          }
        >
          <Header />
        </Suspense>
      )}

      <main className="flex-grow">
        <Outlet />
      </main>

      {userData?._id && (
        <Suspense
          fallback={
            <div className="h-16 w-full bg-base-200 animate-pulse flex items-center justify-center">
              <div className="w-24 h-4 bg-base-300 rounded-md"></div>
            </div>
          }
        >
          <Footer />
        </Suspense>
      )}
    </div>
  );
}

export default App;
