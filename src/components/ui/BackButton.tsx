import { useNavigation } from "expo-router";
import React from "react";
import { Ionicons } from "./Icons";
import Button from "./Button";

type BackButtonProps = {
  prev?: string;
};

const BackButton = ({ prev }: BackButtonProps) => {
  const navigation = useNavigation();

  const onPress = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate((prev || "index") as never);
    }
  };

  return (
    <Button
      icon={<Ionicons name="arrow-back" />}
      variant="ghost"
      className="h-14 w-14"
      iconClassName="text-black text-2xl"
      onPress={onPress}
    />
  );
};

export default BackButton;
