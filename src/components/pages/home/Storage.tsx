import React from "react";
import { InferResponseType } from "hono/client";
import api from "@/lib/api";
import Text from "@ui/Text";
import Box from "@ui/Box";
import DriveIcon from "@/assets/icons/harddrive.svg";
import { HStack, VStack } from "@ui/Stack";

type Props = {
  data: InferResponseType<typeof api.system.$get>;
};

const Storage = ({ data }: Props) => {
  return (
    <>
      <Text className="text-lg font-medium mt-8">Storage</Text>
      <HStack className="px-1 py-4 mt-2 bg-white border border-gray-100 rounded-lg gap-3 flex-wrap">
        {data?.storage.map((item) => (
          <Box key={item.mount} className="flex-1 basis-full sm:basis-[40%]">
            <HStack className="flex items-center justify-center gap-2">
              <DriveIcon style={{ width: 72, height: 72 }} />
              <VStack className="flex-1 gap-1">
                <Text className="text-primary font-bold">{item.mount}</Text>
                <Text>{`Total: ${item.total}`}</Text>
                <Text>{`Free: ${item.free}`}</Text>
              </VStack>
            </HStack>

            <Box className="rounded-full h-2 mx-4 bg-gray-200 overflow-hidden">
              <Box
                className={[
                  "rounded-full h-2",
                  item.percent > 90
                    ? "bg-red-500"
                    : item.percent > 75
                    ? "bg-yellow-500"
                    : "bg-primary-400",
                ]}
                style={{ width: `${item.percent}%` }}
              ></Box>
            </Box>
          </Box>
        ))}
      </HStack>
    </>
  );
};

export default Storage;
