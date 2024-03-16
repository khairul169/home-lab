import React from "react";
import Box from "@ui/Box";
import Text from "@ui/Text";
import dayjs from "dayjs";
import { InferResponseType } from "hono/client";
import api from "@/lib/api";

type Props = {
  data: InferResponseType<typeof api.system.$get>;
};

const Summary = ({ data }: Props) => {
  return (
    <Box className="px-4 py-6 mt-4 bg-white border border-gray-100 rounded-lg">
      <Text className="text-5xl">{dayjs(data?.date).format("HH:mm")}</Text>
      <Text className="mt-2">
        {dayjs(data?.date).format("dddd, DD MMM YYYY")}
      </Text>
      <Text className="flex-1">{`Uptime: ${data?.uptime || "-"}`}</Text>
    </Box>
  );
};

export default Summary;
