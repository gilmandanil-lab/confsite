import { ProgramFileManager } from "../ui/ProgramFileManager";

export default function ProgramAdmin() {
  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Управление программой
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-300">
          Загрузите файл программы конференции
        </p>
      </div>
      <ProgramFileManager />
    </div>
  );
}
