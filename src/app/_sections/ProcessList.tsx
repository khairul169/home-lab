import api from "@/lib/api";
import Box from "@ui/Box";
import Button from "@ui/Button";
import { HStack, VStack } from "@ui/Stack";
import Text from "@ui/Text";
import React, { useState } from "react";
import { useQuery } from "react-query";

const ProcessList = () => {
  const [sort, setSort] = useState<string>("mem");

  const { data } = useQuery({
    queryKey: ["process", sort],
    queryFn: async () => {
      return api.process
        .$get({ query: { sort, limit: 5 } })
        .then((r) => r.json());
    },
    select: (i) => i.list,
    refetchInterval: 1000,
  });

  return (
    <Box className="mt-4">
      <HStack className="gap-2 flex-wrap">
        <Button
          label="Mem"
          variant={sort === "mem" ? "default" : "outline"}
          size="sm"
          onPress={() => setSort("mem")}
        />
        <Button
          label="CPU"
          variant={sort === "cpu" ? "default" : "outline"}
          size="sm"
          onPress={() => setSort("cpu")}
        />
      </HStack>

      <VStack className="gap-2 mt-3">
        {data?.map((item, idx) => (
          <HStack key={idx} className="pb-2 border-b border-gray-200">
            <Text className="flex-1" numberOfLines={1}>
              {item.cmd}
            </Text>
            <Text>{sort === "mem" ? item.memUsage : item.cpuPercent}</Text>
          </HStack>
        ))}
      </VStack>
    </Box>
  );
};

export default ProcessList;
