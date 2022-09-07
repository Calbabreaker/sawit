import { CommentData } from "lib/types";

interface Props {
    data: CommentData;
}

export const Comment: React.FC<Props> = ({ data }) => {
    return <div>{data.content}</div>;
};
