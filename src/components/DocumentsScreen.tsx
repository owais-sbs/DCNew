import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  Loader2,
  X,
} from "lucide-react";
import axiosInstance from "./axiosInstance";
import Swal from "sweetalert2";

interface Document {
  Id: number;
  To?: string;
  Title?: string;
  Body?: string;
  Footer?: string;
  Note?: string;
  CreatedOn?: string;
  CreatedBy?: string;
  UpdatedOn?: string;
  UpdatedBy?: string;
  IsActive?: boolean;
  IsDeleted?: boolean;
}

export default function DocumentsScreen() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

const [pageNumber, setPageNumber] = useState<number>(1);
// pageSize can be a number or the string "all"
const [pageSize, setPageSize] = useState<number | "all">(10);
const [totalCount, setTotalCount] = useState<number>(0);
const [error, setError] = useState<string | null>(null);


const effectivePageSizeForCalculate = pageSize === "all" ? (totalCount || 1) : pageSize;
const totalPages = Math.max(1, Math.ceil(totalCount / Number(effectivePageSizeForCalculate)));
const startEntry = totalCount === 0 ? 0 : (pageNumber - 1) * Number(effectivePageSizeForCalculate) + 1;
const endEntry = Math.min(totalCount, pageNumber * Number(effectivePageSizeForCalculate));

  useEffect(() => {
  fetchDocuments();
}, [pageNumber, pageSize, searchQuery]);


 const fetchDocuments = async () => {
  setLoading(true);
  setError(null);

  try {
    // If "all" selected, ask server for all items: use totalCount if known, otherwise send a large value (1st load)
    const effectivePageSize =
      pageSize === "all" ? (totalCount > 0 ? totalCount : 10000) : pageSize;

    const response = await axiosInstance.get(
      "/Document/GetAllDocumentsWithPagination",
      {
        params: {
          pageNumber,
          pageSize: effectivePageSize,
          search: searchQuery || null,
        },
      }
    );

    if (response.data?.IsSuccess) {
      const items = response.data.Data?.Data ?? response.data.Data ?? [];
      const total = Number(response.data.Data?.TotalCount ?? response.data.Total ?? 0);

      setDocuments(Array.isArray(items) ? items : []);
      setTotalCount(isNaN(total) ? 0 : total);
    } else {
      setDocuments([]);
      setTotalCount(0);
      setError(response.data?.Message || "Failed to load documents");
    }
  } catch (err: any) {
    console.error(err);
    setError(err?.message || "Error fetching documents");
    setDocuments([]);
    setTotalCount(0);
  } finally {
    setLoading(false);
  }
};





const pageButtons = () => {
  const pages: (number | "...")[] = [];
  const max = 5;
  let left = Math.max(1, pageNumber - 2);
  let right = Math.min(totalPages, pageNumber + 2);

  if (pageNumber <= 3) {
    left = 1;
    right = Math.min(totalPages, max);
  } else if (pageNumber + 2 >= totalPages) {
    right = totalPages;
    left = Math.max(1, totalPages - max + 1);
  }

  if (left > 1) {
    pages.push(1);
    if (left > 2) pages.push("...");
  }

  for (let i = left; i <= right; i++) pages.push(i);

  if (right < totalPages) {
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);
  }

  return pages;
};

  // 🔹 Updated handleDelete in DocumentsScreen

const handleDelete = async (id: number) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This document will be deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  });

  if (result.isConfirmed) {
    try {
      const response = await axiosInstance.delete("/Document/Delete", {
        params: { id },
      });

      if (response.data?.IsSuccess) {
        Swal.fire("Deleted!", "Document has been deleted.", "success");
        fetchDocuments();
      } else {
        Swal.fire(
          "Error!",
          response.data?.Message || "Failed to delete document.",
          "error"
        );
      }
    } catch (error: any) {
      console.error("Error deleting document:", error);
      Swal.fire(
        "Error!",
        error?.response?.data?.Message || "Failed to delete document.",
        "error"
      );
    }
  }
};


  const filteredDocuments = documents.filter((doc) => {
    const query = searchQuery.toLowerCase();
    return (
      doc.Title?.toLowerCase().includes(query) ||
      doc.To?.toLowerCase().includes(query) ||
      doc.Body?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Documents</h1>
          <p className="text-gray-600 mt-1">
            Manage and create enrollment confirmation documents
          </p>
        </div>
        <button
          onClick={() => {
            setEditingDocument(null);
            setShowCreateModal(true);
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create document
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Documents List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            No documents found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? "Try adjusting your search query"
              : "Create your first document to get started"}
          </p>
          {!searchQuery && (
            <button
              onClick={() => {
                setEditingDocument(null);
                setShowCreateModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Create document
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  To
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDocuments.map((doc) => (
                <tr key={doc.Id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{doc.Title || "Untitled"}</div>
                    {doc.Note && (
                      <div className="text-sm text-gray-500 mt-1 truncate max-w-md">
                        {doc.Note}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {doc.To || "—"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {doc.CreatedOn
                      ? new Date(doc.CreatedOn).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingDocument(doc);
                          setShowCreateModal(true);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(doc.Id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>


          <div className="flex items-center justify-between px-4 py-4 border-t bg-white">
  <div className="text-sm text-gray-600">
    Showing {startEntry} - {endEntry} of {totalCount}
  
    
  </div>


<select
  value={pageSize}
  onChange={(e) => {
    const v = e.target.value;
    if (v === "all") {
      setPageSize("all");
      setPageNumber(1);
    } else {
      setPageSize(Number(v));
      setPageNumber(1);
    }
  }}
  className="border px-2 py-1 rounded"
>
  {[5, 10, 25, 50, 100].map((s) => (
    <option key={s} value={s}>
      {s}
    </option>
  ))}
  <option value="all">All</option>
</select>

  <div className="flex items-center gap-2">
    <button
      disabled={pageNumber === 1}
      onClick={() => setPageNumber(pageNumber - 1)}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Previous
    </button>

   


    {pageButtons().map((p, idx) =>
      p === "..." ? (
        <span key={idx}>...</span>
      ) : (
        <button
          key={p}
          onClick={() => setPageNumber(p as number)}
          className={`px-3 py-1 border rounded ${
            p === pageNumber ? "bg-blue-600 text-white" : ""
          }`}
        >
          {p}
        </button>
      )
    )}

    <button
      disabled={pageNumber === totalPages}
      onClick={() => setPageNumber(pageNumber + 1)}
      className="px-3 py-1 border rounded disabled:opacity-50"
    >
      Next
    </button>
  </div>
</div>

        </div>
      )}

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <DocumentFormModal
          document={editingDocument}
          onClose={() => {
            setShowCreateModal(false);
            setEditingDocument(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setEditingDocument(null);
            fetchDocuments();
          }}
        />
      )}
    </div>
  );
}

function DocumentFormModal({
  document,
  onClose,
  onSuccess,
}: {
  document: Document | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    Id: document?.Id || 0,
    To: document?.To || "",
    Title: document?.Title || "",
    Body: document?.Body || "",
    Footer: document?.Footer || "",
    Note: document?.Note || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update formData when document prop changes
  useEffect(() => {
    if (document) {
      setFormData({
        Id: document.Id || 0,
        To: document.To || "",
        Title: document.Title || "",
        Body: document.Body || "",
        Footer: document.Footer || "",
        Note: document.Note || "",
      });
    } else {
      setFormData({
        Id: 0,
        To: "",
        Title: "",
        Body: "",
        Footer: "",
        Note: "",
      });
    }
  }, [document]);

  const handleInputChange = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  setError(null);

  try {
    const payload = {
      Id: formData.Id,
      To: formData.To || null,
      Title: formData.Title || null,
      Body: formData.Body || null,
      Footer: formData.Footer || null,
      Note: formData.Note || null,
    };

    const response = await axiosInstance.post(
      "/Document/AddOrUpdateDocument",
      payload
    );

    if (response.data?.IsSuccess) {
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: formData.Id
          ? "Document updated successfully"
          : "Document created successfully",
        timer: 2000,
        showConfirmButton: false,
      });
      onSuccess();
    } else {
      const msg = response.data?.Message || "Failed to save document";
      setError(msg);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: msg,
      });
    }
  } catch (err: any) {
    console.error("Error saving document:", err);
    const msg = err.response?.data?.Message || err.response?.data?.message || "Failed to save document";
    setError(msg);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: msg,
    });
  } finally {
    setSubmitting(false);
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-800">
            {document?.Id ? "Edit document" : "Create document"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.Title}
                onChange={(e) => handleInputChange("Title", e.target.value)}
                placeholder="e.g., Confirmation of Enrolment"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* To (Recipient) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To (Recipient)
              </label>
              <textarea
                value={formData.To}
                onChange={(e) => handleInputChange("To", e.target.value)}
                placeholder="e.g., Garda National Immigration Bureau"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                value={formData.Body}
                onChange={(e) => handleInputChange("Body", e.target.value)}
                placeholder="Enter the main content of the document. You can use placeholders like {StudentName}, {StudentID}, {Address}, etc."
                rows={12}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use placeholders: {"{StudentName}"}, {"{StudentID}"}, {"{Address}"}, {"{DateOfBirth}"}, {"{Nationality}"}, {"{PassportNumber}"}, {"{CourseStartDate}"}, {"{CourseEndDate}"}, {"{CourseTitle}"}, {"{CourseLevel}"}, {"{ModeOfStudy}"}, {"{NumberOfWeeks}"}, {"{HoursPerWeek}"}, {"{TuitionFees}"}, {"{CourseCode}"}
              </p>
            </div>

            {/* Footer */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer (Signature Section)
              </label>
              <textarea
                value={formData.Footer}
                onChange={(e) => handleInputChange("Footer", e.target.value)}
                placeholder="e.g., Yours faithfully, Colm Delmar, Director of Studies"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Note (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.Note}
                onChange={(e) => handleInputChange("Note", e.target.value)}
                placeholder="Internal notes about this document"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              disabled={submitting}
            >
              {submitting && <Loader2 className="animate-spin h-4 w-4" />}
              {document?.Id ? "Update document" : "Create document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

