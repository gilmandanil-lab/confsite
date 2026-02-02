import { createBrowserRouter, Outlet } from "react-router-dom";
import Home from "../features/public/pages/Home";
import Page from "../features/public/pages/Page";
import Participants from "../features/public/pages/Participants";
import Program from "../features/public/pages/Program";
import Materials from "../features/public/pages/Materials";
import ImportantDates from "../features/public/pages/ImportantDates";
import Fee from "../features/public/pages/Fee";
import History from "../features/public/pages/History";
import NewsListPage from "../features/public/pages/NewsList";
import NewsDetailsPage from "../features/public/pages/NewsDetails";
import Register from "../features/registration/pages/Register";
import Login from "../features/auth/pages/Login";
import VerifyEmail from "../features/auth/pages/VerifyEmail";
import Dashboard from "../features/participant/pages/Dashboard";
import Profile from "../features/participant/pages/Profile";
import Talks from "../features/participant/pages/Talks";
import TalkEdit from "../features/participant/pages/TalkEdit";
import AdminLayout from "../features/admin/pages/AdminLayout";
import Users from "../features/admin/pages/Users";
import Sections from "../features/admin/pages/Sections";
import NewsAdmin from "../features/admin/pages/News";
import PagesAdmin from "../features/admin/pages/Pages";
import AdminTalks from "../features/admin/pages/Talks";
import AdminMaterials from "../features/admin/pages/Materials";
import Documents from "../features/admin/pages/Documents";
import ProgramAdmin from "../features/admin/pages/Program";
import Audit from "../features/admin/pages/Audit";
import Exports from "../features/admin/pages/Exports";
import { ProtectedRoute } from "./guards/ProtectedRoute";
import { RoleRoute } from "./guards/RoleRoute";
import { RegistrationGuard } from "./guards/RegistrationGuard";
import { CompletedRegistrationGuard } from "./guards/CompletedRegistrationGuard";
import { Header } from "../shared/layout/Header";
import { Footer } from "../shared/layout/Footer";
import ParticipantLayout from "../features/participant/pages/Layout";

function PublicShell() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-gray-100 text-gray-900 dark:from-slate-900 dark:to-slate-950 dark:text-gray-100">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8 lg:px-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <PublicShell />,
    children: [
      { index: true, element: <Home /> },
      { path: "page/:slug", element: <Page /> },
      { path: "program", element: <Program /> },
      { path: "materials", element: <Materials /> },
      { path: "fee", element: <Fee /> },
      { path: "history", element: <History /> },
      { path: "important-dates", element: <ImportantDates /> },
      { path: "news", element: <NewsListPage /> },
      { path: "news/:id", element: <NewsDetailsPage /> },
      { path: "participants", element: <Participants /> },
      { path: "register", element: <RegistrationGuard><Register /></RegistrationGuard> },
      { path: "login", element: <Login /> },
      { path: "verify-email", element: <VerifyEmail /> },
      {
        path: "cabinet",
        element: (
          <CompletedRegistrationGuard>
            <ParticipantLayout />
          </CompletedRegistrationGuard>
        ),
        children: [
          { index: true, element: <Dashboard /> },
          { path: "profile", element: <Profile /> },
          { path: "talks", element: <Talks /> },
          { path: "talks/new", element: <TalkEdit mode="create" /> },
          { path: "talks/:id", element: <TalkEdit mode="edit" /> },
        ],
      },
      {
        path: "admin",
        element: (
          <CompletedRegistrationGuard>
            <RoleRoute roles={["ADMIN"]}>
              <AdminLayout />
            </RoleRoute>
          </CompletedRegistrationGuard>
        ),
        children: [
          { index: true, element: <Users /> },
          { path: "users", element: <Users /> },
          { path: "sections", element: <Sections /> },
          { path: "news", element: <NewsAdmin /> },
          { path: "pages", element: <PagesAdmin /> },
          { path: "talks", element: <AdminTalks /> },
          { path: "materials", element: <AdminMaterials /> },
          { path: "documents", element: <Documents /> },
          { path: "program", element: <ProgramAdmin /> },
          { path: "audit", element: <Audit /> },
          { path: "exports", element: <Exports /> },
        ],
      },
    ],
  },
]);
