import { FormEvent, useState } from "react";

interface Props {
    placeholder?: string;
    onChange: (text: string) => void;
    className?: string;
}

export const EditableText: React.FC<Props> = ({ placeholder = "", className, onChange }) => {
    const [showPlaceholder, setShowplaceholder] = useState(true);

    function onInput(e: FormEvent<HTMLDivElement>) {
        const rawHTML = e.currentTarget.innerHTML;
        onChange(rawHTML);
        setShowplaceholder(rawHTML.length === 0);
    }

    return (
        <div>
            {showPlaceholder ? (
                <span className="text-gray-400 absolute mt-2 ml-4 -z-10">{placeholder}</span>
            ) : (
                <></>
            )}
            <div
                contentEditable="true"
                className={`rounded px-4 py-2 border border-black focus:ring h-full min-h-full relative ${className}`}
                onInput={onInput}
            />
        </div>
    );
};
