import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./components/ErrorPage.jsx";
import { Provider } from "react-redux";
import appStore from "./utils/redux/appStore.js";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Entry points - eager load
import MainContainer from "./components/MainContainer.jsx";
import Login from "./components/Login.jsx";

//Lazy-loaded Routes
const Profile = lazy(() => import("./components/Profile.jsx"));
const Connections = lazy(() => import("./components/Connections.jsx"));
const Requests = lazy(() => import("./components/Requests.jsx"));
const SignUp = lazy(() => import("./components/SignUp.jsx"));
const Chat = lazy(() => import("./components/Chat.jsx"));

// Suspense wrapper (for fallback loading state)
const withSuspense = (element) => (
  <Suspense
    fallback={
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <span className="loading loading-spinner text-primary w-10 h-10"></span>
      </div>
    }
  >
    {element}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: (
          <ProtectedRoute>
            <MainContainer />
          </ProtectedRoute>
        ),
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/profile",
        element: withSuspense(
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
      },
      {
        path: "/connections",
        element: withSuspense(
          <ProtectedRoute>
            <Connections />
          </ProtectedRoute>
        ),
      },
      {
        path: "/requests",
        element: withSuspense(
          <ProtectedRoute>
            <Requests />
          </ProtectedRoute>
        ),
      },
      {
        path: "/signup",
        element: withSuspense(<SignUp />),
      },
      {
        path: "/messages",
        element: withSuspense(<Chat />),
      },
    ],
    errorElement: <ErrorPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <Provider store={appStore}>
    <RouterProvider router={router} />
  </Provider>
);
