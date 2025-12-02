import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axiosInstance from "./axiosInstance";
import Swal from "sweetalert2";

export default function ActivationPage() {
  const navigate = useNavigate();
  const [activationCode, setActivationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"code" | "password">("code");
  const [accountId, setAccountId] = useState<number | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activationCode.trim()) {
      Swal.fire("Error", "Please enter your activation code", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/Account/VerifyActivationCode", {
        Code: activationCode.trim(),
      });

      if (response.data?.IsSuccess) {
        // Handle different response structures (API returns lowercase accountId)
        const accountId = response.data.Data?.accountId || response.data.Data?.AccountId || response.data.Data?.Id || response.data.AccountId || null;
        if (accountId) {
          setAccountId(accountId);
          setStep("password");
        } else {
          Swal.fire("Error", "Account ID not found in response", "error");
        }
      } else {
        Swal.fire("Error", response.data?.Message || "Invalid activation code", "error");
      }
    } catch (error: any) {
      console.error("Error verifying activation code:", error);
      Swal.fire(
        "Error",
        error.response?.data?.Message || "Failed to verify activation code. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      Swal.fire("Error", "Please enter a password", "error");
      return;
    }
    if (password !== confirmPassword) {
      Swal.fire("Error", "Passwords do not match", "error");
      return;
    }
    if (password.length < 6) {
      Swal.fire("Error", "Password must be at least 6 characters long", "error");
      return;
    }
    if (!accountId) {
      Swal.fire("Error", "Account ID is missing. Please start over.", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/Account/SetPassword", {
        AccountId: accountId,
        Password: password,
      });

      if (response.data?.IsSuccess) {
        Swal.fire({
          icon: "success",
          title: "Account Created!",
          text: "Your account has been successfully created. You can now login.",
          confirmButtonColor: "#2563eb",
        }).then(() => {
          navigate("/login");
        });
      } else {
        Swal.fire("Error", response.data?.Message || "Failed to set password", "error");
      }
    } catch (error: any) {
      console.error("Error setting password:", error);
      Swal.fire(
        "Error",
        error.response?.data?.Message || "Failed to set password. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="h-14 rounded-2xl border border-gray-200 bg-white px-5 grid place-items-center shadow-sm">
            <img src="/src/assets/logo.webp" alt="Teach 'n Go" className="h-9" />
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {step === "code" ? (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter your activation code</h1>
              <p className="text-sm text-gray-500 mb-6">
                Don't have one? Please contact your school.
              </p>

              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div>
                  <input
                    type="text"
                    value={activationCode}
                    onChange={(e) => setActivationCode(e.target.value)}
                    placeholder="Enter activation code"
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                    autoFocus
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !activationCode.trim()}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? "Verifying..." : "Activate your code"}
                </button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
              <p className="text-sm text-gray-500 mb-6">
                Please set a password for your account.
              </p>

              <form onSubmit={handleSetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    autoFocus
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !password.trim() || !confirmPassword.trim()}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? "Creating account..." : "Create your account"}
                </button>
              </form>
            </>
          )}

          <button
            onClick={() => {
              if (step === "password") {
                setStep("code");
                setPassword("");
                setConfirmPassword("");
                setAccountId(null);
              } else {
                navigate("/login");
              }
            }}
            className="mt-6 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
          >
            <ArrowLeft size={16} />
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}

