import { Link } from "react-router";

export const Home = () => {
    return (
        <>
            <div className="container">
                <h1 className="text-center text-xl font-bold mb-5 lg:mb-7">Hello, World!</h1>
                <ul className="flex items-center justify-center gap-5">
                    <li className="underline active:text-primary hover:text-primary">
                        <Link to="/pokeapp">PokeApp</Link>
                    </li>
                </ul>
            </div>
        </>
    );
};
