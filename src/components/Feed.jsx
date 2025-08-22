import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import UserCard from "./UserCard";
import UserCardShimmer from "./UserCardShimmer";
import { fetchFeed } from "../utils/redux/feedSlice";

const Feed = () => {
  const { feed, loading, error } = useSelector((state) => state.feed);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const hasFetched = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!hasFetched.current) {
        hasFetched.current = true; // ✅ prevents infinite loop
        try {
          await dispatch(fetchFeed()).unwrap();
        } catch (err) {
          if (err?.status === 401) {
            navigate("/");
          }
        }
      }
    };

    fetchData();
  }, [dispatch, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <UserCardShimmer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="alert alert-error shadow-lg w-full max-w-md">
          <span>{error}</span>
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
