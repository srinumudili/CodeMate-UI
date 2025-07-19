import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import UserCard from "./UserCard";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { addFeed } from "../utils/feedSlice";
import { useNavigate } from "react-router-dom";

const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const getFeed = async () => {
    if (feed && feed.length > 0) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(`${BASE_URL}/user/feed`, {
        withCredentials: true,
      });
      dispatch(addFeed(res.data?.users));
    } catch (error) {
      if (error?.response?.status === 401) {
        navigate("/");
      } else {
        const message =
          error?.response?.data?.message || "Failed to load feed.";
        setErrorMsg(message);
        console.error("Feed Fetch Error:", message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <span className="loading loading-bars loading-lg text-primary"></span>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="alert alert-error shadow-lg w-full max-w-md">
          <span>{errorMsg}</span>
        </div>
      </div>
    );
  }

  if (!feed || feed.length === 0) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <h1 className="text-xl text-gray-400 font-semibold">
          Your feed is empty.
        </h1>
      </div>
    );
  }

  return (
    <div className="flex justify-center p-4">
      <UserCard user={feed[0]} isFeedCard={true} />
    </div>
  );
};

export default Feed;
