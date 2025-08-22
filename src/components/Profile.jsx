import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import EditProfile from "./EditProfile";
import { fetchUserProfile } from "../utils/redux/userSlice"; // <-- adjust import path

const Profile = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.user);

  // Fetch profile on mount if not loaded yet
  useEffect(() => {
    if (!user) {
      dispatch(fetchUserProfile());
    }
  }, [dispatch, user]);

  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {loading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <span
            className="loading loading-spinner text-primary"
            role="status"
            aria-label="Loading your profile"
          ></span>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 font-medium">
          Failed to load profile: {error}
        </div>
      ) : (
        <EditProfile user={user} />
      )}
    </section>
  );
};

export default React.memo(Profile);
