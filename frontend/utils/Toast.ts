import { toast, ToastOptions } from 'react-toastify';

export default class Toast {
    private static settings = {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    } as ToastOptions;

    public static info(text: string) {
        toast.info(text, this.settings);
    }

    public static success(text: string) {
        toast.success(text, this.settings);
    }

    public static warning(text: string) {
        toast.warning(text, this.settings);
    }

    public static error(text: string) {
        toast.error(text, this.settings);
    }
}
