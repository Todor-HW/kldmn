import { useErrorStore } from "../../stores/errorStore";

export const ErrorMessage = () => {
    const { errorMessage } = useErrorStore();

    if (!errorMessage) return null;

    return (
        <>
            <p className="text-error drop-shadow-lg my-3">{errorMessage}</p>
        </>
    );
};
