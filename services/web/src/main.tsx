import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import ChildView from "./child/ChildView";
import TeacherView from "./teacher/TeacherView";
import "./index.css";

function Home() {
  return (
    <div className="home">
      <h1>ナカナオリ・エージェント</h1>
      <p>主役は人。ロボットは黒子。</p>
      <nav>
        <Link to="/child">子ども用</Link>
        <Link to="/teacher">先生用</Link>
      </nav>
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
