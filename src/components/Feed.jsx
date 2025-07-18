import React, { useEffect } from "react";
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

  const getFeed = async () => {
    if (feed) return;
    try {
      const res = await axios.get(`${BASE_URL}/user/feed`, {
        withCredentials: true,
      });
      dispatch(addFeed(res.data?.users));
    } catch (error) {
      if (error.response.status === 401) {
        navigate("/");
      }
      console.error(`Error : ${error.response.data}`);
    }
  };

  useEffect(() => {
    getFeed();
  }, []);

  return <>{feed && <UserCard user={feed[6]} />}</>;
};

export default Feed;
