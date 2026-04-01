import { BrowserRouter, Routes, Route } from "react-router-dom";
import CommandCenterLayout from "@/pages/CommandCenterLayout";

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/*" element={<CommandCenterLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
