import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { fetchMaterials } from "../../../shared/api";
import { Material } from "../../../shared/types";

export default function Materials() {
  const { t, i18n } = useTranslation();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const data = await fetchMaterials();
        setMaterials(data);
      } catch (error) {
        console.error("Failed to fetch materials:", error);
      } finally {
        setLoading(false);
      }
    };
    loadMaterials();
  }, []);

  const getTypeInfo = (type: string) => {
    const typeMap: Record<string, { icon: string; label: string; desc: string }> = {
      ABSTRACT_TEMPLATE: {
        icon: "📄",
        label: t("materials.abstractTemplate"),
        desc: t("materials.abstractTemplateDesc"),
      },
      LICENSE_AGREEMENT: {
        icon: "📋",
        label: t("materials.licenseAgreement"),
        desc: t("materials.licenseAgreementDesc"),
      },
      PROCEEDINGS: {
        icon: "📚",
        label: t("materials.proceedings"),
        desc: t("materials.proceedingsDesc"),
      },
    };
    return typeMap[type] || { icon: "📎", label: type, desc: "" };
  };

  const getTitle = (material: Material) => {
    return i18n.language === "ru" ? material.titleRu : material.titleEn;
  };

  const getDescription = (material: Material) => {
    return i18n.language === "ru" ? material.descriptionRu : material.descriptionEn;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t("actions.loading")}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("materials.title")}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t("materials.subtitle")}</p>
        <p className="text-gray-500 dark:text-gray-500 text-sm mt-2">{t("materials.description")}</p>
      </div>

      {materials.length === 0 ? (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">{t("materials.empty")}</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {materials.map((material) => {
            const info = getTypeInfo(material.type || "");
            return (
              <div
                key={material.id}
                className="bg-white dark:bg-slate-800 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-slate-700 p-6"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{getTitle(material)}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{info.label}</p>
                    </div>
                  </div>
                </div>

                {getDescription(material) && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {getDescription(material)}
                  </p>
                )}

                {material.fileSize && (
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4">
                    {formatFileSize(material.fileSize)}
                  </p>
                )}

                <a
                  href={material.fileUrl}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                >
                  <span>⬇️</span>
                  {t("materials.download")}
                </a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
