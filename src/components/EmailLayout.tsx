import { Outlet, useNavigate, useLocation } from "react-router-dom";


export default function EmailLayout() {
  const navigate = useNavigate();
  const location = useLocation();
 const buttonClass =
    "bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-600 transition";

  const isTemplatePage = location.pathname.includes("/email/templates");

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">
          {isTemplatePage ? "Email Templates" : "Send Email"}
        </h1>

        {/* Right corner button */}
        {!isTemplatePage && (
          <button className = {buttonClass} onClick={() => navigate("/email/templates")}>
            Templates
          </button>
        )}

        {isTemplatePage && (
          <button className = {buttonClass} onClick={() => navigate("/email")}>
            Back to Send Email
          </button>
        )}
      </div>

      {/* Page content */}
      <Outlet />
    </div>
  );
}
