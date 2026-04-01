// Add 'export' before 'type'
export type StatusType = "success" | "error" | "warning" | "confirm";

export type StatusState = {
  isOpen: boolean;
  type: StatusType;
  message: string;
  title?: string;
  buttonText?: string;
  cancelText?: string;
  onConfirm?: () => void;
};

let setStatusGlobal: ((data: StatusState) => void) | null = null;

export const registerStatus = (setter: (data: StatusState) => void) => {
  setStatusGlobal = setter;
};

export const successAlert = (message: string, buttonText = "Done") => {
  setStatusGlobal?.({
    isOpen: true,
    type: "success",
    message,
    buttonText,
  });
};

export const errorAlert = (message: string, buttonText = "Retry") => {
  setStatusGlobal?.({
    isOpen: true,
    type: "error",
    message,
    buttonText,
  });
};

export const warningAlert = (message: string, buttonText = "Okay") => {
  setStatusGlobal?.({
    isOpen: true,
    type: "warning",
    message,
    buttonText,
  });
};

export const confirmAlert = ({
  title = "Are you sure?",
  message,
  confirmText = "Yes, Proceed",
  cancelText = "Cancel",
  onConfirm,
}: {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}) => {
  setStatusGlobal?.({
    isOpen: true,
    type: "confirm",
    title,
    message,
    buttonText: confirmText,
    cancelText: cancelText,
    onConfirm: onConfirm,
  });
};