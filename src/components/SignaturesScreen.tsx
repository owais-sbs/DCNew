import { useState, useEffect } from "react"
import { Plus, X, PenTool, Trash2, ExternalLink } from "lucide-react"
import axiosInstance from "./axiosInstance"

type Signature = {
  id: number
  name: string
  signatureUrl: string // URL from API, not base64
  fileDetails?: string | null
  fileType?: string | null
}

export default function SignaturesScreen() {
  const [signatures, setSignatures] = useState<Signature[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [name, setName] = useState("")
  const [signatureImage, setSignatureImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch signatures on component mount
  useEffect(() => {
    fetchSignatures()
  }, [])

  const fetchSignatures = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get("/Attachment/GetDigitalSignatures")
      
      if (response.data?.IsSuccess && response.data?.Data?.Data) {
        // Map API response to our Signature type
        // Structure: { IsSuccess: true, Data: { Data: [...] } }
        const signaturesData = response.data.Data.Data
        const mappedSignatures: Signature[] = signaturesData.map((item: any) => {
          // Ensure the URL is a valid string and trim any whitespace
          const signatureUrl = item.Signature ? String(item.Signature).trim() : ""
          console.log("Processing signature:", { id: item.Id, name: item.Name, url: signatureUrl })
          return {
            id: item.Id,
            name: item.Name || "",
            signatureUrl: signatureUrl, // CloudFront URL
            fileDetails: item.FileDetails,
            fileType: item.FileType
          }
        })
        console.log("Mapped signatures:", mappedSignatures)
        setSignatures(mappedSignatures)
      } else {
        console.warn("Unexpected API response structure:", response.data)
        setSignatures([])
      }
    } catch (err: any) {
      console.error("Failed to fetch signatures", err)
      setError(err?.response?.data?.Message || "Failed to load signatures")
      setSignatures([])
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      setSignatureImage(null)
      setImageFile(null)
      return
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB")
      return
    }

    setImageFile(file)
    setError(null)

    // Read file as base64
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Extract base64 string (remove data:image/...;base64, prefix)
      const base64 = result.includes(",") ? result.split(",")[1] : result
      setSignatureImage(base64)
    }
    reader.onerror = () => {
      setError("Failed to read image file")
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("Please enter a name")
      return
    }

    if (!imageFile) {
      setError("Please upload a signature image")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // Get file type from file extension
      const fileExtension = imageFile.name.split('.').pop()?.toLowerCase() || 'png'
      const fileType = fileExtension

      // Create FormData - matching the DigitalSignature model structure
      const formData = new FormData()
      
      // Format as documents[index].FieldName for array binding in ASP.NET Core
      // FileDetails should be the actual File object (IFormFile), not a string
      formData.append("documents[0].Id", "0")
      formData.append("documents[0].FileDetails", imageFile) // Actual File object, not filename string
      formData.append("documents[0].FileType", fileType)
      formData.append("documents[0].Name", name.trim())
      // Note: Signature is output-only (set by backend after upload), don't send it

      // Use the same headers format as AddDocuments
      const response = await axiosInstance.post("/Attachment/AddDigitalSignature", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      if (response.data?.IsSuccess) {
        await fetchSignatures()
        handleCloseModal()
      } else {
        setError(response.data?.Message || "Failed to save signature")
      }
    } catch (err: any) {
      console.error("Failed to save signature", err)
      setError(err?.response?.data?.Message || err?.message || "Failed to save signature. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this signature?")) {
      return
    }

    try {
      // TODO: Replace with actual API endpoint
      // await axiosInstance.delete(`/Signature/Delete/${id}`)
      // await fetchSignatures()

      // For now, delete from localStorage
      const updated = signatures.filter((sig) => sig.id !== id)
      setSignatures(updated)
      localStorage.setItem("signatures", JSON.stringify(updated))
    } catch (err) {
      console.error("Failed to delete signature", err)
      alert("Failed to delete signature")
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setName("")
    setSignatureImage(null)
    setImageFile(null)
    setError(null)
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Signatures</h1>
          <p className="text-sm text-gray-500 mt-1">Manage signatures for documents and forms</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm text-sm"
        >
          <Plus size={18} />
          Add signature
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading signatures...</div>
      ) : signatures.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 text-center">
          <div className="text-4xl mb-4">✍️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No signatures yet</h3>
          <p className="text-sm text-gray-600 mb-6">Get started by adding your first signature</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm text-sm"
          >
            <Plus size={18} />
            Add signature
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {signatures.map((signature) => (
            <div
              key={signature.id}
              className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <PenTool size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{signature.name}</h3>
                    <p className="text-xs text-gray-500">Signature</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(signature.id)}
                  className="h-8 w-8 grid place-items-center rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                  title="Delete signature"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-center min-h-[120px]">
                {signature.signatureUrl && (
                  <a
                    href={signature.signatureUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    <ExternalLink size={16} />
                    View file
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Signature Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={handleCloseModal}>
          <div
            className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Add signature</h2>
              <button
                onClick={handleCloseModal}
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter signature name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Signature Image <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors">
                  {signatureImage ? (
                    <div className="space-y-3">
                      <img
                        src={`data:image/png;base64,${signatureImage}`}
                        alt="Signature preview"
                        className="max-w-full max-h-48 mx-auto object-contain"
                      />
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setSignatureImage(null)
                            setImageFile(null)
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="text-gray-400">
                        <PenTool size={32} className="mx-auto" />
                      </div>
                      <div>
                        <label className="cursor-pointer">
                          <span className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                            Click to upload
                          </span>
                          <span className="text-sm text-gray-500"> or drag and drop</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !name.trim() || !signatureImage}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Saving..." : "Save signature"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

