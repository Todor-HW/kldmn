import { useEffect } from "react";
import { BrowserRouter, Route, Routes } from "react-router";
import { io } from "socket.io-client";

import { Chat, Home, PokeApp } from "./pages";

const SOCKET_BASE_URL =
    import.meta.env.MODE === "production" ? "https://api.kldmn.xyz" : "http://localhost:8080";

const socket = io(SOCKET_BASE_URL);

function App() {
    // const [socketId, set_socketId] = useState<string | null>(null);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("SocketIO connect - socketId:", socket.id);
            // socket.id && set_socketId(socket.id);
        });

        return () => {
            socket.off("connect");
        };
    }, []);

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/pokeapp" element={<PokeApp />} />
                <Route path="/chat" element={<Chat socket={socket} />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
