import { useState } from "react";
import { startCase, toLower } from "lodash";

import { fetchData } from "../services";
import { useErrorStore } from "../stores/errorStore";

import { IconExperience, IconForms, IconHeight, IconSearch, IconWeight, Loader } from "../icons";
import { ErrorMessage } from "../components/errorMessage/ErrorMessage";

interface Pokemon {
    name: string;
    weight: number;
    height: number;
    baseExperience: number;
    abilities: any[];
    types: string[];
    forms: string[];
    img: string;
    description: string;
}

export const PokeApp = () => {
    const [inputValue, set_inputValue] = useState<string>("");
    const [data, set_data] = useState<Pokemon | null>(null);
    const [isLoading, set_isLoading] = useState<Boolean>(false);

    const { errorMessage, setErrorMessage } = useErrorStore();

    const onSearchHandler = async () => {
        set_isLoading(true);

        try {
            if (!inputValue?.length) return;

            const res = await fetchData(inputValue);
            if (!res || !res.name || Object.keys(res)?.length <= 0) return;

            set_data({ ...res });
        } catch (err) {
            console.error("Error fetching data:", err);
            setErrorMessage((err as Error)?.message);
        } finally {
            set_isLoading(false);
        }
    };

    return (
        <>
            <div className="container">
                <div className="rounded-xl shadow-lg bg-primary p-5 md:p-10 flex flex-col items-center">
                    <h1 className="font-bold text-center md:text-2xl text-xl md:mb-7 mb-5">
                        Who's that Pokémon
                    </h1>

                    <div className="grid sm:grid-cols-12 gap-3 w-full">
                        <input
                            type="text"
                            placeholder="Enter Pokémon name"
                            className="input w-full sm:col-span-8"
                            value={inputValue}
                            onChange={(e) => {
                                if (errorMessage) setErrorMessage(null);
                                set_inputValue(e.currentTarget?.value || "");
                            }}
                            onKeyDown={(e) => e.key === "Enter" && onSearchHandler()}
                        />
                        <button
                            onClick={onSearchHandler}
                            className="btn btn-secondary rounded-full w-full sm:col-span-4"
                        >
                            {isLoading ? (
                                <Loader />
                            ) : (
                                <>
                                    <IconSearch /> Search
                                </>
                            )}
                        </button>
                    </div>

                    <ErrorMessage />

                    {data && Object.keys(data)?.length > 0 && (
                        <>
                            <div className="card bg-base-100 max-w-96 shadow-xl mt-7">
                                <figure className="p-3">
                                    <div className="bg-accent rounded-full p-2">
                                        <img src={data.img} alt={`${data.name}`} />
                                    </div>
                                </figure>
                                <div className="card-body pt-0">
                                    <div className="flex gap-2 mb-3">
                                        {data.types?.map((t, i) => (
                                            <div key={i} className="badge badge-info text-white">
                                                {startCase(toLower(t))}
                                            </div>
                                        ))}
                                    </div>
                                    <h2 className="card-title">{startCase(toLower(data.name))}</h2>
                                    <p className="mb-5">{data.description}</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <span className="flex items-center gap-1 text-gray-400 text-sm">
                                                <IconWeight />
                                                Weight
                                            </span>
                                            <span className="self-center font-bold text-lg">
                                                {data.weight} <span className="text-sm">lbs</span>
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <span className="flex items-center gap-1 text-gray-400 text-sm">
                                                <IconHeight />
                                                Height
                                            </span>
                                            <span className="self-center font-bold  text-lg">
                                                {data.height} <span className="text-sm">ft</span>
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <span className="flex items-center gap-1 text-gray-400 text-sm">
                                                <IconExperience />
                                                Base Exp.
                                            </span>
                                            <span className="self-center font-bold  text-lg">
                                                {data.baseExperience}
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <span className="flex items-center gap-1 text-gray-400 text-sm">
                                                <IconForms />
                                                Forms
                                            </span>
                                            <span className="self-center font-bold  text-lg">
                                                {data.forms?.length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};
