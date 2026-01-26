import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function EmailTemplates() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5249/api/EmailTemplate/GetAllEmailTemplates"
      );

      if (res.data?.IsSuccess) {
        setTemplates(res.data.Data);
      }
    } catch (err) {
      console.error("Failed to load email templates", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 text-gray-600 text-sm">
        Loading email templates...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-6">
      {/* Header */}
      <div className="flex justify-end mb-4">
        <button
          className="bg-emerald-500 hover:bg-emerald-600
                     text-white px-4 py-2 rounded-md
                     text-sm font-medium transition"
          onClick={() => navigate("/email/templates/new")}
        >
          New Template
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-gray-700 text-sm font-medium">
              <th className="px-4 py-3 text-left w-1/4">Title</th>
              <th className="px-4 py-3 text-left w-1/6">Status</th>
              <th className="px-4 py-3 text-left">Content</th>
              <th className="px-4 py-3 text-right w-32">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {templates.length === 0 && (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-6 text-center text-gray-500 text-sm"
                >
                  No templates found
                </td>
              </tr>
            )}

            {templates.map((t) => (
              <tr
                key={t.Id}
                className="hover:bg-gray-50 transition"
              >
                {/* Title */}
                <td className="px-4 py-3 font-medium text-gray-800">
                  {t.Title}
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1
                      rounded-full text-xs font-medium
                      ${
                        t.IsActive
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                  >
                    {t.IsActive ? "Active" : "Inactive"}
                  </span>
                </td>

                {/* Content */}
                <td
                  className="px-4 py-3 text-sm text-gray-600
                             max-w-md truncate cursor-help"
                  title={t.Content}
                >
                  {t.Content}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() =>
                      navigate(`/email/templates/${t.Id}/edit`)
                    }
                    className="inline-flex items-center px-3 py-1.5
                               text-sm font-medium text-blue-600
                               border border-blue-200 rounded-md
                               hover:bg-blue-50 hover:border-blue-300
                               transition"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
