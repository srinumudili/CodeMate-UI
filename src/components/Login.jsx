import axios from "axios";
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";

const Login = () => {
  const [email, setEmail] = useState("srinu@gmail.com");
  const [password, setPassword] = useState("Srinu@123");
  const [err, setErr] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post(
        `${BASE_URL}/login`,
        {
          email,
          password,
        },
        { withCredentials: true }
      );
      dispatch(addUser(res.data?.data));
      return navigate("/");
    } catch (error) {
      setErr(error.response?.data);
    }
  };
  return (
    <div className="card card-border bg-base-200 w-96 mx-auto my-4">
      <div className="card-body flex justify-center items-center">
        <h2 className="card-title">Login</h2>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Email</legend>
          <input
            type="text"
            className="input"
            placeholder="Type here"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </fieldset>
        <fieldset className="fieldset">
          <legend className="fieldset-legend">Password</legend>
          <input
            type="password"
            className="input"
            placeholder="Type here"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </fieldset>
        <div className="card-actions justify-end">
          <p className="text-red-600">{err}</p>
          <button className="btn btn-primary" onClick={() => handleLogin()}>
            Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
