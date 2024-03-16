import React from "react";
import Modal from "react-native-modal";
import Container from "./Container";
import Text from "./Text";
import { HStack } from "./Stack";
import Button from "./Button";
import { useStore } from "zustand";
import { dialogStore } from "@/stores/dialogStore";

const Dialog = () => {
  const { isVisible, title, message, onConfirm, close } = useStore(dialogStore);

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={close}
      onBackButtonPress={close}
      animationIn="fadeInDown"
    >
      <Container className="bg-white rounded-lg p-6 md:p-8">
        <Text className="text-2xl font-medium">{title}</Text>
        <Text className="mt-3">{message}</Text>

        <HStack className="justify-end gap-4 mt-6">
          <Button variant="ghost" onPress={close}>
            Cancel
          </Button>
          <Button
            onPress={() => {
              onConfirm();
              close();
            }}
          >
            Confirm
          </Button>
        </HStack>
      </Container>
    </Modal>
  );
};

export default React.memo(Dialog);
