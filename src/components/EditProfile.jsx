import React, { useState, useEffect } from "react";
import UserCard from "./UserCard";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

const EditProfile = ({ user }) => {
  const dispatch = useDispatch();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [age, setAge] = useState(0);
  const [gender, setGender] = useState("");
  const [about, setAbout] = useState("");

  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setProfileUrl(user.profileUrl || "");
      setAge(user.age || 0);
      setGender(user.gender || "");
      setAbout(user.about || "");
    }
  }, [user]);

  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => {
        setToast({ message: "", type: "success" });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  const saveProfile = async () => {
    try {
      const res = await axios.patch(
        `${BASE_URL}/profile/edit`,
        {
          firstName,
          lastName,
          profileUrl,
          age,
          gender,
          about,
        },
        { withCredentials: true }
      );
      dispatch(addUser(res?.data?.data));
      showToast("Profile updated successfully", "success");
    } catch (error) {
      console.error(error.response?.data || error.message);
      showToast("Something went wrong", "error");
    }
  };

  if (!user) return <p className="text-center mt-8">Loading user profile...</p>;

  return (
    <div className="flex flex-wrap justify-center gap-8 my-8 px-4 relative">
      {/* JSX Toast */}
      {toast.message && (
        <div className="toast toast-top toast-end z-50">
          <div
            className={`alert ${
              toast.type === "error" ? "bg-red-500" : "bg-green-500"
            } text-white`}
          >
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Form Card */}
      <div className="card bg-base-200 w-full md:w-96 p-4">
        <div className="card-body">
          <h2 className="card-title">Edit Profile</h2>

          <fieldset className="fieldset mb-2">
            <legend className="fieldset-legend">First Name</legend>
            <input
              type="text"
              className="input w-full"
              placeholder="Type here"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </fieldset>

          <fieldset className="fieldset mb-2">
            <legend className="fieldset-legend">Last Name</legend>
            <input
              type="text"
              className="input w-full"
              placeholder="Type here"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </fieldset>

          <fieldset className="fieldset mb-2">
            <legend className="fieldset-legend">Profile URL</legend>
            <input
              type="text"
              className="input w-full"
              placeholder="Type here"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
            />
          </fieldset>

          <fieldset className="fieldset mb-2">
            <legend className="fieldset-legend">Age</legend>
            <input
              type="number"
              className="input w-full"
              placeholder="Type here"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
            />
          </fieldset>

          {/* Gender Dropdown */}
          <fieldset className="fieldset mb-2">
            <legend className="fieldset-legend">Gender</legend>
            <select
              className="select select-bordered w-full"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
          </fieldset>

          <fieldset className="fieldset mb-2">
            <legend className="fieldset-legend">About</legend>
            <input
              type="text"
              className="input w-full"
              placeholder="Type here"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          </fieldset>

          <div className="card-actions justify-center">
            <button className="btn btn-primary" onClick={saveProfile}>
              Save Profile
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="w-full md:w-96">
        <UserCard
          user={{ firstName, lastName, profileUrl, age, gender, about }}
          isFeedCard={false}
        />
      </div>
    </div>
  );
};

export default EditProfile;
