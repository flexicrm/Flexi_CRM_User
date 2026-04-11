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
    console.log("✅ GlobalStatus mounted, registering callback");
    registerStatus((data: StatusState) => {
      console.log("📢 GlobalStatus received data:", data);
      console.log("📢 Opening popup with type:", data.type);
      console.log("📢 Message:", data.message);
      setState(data);
    });
  }, []);

  // Debug: Log when state changes
  useEffect(() => {
    console.log("🔄 GlobalStatus state updated:", { isOpen: state.isOpen, type: state.type, message: state.message });
  }, [state]);

  const handleClose = () => {
    console.log("❌ Closing popup");
    setState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirm = () => {
    console.log("✅ Confirm clicked");
    if (state.onConfirm) {
      state.onConfirm();
    }
    handleClose();
  };

  // Don't render anything if not open
  if (!state.isOpen) {
    return null;
  }

  console.log("🎨 Rendering StatusModal with props:", {
    isOpen: state.isOpen,
    type: state.type,
    title: state.title,
    message: state.message,
  });

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