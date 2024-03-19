import React from "react";
import BaseModal from "react-native-modal";
import Container from "./Container";
import { createStore, useStore } from "zustand";
import Text from "./Text";
import { HStack } from "./Stack";
import Button from "./Button";

type ModalStore = {
  isOpen: boolean;
  data?: any;
};

export const createModal = <T,>() => {
  const store = createStore<ModalStore>(() => ({
    isOpen: false,
    data: null,
  }));
  const open = (data?: T) => store.setState({ isOpen: true, data });
  const close = () => store.setState({ isOpen: false });
  return { ...store, open, close };
};

type CreateModalReturn = ReturnType<typeof createModal>;

type ModalProps = {
  modal: CreateModalReturn;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
};

const Modal = ({ title, modal, actions, children, className }: ModalProps) => {
  const { isOpen } = useStore(modal);

  return (
    <BaseModal
      isVisible={isOpen}
      onBackdropPress={modal.close}
      onBackButtonPress={modal.close}
      animationIn="fadeInDown"
    >
      <Container
        className={["bg-white rounded-lg p-6 md:p-8 max-w-xl", className]
          .filter(Boolean)
          .join(" ")}
      >
        <Text className="text-2xl font-medium">{title}</Text>

        {children}

        <HStack className="justify-end gap-4 mt-6">
          <Button variant="ghost" onPress={modal.close}>
            Cancel
          </Button>
          {actions}
        </HStack>
      </Container>
    </BaseModal>
  );
};

export default Modal;
