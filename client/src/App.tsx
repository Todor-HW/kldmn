import { BrowserRouter, Route, Routes } from "react-router";

import { ErrorMessage } from "./components";
import { Chat, Home, PokeApp } from "./pages";

function App() {
    return (
        <>
            <ErrorMessage />

            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/pokeapp" element={<PokeApp />} />
                    <Route path="/chat" element={<Chat />} />
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
