import { FormEvent } from "react";

export const UsernameForm: React.FC = () => {
    function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
    }

    return (
        <form onSubmit={onSubmit}>
            <h1 className="text-3xl mb-4 text-center">Please choose a username</h1>
            <div className="w-full flex justify-evenly">
                <input
                    className="w-full mr-4 p-2 border-gray-600 border rounded"
                    type="text"
                    placeholder="Username"
                />
                <input className="btn btn-primary" type="submit" value="Submit" />
            </div>
        </form>
    );
};
