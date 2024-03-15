import React, { useState } from "react";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { InferResponseType } from "hono/client";
import api from "@/lib/api";
import Text from "@ui/Text";
import { HStack, VStack } from "@ui/Stack";
import Box from "@ui/Box";
import ProcessList from "./ProcessList";
import Divider from "@ui/Divider";
import Button from "@ui/Button";
import { Ionicons } from "@ui/Icons";

type Props = {
  data: InferResponseType<typeof api.system.$get>;
};

const Performance = ({ data: system }: Props) => {
  const [showProcess, setShowProcess] = useState(false);

  return (
    <>
      <Text className="text-lg font-medium mt-8">Performance</Text>

      <Box className="px-4 py-6 mt-2 bg-white border border-gray-100 rounded-lg relative">
        <HStack className="justify-evenly">
          <VStack className="items-center">
            <AnimatedCircularProgress
              size={120}
              width={15}
              backgroundWidth={5}
              fill={system?.perf.cpu.load || 0}
              tintColor="#6366F1"
              backgroundColor="#3d5875"
              arcSweepAngle={240}
              rotation={240}
              lineCap="round"
            >
              {() => (
                <Text>
                  <Text className="text-2xl mr-0.5">
                    {Math.round(system?.perf.cpu.load || 0)}
                  </Text>
                  %
                </Text>
              )}
            </AnimatedCircularProgress>
            <Text className="-mt-8 text-lg">CPU</Text>
            {system ? (
              <Text className="text-xs">
                {`${system.perf.cpu.speed.toFixed(1)} GHz / ${
                  system.perf.cpu.temp
                }°C`}
              </Text>
            ) : null}
          </VStack>
          <VStack className="items-center">
            <AnimatedCircularProgress
              size={120}
              width={15}
              backgroundWidth={5}
              fill={system?.perf.mem.percent || 0}
              tintColor="#6366F1"
              backgroundColor="#3d5875"
              arcSweepAngle={240}
              rotation={240}
              lineCap="round"
            >
              {() => (
                <Text>
                  <Text className="text-2xl mr-0.5">
                    {Math.round(system?.perf.mem.percent || 0)}
                  </Text>
                  %
                </Text>
              )}
            </AnimatedCircularProgress>
            <Text className="-mt-8 text-lg">Mem</Text>
            <Text className="text-xs">{system?.perf.mem.used}</Text>
          </VStack>
        </HStack>

        <Button
          icon={
            <Ionicons
              name="chevron-forward"
              style={{
                transform: showProcess ? [{ rotate: "90deg" }] : undefined,
              }}
            />
          }
          className="absolute right-0 top-1"
          variant="ghost"
          onPress={() => setShowProcess(!showProcess)}
        />

        {showProcess && <ProcessList />}
      </Box>
    </>
  );
};

export default Performance;
