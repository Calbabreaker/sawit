export interface PostData {
    content: string;
    title: string;
    upvotes: number;
    userID: string;
    createdAt: number;
}

export interface UserData {
    name: string;
    description: string;
    createdAt: number;
}
