import { useState } from "react";

export const useDisclosure = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<any>();

  const open = (data?: any) => {
    setIsOpen(true);
    setData(data);
  };

  const close = () => {
    setIsOpen(false);
  };

  return { isOpen, open, close, data };
};
