import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Props {
    text: string;
    className?: string;
}

export const MarkdownViewer: React.FC<Props> = ({ text, className }) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            className={`prose prose-sm prose-neutral prose-a:text-blue-600 ${className}`}
        >
            {text}
        </ReactMarkdown>
    );
};
