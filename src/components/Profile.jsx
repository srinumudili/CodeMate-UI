import React from "react";
import { useSelector } from "react-redux";
import EditProfile from "./EditProfile";

const Profile = () => {
  const user = useSelector((store) => store.user);

  const isLoading = !user;

  return (
    <section className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center text-primary">
        Your Profile Settings
      </h1>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[50vh]">
          <span
            className="loading loading-spinner text-primary"
            role="status"
            aria-label="Loading your profile"
          ></span>
        </div>
      ) : (
        <EditProfile user={user} />
      )}
    </section>
  );
};

export default React.memo(Profile);
