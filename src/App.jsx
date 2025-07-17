import { useDispatch, useSelector } from "react-redux";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { Outlet, useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "./utils/constants";
import { addUser } from "./utils/userSlice";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch();
  const userData = useSelector((store) => store.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      if (userData) return;
      try {
        const res = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
        });

        const user = res.data;
        dispatch(addUser(user));
      } catch (error) {
        if (error?.response?.status === 401) {
          navigate("/login");
        } else {
          console.error("Error fetching user", error);
        }
      }
    };
    fetchUser();
  }, [dispatch, navigate]);

  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
