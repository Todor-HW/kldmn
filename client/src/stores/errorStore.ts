import { create } from "zustand";

interface ErrorStore {
    errorMessage: string | null;

    setErrorMessage: (value: string | null) => void;
}

export const useErrorStore = create<ErrorStore>((set) => ({
    errorMessage: null,

    setErrorMessage: (value) => set({ errorMessage: value }),
}));
