type StatusType = "success" | "error" | "warning";

type StatusState = {
  isOpen: boolean;
  type: StatusType;
  message: string;
  buttonText?: string;
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
