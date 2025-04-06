import "./App.css";
import { StartScreen } from "../StartScreen/StartScreen.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from "../LoginPage/LoginPage.jsx";
import { RegisterPage } from "../RegisterPage/RegisterPage.jsx";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StartScreen />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
