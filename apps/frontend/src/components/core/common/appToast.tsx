import { toast } from "sonner";

export const toastSuccess = (message: string) => {
  return toast.success(message, {
    style: {
      backgroundColor: "#4caf50",
      color: "#ffffff",
    },
  });
};

export const toastError = (message: string) => {
  return toast.success(message, {
    style: {
      backgroundColor: "#f44336",
      color: "#ffffff",
    },
  });
};

export const toastWarn = (message: string) => {
  return toast.warning(message, {
    style: {
      backgroundColor: "#ff9800",
      color: "#ffffff",
    },
  });
};
