import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";

import axiosInstance from "./axiosInstance"

export const saveEmailTemplate = async ({ id = 0, title, content }) => {
  const payload = {
    Id: id,
    Title: title,
    Content: content,
  };

  const { data } = await axiosInstance.post(
    "/EmailTemplate/AddOrUpdateEmailTemplate",
    payload
  );

  return data;
};


export default function AddEmailTemplate() {
  const navigate = useNavigate();
  const { id } = useParams(); // for edit later

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      Swal.fire("Missing data", "Title and content are required", "warning");
      return;
    }

    try {
      setLoading(true);

      await saveEmailTemplate({
        id: id ? Number(id) : 0,
        title,
        content,
      });

      Swal.fire("Success", "Email template saved successfully", "success");
      navigate("/email/templates");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to save email template", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 grid grid-cols-3 gap-6">

      {/* Left */}
      <div className="col-span-2">
        <div className="mb-4">
          <label className="block mb-2 font-medium">Template Title</label>
          <input
            className="w-full border p-2 rounded-md"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2 font-medium">Email Content</label>
          <textarea
            rows={8}
            className="w-full border p-2 rounded-md"
            placeholder="Write email and use variables..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            className="border px-4 py-2 rounded-md"
            onClick={() => navigate("/email/templates")}
          >
            Cancel
          </button>

          <button
            disabled={loading}
            onClick={handleSave}
            className="bg-emerald-500 text-white px-4 py-2 rounded-md disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Right Preview */}
      <div className="border rounded-xl p-4 bg-gray-50">
        <h4 className="font-medium mb-2">Email Preview</h4>
        <div className="bg-white p-3 rounded-md text-sm whitespace-pre-wrap">
          {content || "Your email preview will appear here..."}
        </div>
      </div>
    </div>
  );
}
