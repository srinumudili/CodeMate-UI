import React, { useState, useEffect, useCallback } from "react";
import UserCard from "./UserCard";
import axios from "axios";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

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
    skills: "",
  });

  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(initialToast);
  const [loading, setLoading] = useState(false);

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
      newErrors.age = "Age must be 13 or older";
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
      showToast("Please fix the errors", "error");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      const res = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL}/api/profile/edit`,
        payload,
        { withCredentials: true }
      );

      dispatch(addUser(res.data.data));
      setErrors({});
      showToast("Profile updated successfully", "success");
    } catch (error) {
      console.error(error?.response?.data || error.message);
      showToast("Something went wrong", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="skeleton w-64 h-40 rounded-lg"></div>
      </div>
    );

  return (
    <div className="flex flex-wrap justify-center gap-8 my-8 px-4 relative">
      {/* Toast */}
      {toast.message && (
        <div className="toast toast-top toast-end z-50">
          <div
            className={`alert ${
              toast.type === "error" ? "alert-error" : "alert-success"
            } text-white gap-2`}
          >
            {toast.type === "error" ? (
              <FaExclamationCircle />
            ) : (
              <FaCheckCircle />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Profile Edit Form */}
      <div className="card bg-base-200 w-full md:w-96 shadow-md p-4">
        <div className="card-body space-y-3">
          <h2 className="card-title">Edit Profile</h2>

          {/* Inputs */}
          {[
            { label: "First Name", name: "firstName" },
            { label: "Last Name", name: "lastName" },
            { label: "Profile URL", name: "profileUrl" },
            { label: "Age", name: "age", type: "number" },
            { label: "About", name: "about" },
            { label: "Skills (comma separated)", name: "skills" },
          ].map(({ label, name, type = "text" }) => (
            <div className="form-control" key={name}>
              <label className="label">
                <span className="label-text">{label}</span>
              </label>
              <input
                type={type}
                name={name}
                className={`input input-bordered ${
                  errors[name] ? "input-error" : ""
                }`}
                placeholder={label}
                value={formData[name]}
                onChange={handleInputChange}
              />
              {errors[name] && (
                <span className="text-error text-sm mt-1">{errors[name]}</span>
              )}
            </div>
          ))}

          {/* Gender Dropdown */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Gender</span>
            </label>
            <select
              name="gender"
              className={`select select-bordered ${
                errors.gender ? "select-error" : ""
              }`}
              value={formData.gender}
              onChange={handleInputChange}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </select>
            {errors.gender && (
              <span className="text-error text-sm mt-1">{errors.gender}</span>
            )}
          </div>

          <div className="card-actions justify-center mt-4">
            <button
              className={`btn btn-primary w-full ${loading ? "loading" : ""}`}
              onClick={saveProfile}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div className="w-full md:w-96">
        <UserCard
          user={{
            ...formData,
            skills: formData.skills
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),
          }}
          isFeedCard={false}
        />
      </div>
    </div>
  );
});

export default EditProfile;
