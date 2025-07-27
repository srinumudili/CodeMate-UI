import React, { useState, useEffect, useCallback } from "react";
import UserCard from "./UserCard";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";

const initialToast = { message: "", type: "success" };

const EditProfile = React.memo(({ user }) => {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    profileUrl: "",
    age: "",
    gender: "",
    about: "",
    skills: "", // Comma-separated string for UI
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(initialToast);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        profileUrl: user.profileUrl || "",
        age: user.age || "",
        gender: user.gender || "",
        about: user.about || "",
        skills: user.skills?.join(", ") || "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (toast.message) {
      const timer = setTimeout(() => setToast(initialToast), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.profileUrl.trim())
      newErrors.profileUrl = "Profile URL is required";
    if (!formData.age || formData.age < 13)
      newErrors.age = "Valid age is required";
    if (!formData.gender.trim()) newErrors.gender = "Gender is required";
    if (!formData.about.trim()) newErrors.about = "About section is required";
    if (!formData.skills.trim()) newErrors.skills = "Skills are required";
    return newErrors;
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" ? +value : value,
    }));
  };

  const saveProfile = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      showToast("Please fix validation errors", "error");
      return;
    }

    try {
      const payload = {
        ...formData,
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill !== ""),
      };

      const res = await axios.patch(`${BASE_URL}/api/profile/edit`, payload, {
        withCredentials: true,
      });

      dispatch(addUser(res.data.data));
      showToast("Profile updated successfully", "success");
      setErrors({});
    } catch (error) {
      console.error(error?.response?.data || error.message);
      showToast("Something went wrong", "error");
    }
  };

  if (!user) return <p className="text-center mt-8">Loading user profile...</p>;

  return (
    <div className="flex flex-wrap justify-center gap-8 my-8 px-4 relative">
      {/* Toast Message */}
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

          {[
            { label: "First Name", name: "firstName" },
            { label: "Last Name", name: "lastName" },
            { label: "Profile URL", name: "profileUrl" },
            { label: "Age", name: "age", type: "number" },
            { label: "About", name: "about" },
            { label: "Skills (comma separated)", name: "skills" },
          ].map(({ label, name, type = "text" }) => (
            <fieldset className="fieldset mb-2" key={name}>
              <legend className="fieldset-legend">{label}</legend>
              <input
                name={name}
                type={type}
                className="input w-full"
                placeholder="Type here"
                value={formData[name]}
                onChange={handleInputChange}
              />
              {errors[name] && (
                <p className="text-error text-xs mt-1">{errors[name]}</p>
              )}
            </fieldset>
          ))}

          {/* Gender Select */}
          <fieldset className="fieldset mb-2">
            <legend className="fieldset-legend">Gender</legend>
            <select
              name="gender"
              className="select select-bordered w-full"
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
            {errors.gender && (
              <p className="text-error text-xs mt-1">{errors.gender}</p>
            )}
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
          user={{
            ...formData,
            skills: formData.skills.split(",").map((s) => s.trim()),
          }}
          isFeedCard={false}
        />
      </div>
    </div>
  );
});

export default EditProfile;
