import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import ChildView from "./child/ChildView";
import TeacherView from "./teacher/TeacherView";
import { Button } from "./components/ui/button";
import "./index.css";

function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-sky-50 px-4">
      <div className="max-w-lg text-center">
        <h1 className="mb-3 text-3xl font-bold text-slate-900">ナカナオリ・エージェント</h1>
        <p className="mb-2 text-lg text-slate-600">主役は人。ロボットは黒子。</p>
        <p className="mb-8 text-sm text-slate-500">
          ロボットは裁かない。ただ、話を整理して先生につなぐ。
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to="/child">
            <Button size="lg" className="w-full min-w-[160px] sm:w-auto">
              子ども用
            </Button>
          </Link>
          <Link to="/teacher">
            <Button size="lg" variant="secondary" className="w-full min-w-[160px] sm:w-auto">
              先生用
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/child" element={<ChildView />} />
        <Route path="/teacher" element={<TeacherView />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
