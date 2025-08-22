import React, { useState, useEffect, useCallback, useContext } from "react";
import UserCard from "./UserCard";
import { useDispatch } from "react-redux";
import { User, Camera, Save, Eye, Upload } from "lucide-react";
import { uploadProfileImage } from "../utils/redux/uploadSlice";
import { updateProfile } from "../utils/redux/userSlice";
import ToastContext from "../utils/context/ToastContext";

const EditProfile = React.memo(({ user }) => {
  const dispatch = useDispatch();

  const { showToast } = useContext(ToastContext);

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
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [imagePreview, setImagePreview] = useState(null);

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
      setImagePreview(user.profileUrl || null);
    }
  }, [user]);

  // Enhanced validation with more comprehensive rules
  const validateField = useCallback((name, value) => {
    switch (name) {
      case "firstName":
      case "lastName":
        if (!value.trim())
          return `${name === "firstName" ? "First" : "Last"} name is required`;
        if (!/^[a-zA-Z\s]+$/.test(value))
          return "Only alphabetic characters are allowed";
        if (value.length < 2) return "Must be at least 2 characters";
        if (value.length > 50) return "Must be less than 50 characters";
        return "";

      case "age":
        if (!value) return "Age is required";
        {
          const age = parseInt(value);
          if (isNaN(age) || age < 13 || age > 120)
            return "Age must be between 13 and 120";
          return "";
        }

      case "about":
        if (!value.trim()) return "About section is required";
        if (value.length < 10)
          return "About section must be at least 10 characters";
        if (value.length > 500)
          return "About section must be less than 500 characters";
        return "";

      case "skills": {
        if (!value.trim()) return "Skills are required";
        const skillsArray = value
          .split(",")
          .map((skill) => skill.trim())
          .filter((skill) => skill);
        if (skillsArray.length === 0) return "At least one skill is required";
        if (skillsArray.length !== value.split(",").length)
          return "Remove empty skills";
        if (skillsArray.some((skill) => skill.length < 2))
          return "Each skill must be at least 2 characters";
        if (skillsArray.length > 20) return "Maximum 20 skills allowed";
        return "";
      }
      case "gender":
        if (!value) return "Gender is required";
        return "";

      default:
        return "";
    }
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      if (key !== "profileUrl") {
        const error = validateField(key, formData[key]);
        if (error) newErrors[key] = error;
      }
    });
    return newErrors;
  }, [formData, validateField]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === "age" ? value : value;

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    // Real-time validation
    const error = validateField(name, processedValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleProfileImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // validations omitted here for brevity
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast("File size must be less than 5MB", "error");
      setErrors((prev) => ({
        ...prev,
        image: "File size must be less than 5MB",
      }));
      return;
    }

    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file", "error");
      setErrors((prev) => ({
        ...prev,
        image: "Please select a valid image file",
      }));
      return;
    }

    setErrors((prev) => ({ ...prev, image: "" }));

    const formDataFile = new FormData();
    formDataFile.append("profileImage", file);

    try {
      setLoading(true);

      // Await dispatch so you get the result (assuming redux-toolkit createAsyncThunk)
      const uploadedUrl = await dispatch(
        uploadProfileImage(formDataFile)
      ).unwrap();

      setFormData((prev) => ({
        ...prev,
        profileUrl: uploadedUrl,
      }));

      setImagePreview(uploadedUrl);
      showToast("Profile image uploaded successfully", "success");
    } catch (error) {
      showToast("Image upload failed", "error");
      console.error(error);
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const saveProfile = async (e) => {
    e.preventDefault();

    setLoading(true);

    // force spinner to show at least 1.5s
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Validate form
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      showToast("Please fix the validation errors", "error");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        age: parseInt(formData.age, 10),
        skills: formData.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      await dispatch(updateProfile(payload)).unwrap();
      setErrors({});
      showToast("Profile updated successfully!", "success");
    } catch (error) {
      console.error(error?.response?.data || error.message);
      const errorMessage =
        error?.response?.data?.message || "Something went wrong";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  const hasErrors = Object.values(errors).some((error) => error);

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="flex flex-col gap-4 w-full max-w-md">
          <div className="skeleton h-32 w-full"></div>
          <div className="skeleton h-4 w-28"></div>
          <div className="skeleton h-4 w-full"></div>
          <div className="skeleton h-4 w-full"></div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-base-200 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-base-content mb-2">
            Edit Profile Settings
          </h1>
          <p className="text-base-content/70">
            Update your profile information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Form Section */}
          <form className="card bg-base-100 shadow-xl" onSubmit={saveProfile}>
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2 mb-6">
                <User className="w-5 h-5" />
                Profile Information
              </h2>

              <div className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        First Name *
                      </span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`input input-bordered ${
                        errors.firstName ? "input-error" : ""
                      }`}
                      placeholder="Enter your first name"
                      disabled={loading}
                    />
                    {errors.firstName && (
                      <p className="text-error text-sm mt-1">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">
                        Last Name *
                      </span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`input input-bordered ${
                        errors.lastName ? "input-error" : ""
                      }`}
                      placeholder="Enter your last name"
                      disabled={loading}
                    />
                    {errors.lastName && (
                      <p className="text-error text-sm mt-1">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Age and Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Age *</span>
                    </label>
                    <input
                      type="number"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className={`input input-bordered ${
                        errors.age ? "input-error" : ""
                      }`}
                      placeholder="Enter your age"
                      min="13"
                      max="120"
                      disabled={loading}
                    />
                    {errors.age && (
                      <p className="text-error text-sm mt-1">{errors.age}</p>
                    )}
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">Gender *</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`select select-bordered ${
                        errors.gender ? "select-error" : ""
                      }`}
                      disabled={loading}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="others">Others</option>
                    </select>
                    {errors.gender && (
                      <p className="text-error text-sm mt-1">{errors.gender}</p>
                    )}
                  </div>
                </div>

                {/* About */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">About *</span>
                    <span className="label-text-alt">
                      {formData.about.length}/500
                    </span>
                  </label>
                  <textarea
                    name="about"
                    value={formData.about}
                    onChange={handleInputChange}
                    className={`textarea textarea-bordered h-24 ${
                      errors.about ? "textarea-error" : ""
                    }`}
                    placeholder="Tell us about yourself... (minimum 10 characters)"
                    maxLength="500"
                    disabled={loading}
                  ></textarea>
                  {errors.about && (
                    <p className="text-error text-sm mt-1">{errors.about}</p>
                  )}
                </div>

                {/* Skills */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">Skills *</span>
                  </label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    className={`input input-bordered ${
                      errors.skills ? "input-error" : ""
                    }`}
                    placeholder="e.g., JavaScript, React, Node.js (comma-separated)"
                    disabled={loading}
                  />
                  {errors.skills && (
                    <p className="text-error text-sm mt-1">{errors.skills}</p>
                  )}
                  <label className="label">
                    <span className="label-text-alt">
                      Separate multiple skills with commas.
                    </span>
                  </label>
                </div>
                {/* Profile Image Upload */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">
                      Profile Image
                    </span>
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="avatar">
                      <div className="w-20 h-20 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Profile Preview"
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center bg-base-200">
                            <User className="w-8 h-8 text-base-content/50" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImage}
                        className="file-input file-input-bordered file-input-primary w-full"
                        disabled={loading}
                      />
                      {errors.image && (
                        <p className="text-error text-sm mt-1">
                          {errors.image}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={loading || hasErrors}
                    className="btn btn-primary flex-1"
                    aria-disabled={loading || hasErrors}
                    aria-busy={loading}
                  >
                    {loading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Profile
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="btn btn-outline"
                    disabled={loading}
                  >
                    <Eye className="w-4 h-4" />
                    {showPreview ? "Hide" : "Show"} Preview
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Live Preview Section */}
          {showPreview && (
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title mb-6">Live Preview</h2>
                <div className="flex justify-center">
                  <UserCard
                    user={{
                      ...formData,
                      age: parseInt(formData.age) || 0,
                      skills: formData.skills
                        .split(",")
                        .map((skill) => skill.trim())
                        .filter(Boolean),
                      profileUrl: imagePreview || formData.profileUrl,
                    }}
                    isFeedCard={false}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

export default EditProfile;
