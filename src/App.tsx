import { BrowserRouter, Routes, Route } from "react-router-dom";
import CommandCenterLayout from "@/pages/CommandCenterLayout";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<CommandCenterLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
