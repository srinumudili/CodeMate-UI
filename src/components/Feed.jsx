import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import UserCard from "./UserCard";
import UserCardShimmer from "./UserCardShimmer";

import { addFeed } from "../utils/feedSlice";

const Feed = () => {
  const feed = useSelector((state) => state.feed);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const getFeed = useCallback(async () => {
    if (feed && feed.length > 0) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/api/user/feed`,
        {
          withCredentials: true,
        }
      );
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
  }, [dispatch, feed, navigate]);

  useEffect(() => {
    getFeed();
  }, [getFeed]);

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <UserCardShimmer />
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
    <div className="flex justify-center p-4 min-h-[60vh]">
      <UserCard user={feed[0]} isFeedCard />
    </div>
  );
};

export default React.memo(Feed);
