import { faExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Props {
    text: string;
}

export const ErrorText: React.FC<Props> = ({ text }) => {
    return (
        <div className="inline-block text-red-500">
            <FontAwesomeIcon icon={faExclamation} color="#ef4444" className="text-2xl mr-1" />
            {text}
        </div>
    );
};
