import "./App.css";
import { StartScreen } from "../StartScreen/StartScreen.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { LoginPage } from "../LoginPage/LoginPage.jsx";
import { RegisterPage } from "../RegisterPage/RegisterPage.jsx";
import { Chat } from "../Chat/Chat.jsx"

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<StartScreen />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/chat" element={<Chat/>}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
