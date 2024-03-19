import Button from "@ui/Button";

type ActionButtonProps = {
  icon: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
};

const ActionButton = ({ icon, onPress, disabled }: ActionButtonProps) => (
  <Button
    disabled={disabled}
    icon={icon}
    className="px-3 border-gray-300"
    labelClasses="text-gray-500"
    variant="outline"
    onPress={onPress}
  />
);

export default ActionButton;
