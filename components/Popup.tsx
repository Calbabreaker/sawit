interface PopupProps {
    open: boolean;
    children: JSX.Element;
}

export const Popup: React.FC<PopupProps> = ({ open, children }) => {
    if (open) {
        return (
            <div className="fixed top-0 left-0 bg-black/30 w-full h-full grid place-items-center overflow-y-hidden z-20">
                <div className="max-w-lg m-4 h-fit bg-gray-100 shadow-lg rounded-lg">
                    {children}
                </div>
            </div>
        );
    } else {
        return null;
    }
};
