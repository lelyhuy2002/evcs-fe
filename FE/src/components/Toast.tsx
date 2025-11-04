'use client';

import { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const Toast = () => {
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
      toastClassName="!rounded-lg !shadow-lg !font-sans !text-sm !font-medium"
      className="!m-0 !p-0"
      progressClassName="!bg-blue-500"
      closeButton={false}
    />
  );
};

export default Toast;
