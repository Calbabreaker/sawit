import { faClose } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect } from "react";

interface PopupProps {
    children: React.ReactNode;
    onClose?: () => void;
}

export const Popup: React.FC<PopupProps> = ({ children, onClose }) => {
    useEffect(() => {
        // Prevent user from scrolling in the background
        const style = document.body.style;
        if (style.overflow != "hidden") {
            style.overflow = "hidden";
            return () => (style.overflow = null);
        }
    }, []);

    return (
        <div className="fixed top-0 left-0 bg-black/60 w-full h-full z-20 grid place-items-center overflow-y-auto overflow-x-hidden px-8 py-8 md:px-16">
            <div className="w-full min-w-0 max-w-5xl z-30">
                {onClose && (
                    <div className="bg-gray-900 text-white rounded-t-lg">
                        <button onClick={onClose}>
                            <FontAwesomeIcon className="mx-2" icon={faClose} />
                            Close
                        </button>
                    </div>
                )}
                <div
                    className={`bg-gray-100 overflow-y-auto ${
                        onClose ? "rounded-b-lg" : "rounded-lg"
                    }`}
                >
                    {children}
                </div>
            </div>
            <div className="w-full h-full fixed" onClick={onClose} />
        </div>
    );
};

interface CenterProps {
    children: React.ReactNode;
}

export const Modal: React.FC<CenterProps> = ({ children }) => {
    return (
        <div className="bg-white p-4 rounded shadow mb-4 text-sm text-center flex flex-col w-full">
            {children}
        </div>
    );
};
