import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorPage from "./components/ErrorPage.jsx";
import MainContainer from "./components/MainContainer.jsx";
import Login from "./components/Login.jsx";
import Profile from "./components/Profile.jsx";
import { Provider } from "react-redux";
import appStore from "./utils/appStore.js";
import Connections from "./components/Connections.jsx";
import Requests from "./components/Requests.jsx";
import SignUp from "./components/SignUp.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Chat from "./components/Chat.jsx";

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
        element: <Profile />,
      },
      {
        path: "/connections",
        element: <Connections />,
      },
      {
        path: "/requests",
        element: <Requests />,
      },
      {
        path: "/signup",
        element: <SignUp />,
      },
      {
        path: "/chat/:targetId",
        element: <Chat />,
      },
    ],
    errorElement: <ErrorPage />,
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={appStore}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>
);
