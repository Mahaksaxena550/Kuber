import React, { useState, useEffect } from "react";
import authService from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import {
  MdPerson,
  MdEmail,
  MdPhone,
  MdEdit,
  MdLock,
  MdSave,
  MdClose,
  MdVerified,
  MdCancel,
} from "react-icons/md";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  // Edit form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    profile: {
      pan_number: "",
      aadhaar_number: "",
      date_of_birth: "",
      address: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authService.getProfile();
      setProfile(res.data);
      setFormData({
        first_name: res.data.first_name || "",
        last_name: res.data.last_name || "",
        phone: res.data.phone || "",
        profile: {
          pan_number: res.data.profile?.pan_number || "",
          aadhaar_number: res.data.profile?.aadhaar_number || "",
          date_of_birth: res.data.profile?.date_of_birth || "",
          address: res.data.profile?.address || "",
          city: res.data.profile?.city || "",
          state: res.data.profile?.state || "",
          pincode: res.data.profile?.pincode || "",
        },
      });
    } catch (error) {
      console.error("Profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await authService.updateProfile(formData);
      toast.success("Profile updated!");
      setEditing(false);
      fetchProfile();
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.new_password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setSaving(true);
    try {
      await authService.changePassword({
        old_password: passwordData.old_password,
        new_password: passwordData.new_password,
      });
      toast.success("Password changed successfully!");
      setShowPasswordForm(false);
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
    } catch (error) {
      const msg = error.response?.data?.old_password?.[0] || "Failed to change password";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      {/* Profile Header Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-24"></div>
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10">
            <div className="w-20 h-20 bg-white rounded-xl border-4 border-white shadow-sm flex items-center justify-center text-2xl font-bold text-blue-600">
              {profile?.first_name?.charAt(0)}{profile?.last_name?.charAt(0)}
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-bold text-gray-900">
                {profile?.first_name} {profile?.last_name}
              </h2>
              <p className="text-sm text-gray-500">{profile?.email}</p>
            </div>
          </div>

          {/* Status Badges */}
          <div className="flex flex-wrap gap-3 mt-4">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
              <MdPerson className="text-sm" />
              {profile?.role?.replace("_", " ")}
            </span>
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
              ${profile?.is_email_verified ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
              {profile?.is_email_verified ? <MdVerified className="text-sm" /> : <MdCancel className="text-sm" />}
              Email {profile?.is_email_verified ? "Verified" : "Not Verified"}
            </span>
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium
              ${profile?.is_kyc_verified ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"}`}>
              {profile?.is_kyc_verified ? <MdVerified className="text-sm" /> : <MdCancel className="text-sm" />}
              KYC {profile?.is_kyc_verified ? "Verified" : "Pending"}
            </span>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm mb-6">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Personal Information</h3>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition"
            >
              <MdEdit className="text-base" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <MdSave className="text-base" />
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => { setEditing(false); fetchProfile(); }}
                className="flex items-center gap-1.5 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <MdClose className="text-base" />
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="p-5">
          {editing ? (
            // Edit Mode
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">First Name</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Last Name</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={formData.profile.date_of_birth}
                  onChange={(e) => setFormData({
                    ...formData,
                    profile: { ...formData.profile, date_of_birth: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">City</label>
                <input
                  type="text"
                  value={formData.profile.city}
                  onChange={(e) => setFormData({
                    ...formData,
                    profile: { ...formData.profile, city: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">State</label>
                <input
                  type="text"
                  value={formData.profile.state}
                  onChange={(e) => setFormData({
                    ...formData,
                    profile: { ...formData.profile, state: e.target.value }
                  })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">PAN Number</label>
                <input
                  type="text"
                  value={formData.profile.pan_number}
                  onChange={(e) => setFormData({
                    ...formData,
                    profile: { ...formData.profile, pan_number: e.target.value.toUpperCase() }
                  })}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Pincode</label>
                <input
                  type="text"
                  value={formData.profile.pincode}
                  onChange={(e) => setFormData({
                    ...formData,
                    profile: { ...formData.profile, pincode: e.target.value }
                  })}
                  maxLength={6}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>
          ) : (
            // View Mode
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
              <InfoRow icon={<MdPerson />} label="First Name" value={profile?.first_name} />
              <InfoRow icon={<MdPerson />} label="Last Name" value={profile?.last_name} />
              <InfoRow icon={<MdEmail />} label="Email" value={profile?.email} />
              <InfoRow icon={<MdPhone />} label="Phone" value={profile?.phone} />
              <InfoRow label="City" value={profile?.profile?.city} />
              <InfoRow label="State" value={profile?.profile?.state} />
              <InfoRow label="PAN" value={profile?.profile?.pan_number} />
              <InfoRow label="Date of Birth" value={profile?.profile?.date_of_birth} />
            </div>
          )}
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Security</h3>
          {!showPasswordForm && (
            <button
              onClick={() => setShowPasswordForm(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition"
            >
              <MdLock className="text-base" />
              Change Password
            </button>
          )}
        </div>

        {showPasswordForm && (
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordData.old_password}
                onChange={(e) => setPasswordData({ ...passwordData, old_password: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">New Password</label>
              <input
                type="password"
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                placeholder="Min 8 characters"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirm_password}
                onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleChangePassword}
                disabled={saving}
                className="px-6 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
              >
                {saving ? "Changing..." : "Change Password"}
              </button>
              <button
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
                }}
                className="px-6 py-2.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!showPasswordForm && (
          <div className="p-5 text-sm text-gray-400">
            Last password change: Never changed
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for view mode
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      {icon && <span className="text-gray-400 mt-0.5">{icon}</span>}
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value || "—"}</p>
      </div>
    </div>
  );
}