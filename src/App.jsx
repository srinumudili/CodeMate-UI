import { lazy, Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { fetchUserProfile, clearError } from "./utils/redux/userSlice";
import { ToastProvider } from "./utils/context/ToastContext";
import { fetchConversations } from "./utils/redux/conversationSlice";
import SocketProvider from "./components/SocketProvider";

const Header = lazy(() => import("./components/Header"));
const Footer = lazy(() => import("./components/Footer"));

function App() {
  const dispatch = useDispatch();
  const userData = useSelector((store) => store.user.user);
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const publicPaths = ["/login", "/signup"];
      const isPublic = publicPaths.includes(location.pathname);

      // Skip fetching user profile for public paths
      if (isPublic) {
        dispatch(clearError());
        setLoading(false);
        return;
      }

      // Fetch user profile for protected paths
      try {
        await dispatch(fetchUserProfile()).unwrap();

        // Add a small delay to ensure socket connection is established
        // before fetching conversations
        setTimeout(async () => {
          try {
            await dispatch(fetchConversations({ page: 1, limit: 20 })).unwrap();
          } catch (convError) {
            console.warn("Failed to fetch conversations:", convError);
            // Don't fail the entire app if conversations fail
          }
          setLoading(false);
        }, 500);
      } catch (error) {
        setLoading(false);
        if (error?.status === 401) {
          navigate("/login", { replace: true });
        } else {
          navigate("/login", {
            replace: true,
            state: {
              message: "Unable to connect to server. Please try again later.",
            },
          });
        }
      }
    };

    fetchUser();
  }, [dispatch, navigate, location.pathname]);

  // Show loading spinner while checking auth or fetching user
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner text-primary w-12 h-12"></span>
      </div>
    );
  }

  return (
    <ToastProvider>
      {userData?._id ? (
        <SocketProvider>
          <div className="min-h-screen flex flex-col bg-base-200 text-base-content">
            <Suspense
              fallback={
                <div className="h-16 w-full bg-base-200 animate-pulse flex items-center px-4">
                  <div className="w-32 h-6 bg-base-300 rounded-md"></div>
                </div>
              }
            >
              <Header />
            </Suspense>

            <main className="flex-grow">
              <Outlet />
            </main>

            <Suspense
              fallback={
                <div className="h-16 w-full bg-base-200 animate-pulse flex items-center justify-center">
                  <div className="w-24 h-4 bg-base-300 rounded-md"></div>
                </div>
              }
            >
              <Footer />
            </Suspense>
          </div>
        </SocketProvider>
      ) : (
        <div className="min-h-screen flex flex-col bg-base-200 text-base-content">
          <main className="flex-grow">
            <Outlet />
          </main>
        </div>
      )}
    </ToastProvider>
  );
}

export default App;
