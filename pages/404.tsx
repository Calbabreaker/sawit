import { Modal } from "components/Modals";

export default function Custom404() {
    return (
        <Modal>
            <h1 className="text-2xl mb-2">404 Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
        </Modal>
    );
}
