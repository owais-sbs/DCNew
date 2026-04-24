import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Swal from "sweetalert2";
import axiosInstance from "./axiosInstance";

type Holiday = {
  Id?: number;
  HolidayDate?: string | null;
  HolidayTitle?: string | null;
};

export default function HolidaysScreen() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [formDate, setFormDate] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedYear, setSelectedYear] = useState<number | "">(new Date().getFullYear());

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const openAddModal = () => {
    setEditingHoliday(null);
    setFormDate("");
    setFormTitle("");
    setShowModal(true);
  };

  const openEditModal = (h: Holiday) => {
    setEditingHoliday(h);
    setFormTitle(h.HolidayTitle || "");
    // assume HolidayDate is ISO string -> take date part
    const rawDate = h.HolidayDate ? String(h.HolidayDate) : "";
    const dateOnly = rawDate.includes("T") ? rawDate.split("T")[0] : rawDate;
    setFormDate(dateOnly);
    setShowModal(true);
  };

  const closeModal = () => {
    if (isSaving) return;
    setShowModal(false);
  };

  const fetchHolidays = async (page = pageNumber, size = pageSize) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get("/Holiday/GetAllHolidaysWithPagination", {
        params: {
          pageNumber: page,
          pageSize: size,
          year: selectedYear || undefined
        }
      });

      if (!res.data?.IsSuccess) {
        setError(res.data?.Message || "Failed to load holidays.");
        setHolidays([]);
        setTotalCount(0);
        return;
      }

      const payload = res.data?.Data;
      const list = Array.isArray(payload?.Data)
        ? payload.Data
        : Array.isArray(payload?.Items)
          ? payload.Items
          : Array.isArray(payload)
            ? payload
            : [];
      const count = payload?.TotalCount ?? payload?.totalCount ?? payload?.Count ?? list.length;

      const mapped: Holiday[] = list.map((item: any) => ({
        Id: item.Id ?? item.HolidayId ?? item.id,
        HolidayDate: item.HolidayDate ?? item.Date ?? null,
        HolidayTitle: item.HolidayTitle ?? item.Title ?? null
      }));

      setHolidays(mapped);
      setTotalCount(typeof count === "number" ? count : mapped.length);
    } catch (err) {
      console.error("Failed to load holidays", err);
      setError("Failed to load holidays. Please try again.");
      setHolidays([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, pageSize, selectedYear]);

  const handleSaveHoliday = async () => {
    if (!formDate || !formTitle.trim()) {
      Swal.fire({
        title: "Missing fields",
        text: "Please enter both date and holiday title.",
        icon: "warning"
      });
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        Id: editingHoliday?.Id ?? 0,
        HolidayDate: formDate,
        HolidayTitle: formTitle.trim(),
        IsActive: true
      };

      const res = await axiosInstance.post("/Holiday/AddOrUpdateHoliday", payload);
      if (!res.data?.IsSuccess) {
        Swal.fire({
          title: "Error",
          text: res.data?.Message || "Failed to save holiday.",
          icon: "error"
        });
        return;
      }

      Swal.fire({
        title: editingHoliday ? "Updated" : "Added",
        text: editingHoliday ? "Holiday updated successfully." : "Holiday added successfully.",
        icon: "success"
      });

      setShowModal(false);
      setEditingHoliday(null);
      setFormDate("");
      setFormTitle("");
      // reload first page to show new/updated data
      setPageNumber(1);
      fetchHolidays(1, pageSize);
    } catch (err) {
      console.error("Failed to save holiday", err);
      Swal.fire({
        title: "Error",
        text: "Failed to save holiday. Please try again.",
        icon: "error"
      });
    } finally {
      setIsSaving(false);
    }
  };



  const handleDeleteHoliday = async (id?: number) => {
  if (!id) return;

  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This holiday will be deleted permanently.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    confirmButtonColor: "#dc2626"
  });

  if (!result.isConfirmed) return;

  try {
    setIsLoading(true);

    const res = await axiosInstance.delete(
      `/Holiday/DeleteHoliday`,
      {
        params: { id: id }
      }
    );

    if (!res.data?.IsSuccess) {
      Swal.fire({
        title: "Error",
        text: res.data?.Message || "Delete failed",
        icon: "error"
      });
      return;
    }

    Swal.fire({
      title: "Deleted",
      text: "Holiday deleted successfully",
      icon: "success"
    });

    fetchHolidays(pageNumber, pageSize);

  } catch (error) {
    console.error("Delete error:", error);

    Swal.fire({
      title: "Error",
      text: "Failed to delete holiday",
      icon: "error"
    });
  } finally {
    setIsLoading(false);
  }
};

  const formatDate = (value?: string | null) => {
    if (!value) return "";
    const raw = value.includes("T") ? value.split("T")[0] : value;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return raw;
    return d.toLocaleDateString();
  };

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const maxButtons = 5;
    let left = Math.max(1, pageNumber - 2);
    let right = Math.min(totalPages, pageNumber + 2);

    if (pageNumber <= 3) {
      left = 1;
      right = Math.min(totalPages, maxButtons);
    } else if (pageNumber + 2 >= totalPages) {
      right = totalPages;
      left = Math.max(1, totalPages - maxButtons + 1);
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

  return (
    <div className="p-6">
      <div className="flex flex-col gap-3 mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Holidays</h1>
          <p className="text-sm text-gray-500 mt-1">Manage school holidays</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Year</span>
            <input
              type="number"
              value={selectedYear === "" ? "" : selectedYear}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  setSelectedYear("");
                  setPageNumber(1);
                  return;
                }
                const num = Number(val);
                if (!Number.isNaN(num)) {
                  setSelectedYear(num);
                  setPageNumber(1);
                }
              }}
              className="w-24 h-9 px-2 rounded border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={openAddModal}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm text-sm"
          >
            <Plus size={18} />
            Add holiday
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-gray-500">Loading holidays...</div>
      ) : error ? (
        <div className="py-12 text-center text-red-600">{error}</div>
      ) : holidays.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-10 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No holidays yet</h3>
          <p className="text-sm text-gray-600 mb-6">Click &quot;Add holiday&quot; to create your first holiday.</p>
          <button
            onClick={openAddModal}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm text-sm"
          >
            <Plus size={18} />
            Add holiday
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Holiday title
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {holidays.map((h) => (
                  <tr key={h.Id ?? `${h.HolidayDate}-${h.HolidayTitle}`}>
                    <td className="px-6 py-3 text-sm text-gray-900">{formatDate(h.HolidayDate)}</td>
                    <td className="px-6 py-3 text-sm text-gray-900">{h.HolidayTitle}</td>
                    <td className="px-6 py-3 text-right text-sm space-x-3">

  <button
    type="button"
    onClick={() => openEditModal(h)}
    className="text-indigo-600 hover:text-indigo-800 font-medium text-sm"
  >
    Edit
  </button>

  <button
    type="button"
    onClick={() => handleDeleteHoliday(h.Id)}
    className="text-red-600 hover:text-red-800 font-medium text-sm"
  >
    Delete
  </button>

</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalCount > 0 && (
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-6 gap-3">
              <p className="text-sm text-gray-500">
                Showing{" "}
                {totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1} -{" "}
                {Math.min(pageNumber * pageSize, totalCount)} of {totalCount}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Rows per page</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      setPageNumber(1);
                      setPageSize(newSize);
                    }}
                    className="border border-gray-300 rounded-md text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    disabled={pageNumber === 1}
                    onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                    className="px-3 py-1 text-sm border border-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  {getPageNumbers().map((p, idx) =>
                    p === "..." ? (
                      <span key={idx} className="px-2 text-sm text-gray-400">
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPageNumber(p as number)}
                        className={`px-3 py-1 text-sm border border-gray-200 rounded ${
                          pageNumber === p ? "bg-indigo-600 text-white" : "hover:bg-gray-50"
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                  <button
                    disabled={pageNumber >= totalPages}
                    onClick={() => setPageNumber((p) => Math.min(totalPages, p + 1))}
                    className="px-3 py-1 text-sm border border-gray-200 rounded disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Holiday Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingHoliday ? "Edit holiday" : "Add holiday"}
              </h2>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full h-10 px-3 rounded border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holiday title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Christmas Day"
                  className="w-full h-10 px-3 rounded border border-gray-300 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="h-9 px-4 rounded border border-gray-300 bg-white text-gray-700 text-sm hover:bg-gray-100"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveHoliday}
                disabled={isSaving}
                className="h-9 px-4 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

