import React, { ComponentProps } from "react";
import Text from "@ui/Text";
import Box from "@ui/Box";
import { Ionicons } from "@ui/Icons";
import { HStack } from "@ui/Stack";
import Button from "@ui/Button";
import { useNavigation } from "expo-router";
import { showDialog } from "@/stores/dialogStore";
import { wakePcUp } from "@/app/apps/lib";

type Props = ComponentProps<typeof Box>;

const Apps = (props: Props) => {
  const navigation = useNavigation();

  const appList = [
    {
      name: "Files",
      icon: <Ionicons name="folder" />,
      path: "files",
    },
    {
      name: "Terminal",
      icon: <Ionicons name="terminal" />,
      path: "terminal",
    },
    {
      name: "VNC",
      icon: <Ionicons name="eye" />,
      path: "vnc",
    },
    {
      name: "Turn on PC",
      icon: <Ionicons name="desktop" />,
      action: () =>
        showDialog(
          "Turn on PC",
          "Are you sure wanna turn on the PC?",
          wakePcUp
        ),
    },
  ];

  return (
    <Box {...props}>
      <Text className="text-lg md:text-2xl font-medium">Apps</Text>
      <HStack className="mt-4 flex-wrap gap-4 md:gap-8">
        {appList.map((app, idx) => (
          <Button
            key={idx}
            className="flex-col flex-1 basis-1/3 md:max-w-[160px] h-32 bg-white"
            labelClasses="text-sm text-center text-gray-900"
            iconClassName="text-2xl mb-1 text-primary"
            variant="outline"
            icon={app.icon}
            label={app.name}
            onPress={() => {
              if (app.path) {
                navigation.navigate(("apps/" + app.path) as never);
              }

              if (app.action) {
                app.action();
              }
            }}
          />
        ))}
      </HStack>
    </Box>
  );
};

export default React.memo(Apps);
