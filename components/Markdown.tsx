import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMarkdown } from "@fortawesome/free-brands-svg-icons";
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
            className={`prose prose-sm prose-neutral prose-a:text-blue-600 max-w-full break-words ${className}`}
            disallowedElements={["img"]}
            linkTarget="_blank"
        >
            {text}
        </ReactMarkdown>
    );
};

export const MarkdownSupported: React.FC = () => {
    return (
        <a
            href="https://docs.github.com/en/articles/basic-writing-and-formatting-syntax"
            target="_blank"
            className="text-gray-400 block hover:underline"
        >
            <FontAwesomeIcon className="mr-1" icon={faMarkdown} />
            Markdown supported
        </a>
    );
};
