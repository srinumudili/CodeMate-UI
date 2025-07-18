import React, { useState } from "react";
import UserCard from "./UserCard";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [profileUrl, setProfileUrl] = useState(user.profileUrl);
  const [age, setAge] = useState(user.age);
  const [gender, setGender] = useState(user.gender);
  const [about, setAbout] = useState(user.about);

  const dispatch = useDispatch();

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
    } catch (error) {
      console.error(error.response.data);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-8 my-8 px-4">
      <div className="card bg-base-200 w-full md:w-96 p-4">
        <div className="card-body">
          <h2 className="card-title">Edit Profile</h2>
          <fieldset className="fieldset mb-2">
            <legend className="fieldset-legend">FirstName</legend>
            <input
              type="text"
              className="input w-full"
              placeholder="Type here"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </fieldset>
          <fieldset className="fieldset mb-2">
            <legend className="fieldset-legend">LastName</legend>
            <input
              type="text"
              className="input w-full"
              placeholder="Type here"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </fieldset>
          <fieldset className="fieldset mb-2">
            <legend className="fieldset-legend">ProfileUrl</legend>
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
              type="text"
              className="input w-full"
              placeholder="Type here"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </fieldset>
          <fieldset className="fieldset mb-2">
            <legend className="fieldset-legend">Gender</legend>
            <input
              type="text"
              className="input w-full"
              placeholder="Type here"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            />
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
            <button className="btn btn-primary" onClick={() => saveProfile()}>
              Save Profile
            </button>
          </div>
        </div>
      </div>
      <div className="w-full md:w-96">
        <UserCard
          user={{ firstName, lastName, profileUrl, age, gender, about }}
        />
      </div>
    </div>
  );
};

export default EditProfile;
