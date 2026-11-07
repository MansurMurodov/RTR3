import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { RequireAuth, RequireTeacher } from "./auth/guards";
import Home from "./pages/Home";
import About from "./pages/About";
import Curriculum from "./pages/Curriculum";
import LessonDetail from "./pages/LessonDetail";
import Methods from "./pages/Methods";
import Glossary from "./pages/Glossary";
import { ForgotPassword, Login, Register, UpdatePassword } from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLessons from "./pages/admin/AdminLessons";
import Projects from "./pages/Projects";
import FinalTest from "./pages/FinalTest";
import Certificates from "./pages/Certificates";
import CertificateView from "./pages/CertificateView";
import VerifyCertificate from "./pages/VerifyCertificate";
import Presentations from "./pages/Presentations";
import Deck from "./pages/Deck";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="kurs-haqida" element={<About />} />
        <Route path="oquv-dasturi" element={<Curriculum />} />
        <Route path="mavzu/:id" element={<LessonDetail />} />
        <Route path="taqdimotlar" element={<Presentations />} />
        <Route path="taqdimot/:id" element={<Deck />} />
        <Route path="metodlar" element={<Methods />} />
        <Route path="glossariy" element={<Glossary />} />
        <Route path="loyihalar" element={<Projects />} />
        <Route path="tekshirish/:code" element={<VerifyCertificate />} />
        <Route path="sertifikat/:code" element={<CertificateView />} />
        <Route path="yakuniy-test" element={<RequireAuth><FinalTest /></RequireAuth>} />
        <Route path="sertifikatlar" element={<RequireAuth><Certificates /></RequireAuth>} />
        <Route path="kirish" element={<Login />} />
        <Route path="royxatdan-otish" element={<Register />} />
        <Route path="parolni-tiklash" element={<ForgotPassword />} />
        <Route path="yangi-parol" element={<UpdatePassword />} />
        <Route path="kabinet" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="admin" element={<RequireTeacher><AdminDashboard /></RequireTeacher>} />
        <Route path="admin/mavzular" element={<RequireTeacher><AdminLessons /></RequireTeacher>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
