export interface DataType {
    id: string;
    createdAt: number;
}

export interface PostData extends DataType {
    content: string;
    title: string;
    upvotes: number;
    username: string;
    thread: string;
}

export interface ThreadData extends DataType {
    name: string;
    description: string;
}

export interface UserData extends DataType {
    name: string;
    description: string;
    createdAt: number;
}
