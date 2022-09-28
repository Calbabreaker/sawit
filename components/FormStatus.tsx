import { faCheck, faSpinner, faExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { FieldValues, FormState } from "react-hook-form";

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
    const { isValid, isSubmitted, isSubmitting, isSubmitSuccessful, errors, isDirty } = formState;

    const error = Object.entries(errors).filter(([_, error]) => error.message)[0]?.[1];

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
                <FontAwesomeIcon icon={faCheck} className="text-blue-500 text-2xl ml-1 -mb-1" />
            )}
            {!isValid && <ErrorText text={error?.message} />}
            {isSubmitted && isValid && !isDirty && !isSubmitSuccessful && (
                <ErrorText text={"Failed to send request"} />
            )}
            {isSubmitting && (
                <FontAwesomeIcon icon={faSpinner} className="text-2xl ml-1 -mb-1 fa-spin" />
            )}
        </>
    );
};

interface PropsText {
    text: string;
}

export const ErrorText: React.FC<PropsText> = ({ text }) => {
    if (text) {
        return (
            <div role="alert" className="inline-block text-red-500 mr-2">
                <FontAwesomeIcon icon={faExclamation} className="text-2xl mr-1 -mb-1" />
                {text}
            </div>
        );
    }
};
