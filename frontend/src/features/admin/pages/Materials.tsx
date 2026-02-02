import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { apiUpload, apiGet, apiPut, apiDelete } from "../../../shared/api/client";

interface Material {
  id: string;
  type: string;
  titleRu: string;
  titleEn: string;
  descriptionRu?: string;
  descriptionEn?: string;
  fileUrl: string;
  fileSize?: number;
  mimeType?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminMaterials() {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    type: "ABSTRACT_TEMPLATE",
    titleRu: "",
    titleEn: "",
    descriptionRu: "",
    descriptionEn: "",
    file: null as File | null,
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await apiGet<Material[]>("/api/admin/materials");
      setMaterials(data);
    } catch (error) {
      console.error("Failed to fetch materials:", error);
      alert("Failed to fetch materials");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titleRu || !formData.titleEn) {
      alert("Title required in both languages");
      return;
    }

    if (editingId) {
      // Update existing material (without file)
      try {
        await apiPut<{ ok: boolean }>(`/api/admin/materials/${editingId}`, {
          type: formData.type,
          titleRu: formData.titleRu,
          titleEn: formData.titleEn,
          descriptionRu: formData.descriptionRu || null,
          descriptionEn: formData.descriptionEn || null,
        });
        setEditingId(null);
        resetForm();
        await fetchMaterials();
      } catch (error) {
        console.error("Failed to update material:", error);
        alert("Failed to update material");
      }
    } else {
      // Upload new material
      if (!formData.file) {
        alert("File required");
        return;
      }

      try {
        setUploading(true);
        const formDataToSend = new FormData();
        formDataToSend.append("type", formData.type);
        formDataToSend.append("titleRu", formData.titleRu);
        formDataToSend.append("titleEn", formData.titleEn);
        formDataToSend.append("descriptionRu", formData.descriptionRu);
        formDataToSend.append("descriptionEn", formData.descriptionEn);
        formDataToSend.append("file", formData.file);

        await apiUpload<{ ok: boolean; id: string; url: string }>("/api/admin/materials", formDataToSend);

        resetForm();
        await fetchMaterials();
      } catch (error) {
        console.error("Failed to upload material:", error);
        alert("Failed to upload material");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleEdit = (material: Material) => {
    setEditingId(material.id);
    setFormData({
      type: material.type,
      titleRu: material.titleRu,
      titleEn: material.titleEn,
      descriptionRu: material.descriptionRu || "",
      descriptionEn: material.descriptionEn || "",
      file: null,
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this material?")) return;

    try {
      await apiDelete<{ ok: boolean }>(`/api/admin/materials/${id}`);
      await fetchMaterials();
    } catch (error) {
      console.error("Failed to delete material:", error);
      alert("Failed to delete material");
    }
  };

  const resetForm = () => {
    setFormData({
      type: "ABSTRACT_TEMPLATE",
      titleRu: "",
      titleEn: "",
      descriptionRu: "",
      descriptionEn: "",
      file: null,
    });
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      ABSTRACT_TEMPLATE: t("admin.materialTypeTemplate"),
      LICENSE_AGREEMENT: t("admin.materialTypeLicense"),
      PROCEEDINGS: t("admin.materialTypeProceedings"),
    };
    return map[type] || type;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t("admin.materialsTitle")}</h1>

      {/* Upload Form */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? t("actions.edit") : t("actions.upload")}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("admin.materialType")}
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white"
              >
                <option value="ABSTRACT_TEMPLATE">{t("admin.materialTypeTemplate")}</option>
                <option value="LICENSE_AGREEMENT">{t("admin.materialTypeLicense")}</option>
                <option value="PROCEEDINGS">{t("admin.materialTypeProceedings")}</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("admin.materialTitleRu")} *
              </label>
              <input
                type="text"
                value={formData.titleRu}
                onChange={(e) => setFormData({ ...formData, titleRu: e.target.value })}
                placeholder="Название (русский)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("admin.materialTitleEn")} *
              </label>
              <input
                type="text"
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                placeholder="Title (English)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("admin.materialDescRu")}
              </label>
              <textarea
                value={formData.descriptionRu}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionRu: e.target.value })
                }
                placeholder="Описание (русский)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("admin.materialDescEn")}
              </label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) =>
                  setFormData({ ...formData, descriptionEn: e.target.value })
                }
                placeholder="Description (English)"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md dark:bg-slate-700 dark:text-white resize-none"
              />
            </div>
          </div>

          {!editingId && (
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("admin.materialFile")} *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                required={!editingId}
              />
              {formData.file && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {formData.file.name} ({formatFileSize(formData.file.size)})
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md disabled:opacity-50"
            >
              {uploading ? t("actions.loading") : t("actions.save")}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-gray-300 dark:bg-slate-600 hover:bg-gray-400 dark:hover:bg-slate-500 text-gray-900 dark:text-white rounded-md"
              >
                {t("actions.cancel")}
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Materials List */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t("admin.materialType")}</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Title</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">File</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">{t("admin.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                    {t("actions.loading")}
                  </td>
                </tr>
              ) : materials.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-4 text-center text-gray-500">
                    {t("admin.empty")}
                  </td>
                </tr>
              ) : (
                materials.map((material) => (
                  <tr key={material.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700">
                    <td className="px-4 py-3">{getTypeLabel(material.type)}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm">
                        <div className="font-medium">{material.titleRu}</div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs">{material.titleEn}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <a
                        href={material.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 underline"
                      >
                        Download ({formatFileSize(material.fileSize)})
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(material)}
                          className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                        >
                          {t("actions.edit")}
                        </button>
                        <button
                          onClick={() => handleDelete(material.id)}
                          className="text-sm px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                        >
                          {t("actions.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
