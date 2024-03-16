import React, { ComponentProps } from "react";
import Modal from "react-native-modal";
import { cn } from "@/lib/utils";
import Container from "./Container";

type ActionSheetProps = Partial<ComponentProps<typeof Modal>> & {
  onClose?: () => void;
};

const ActionSheet = ({ onClose, children, ...props }: ActionSheetProps) => {
  return (
    <Modal
      style={cn("justify-end md:justify-center m-0 md:m-4")}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}
      backdropOpacity={0.3}
      {...props}
    >
      <Container className="bg-white p-4 md:p-8 rounded-t-xl md:rounded-xl">
        {children}
      </Container>
    </Modal>
  );
};

export default ActionSheet;
