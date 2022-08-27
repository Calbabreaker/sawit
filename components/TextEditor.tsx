import { ChangeEvent } from "react";

interface Props {
    placeholder?: string;
    onChange: (text: string) => void;
    className?: string;
}

export const TextEditor: React.FC<Props> = ({ placeholder = "", className, onChange }) => {
    function onInput(e: ChangeEvent<HTMLTextAreaElement>) {
        const value = e.currentTarget.value;
        onChange(value);
    }

    return (
        <textarea
            placeholder={placeholder}
            className={
                "rounded px-4 py-2 border border-black focus:ring h-full w-full " + className
            }
            onChange={onInput}
        />
    );
};
