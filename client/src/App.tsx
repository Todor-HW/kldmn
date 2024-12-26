import { BrowserRouter, Route, Routes } from "react-router";

import { Home, PokeApp } from "./pages";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/pokeapp" element={<PokeApp />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
