import { useEffect, useState } from "react";
import StatusModal from "./StatusModal";
import type { StatusState } from "./statusHandler";
import { registerStatus } from "./statusHandler";

const GlobalStatus = () => {
  const [state, setState] = useState<StatusState>({
    isOpen: false,
    type: "success",
    message: "",
    buttonText: "",
    title: "",
    cancelText: "Cancel",
  });

  useEffect(() => {
    registerStatus((data: StatusState) => {
      console.log('GlobalStatus received:', data);
      setState(data);
    });
  }, []);

  const handleClose = () => {
    console.log('Closing popup');
    setState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    console.log('Confirm clicked');
    if (state.onConfirm) {
      state.onConfirm();
    }
    handleClose();
  };

  return (
    <StatusModal
      isOpen={state.isOpen}
      type={state.type}
      title={state.title}
      message={state.message}
      buttonText={state.buttonText}
      cancelText={state.cancelText}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  );
};

export default GlobalStatus;