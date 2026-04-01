import { useEffect, useState } from "react";
import StatusModal from "./StatusModal";
import type { StatusState } from "./statusHandler"; // Import as type
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
    registerStatus((data) => {
      setState(data);
    });
  }, []);

  const handleClose = () => setState((prev) => ({ ...prev, isOpen: false }));

  const handleConfirm = () => {
    if (state.onConfirm) state.onConfirm();
    handleClose();
  };

  return (
    <StatusModal
      {...state}
      onClose={handleClose}
      onConfirm={handleConfirm}
    />
  );
};

export default GlobalStatus;