import { faExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
    text: string;
}

export const ErrorText: React.FC<Props> = ({ text }) => {
    if (text) {
        return (
            <div role="alert" className="inline-block text-red-500 mr-2">
                <FontAwesomeIcon
                    icon={faExclamation}
                    color="#ef4444"
                    className="text-2xl mr-1 -mb-1"
                />
                {text}
            </div>
        );
    }
};
