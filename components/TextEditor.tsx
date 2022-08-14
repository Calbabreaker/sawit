import { ChangeEvent, useState } from "react";

interface Props {
    placeholder?: string;
    onChange: (text: string) => void;
    className?: string;
}

export const TextEditor: React.FC<Props> = ({ placeholder = "", className, onChange }) => {
    const [showPlaceholder, setShowplaceholder] = useState(true);

    function onInput(e: ChangeEvent<HTMLTextAreaElement>) {
        const value = e.currentTarget.value;
        onChange(value);
        setShowplaceholder(value.length === 0);
    }

    const afterStyle = showPlaceholder
        ? "after:content-[attr(placeholder)] after:text-gray-400"
        : "";

    return (
        <textarea
            placeholder={placeholder}
            className={`rounded px-4 py-2 border border-black focus:ring h-full w-full ${afterStyle} ${className}`}
            onChange={onInput}
        />
    );
};
