import { useEffect, useState } from "react";
import StatusModal from "./StatusModal";
import { registerStatus } from "./statusHandler";

const GlobalStatus = () => {
  const [state, setState] = useState({
    isOpen: false,
    type: "success" as "success" | "error" | "warning",
    message: "",
    buttonText: "",
  });

  useEffect(() => {
    registerStatus((data) => {
      setState((prev) => ({
        ...prev,
        ...data,
      }));
    });
  }, []);

  return (
    <StatusModal
      isOpen={state.isOpen}
      type={state.type}
      message={state.message}
      buttonText={state.buttonText}
      onClose={() => setState((prev) => ({ ...prev, isOpen: false }))}
    />
  );
};

export default GlobalStatus;
