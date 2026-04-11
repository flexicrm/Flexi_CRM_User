export type StatusType = 'success' | 'error' | 'warning' | 'confirm';

export interface StatusState {
  isOpen: boolean;
  type: StatusType;
  title?: string;
  message: string;
  buttonText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

let globalStatusCallback: ((data: StatusState) => void) | null = null;
let pendingStatus: StatusState | null = null;

export const registerStatus = (callback: (data: StatusState) => void) => {
  globalStatusCallback = callback;
  if (pendingStatus) {
    callback(pendingStatus);
    pendingStatus = null;
  }
};

const showStatus = (data: Omit<StatusState, 'isOpen'>) => {
  const statusData = { ...data, isOpen: true };
  
  if (globalStatusCallback) {
    globalStatusCallback(statusData);
  } else {
    pendingStatus = statusData;
    console.warn('GlobalStatus not registered yet, storing pending status:', data);
  }
};

export const successAlert = (message: string, buttonText?: string, title?: string) => {
  console.log('Showing success alert:', message);
  showStatus({
    type: 'success',
    message,
    buttonText: buttonText || 'Done',
    title: title || 'Awesome!',
  });
};

export const errorAlert = (message: string, buttonText?: string, title?: string) => {
  console.log('Showing error alert:', message);
  showStatus({
    type: 'error',
    message,
    buttonText: buttonText || 'Try Again',
    title: title || 'Oops...',
  });
};

export const warningAlert = (message: string, buttonText?: string, title?: string) => {
  console.log('Showing warning alert:', message);
  showStatus({
    type: 'warning',
    message,
    buttonText: buttonText || 'Okay',
    title: title || 'Warning!',
  });
};

export const confirmAlert = (options: {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}) => {
  console.log('Showing confirm alert:', options.message);
  showStatus({
    type: 'confirm',
    title: options.title || 'Confirm?',
    message: options.message,
    buttonText: options.confirmText || 'Confirm',
    cancelText: options.cancelText || 'Cancel',
    onConfirm: options.onConfirm,
  });
};