import { faCheck, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FieldValues, FormState } from "react-hook-form";
import { ErrorText } from "./ErrorText";

interface Props<T> {
    formState: FormState<T>;
    buttonText: string;
    buttonClass?: string;
}

export const FormStatus = <T extends FieldValues>({
    formState,
    buttonText,
    buttonClass = "",
}: Props<T>) => {
    const { isValid, isSubmitted, isSubmitting, isSubmitSuccessful, errors } = formState;

    return (
        <>
            <button
                type="submit"
                disabled={!isValid || isSubmitting || isSubmitSuccessful}
                className={`btn btn-primary mr-2 ${buttonClass}`}
            >
                {buttonText}
            </button>
            {isSubmitSuccessful && (
                <FontAwesomeIcon icon={faCheck} color="#3b82f6" className="text-2xl ml-1 -mb-1" />
            )}
            {!isValid && (
                <ErrorText
                    text={Object.entries(errors)
                        .map(([_, error]) => error.message)
                        .join(", ")}
                />
            )}
            {isSubmitted && isValid && !isSubmitSuccessful && (
                <ErrorText text={"Failed to create post"} />
            )}
            {isSubmitting && (
                <FontAwesomeIcon icon={faSpinner} className="text-2xl ml-1 -mb-1 fa-spin" />
            )}
        </>
    );
};
