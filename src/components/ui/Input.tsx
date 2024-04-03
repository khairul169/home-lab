import React from "react";
import { TextInput } from "react-native";
import { ComponentPropsWithClassName } from "@/types/components";
import { cn } from "@/lib/utils";
import Box from "./Box";
import Text from "./Text";
import { Controller, FieldValues, Path, UseFormReturn } from "react-hook-form";

type BaseInputProps = ComponentPropsWithClassName<typeof TextInput> & {
  label?: string;
  inputClassName?: string;
  error?: string;
  leftElement?: React.ReactNode;
};

type InputProps<T extends FieldValues> = BaseInputProps & {
  form?: UseFormReturn<T>;
  path?: Path<T>;
};

const BaseInput = ({
  className,
  inputClassName,
  label,
  error,
  leftElement,
  ...props
}: BaseInputProps) => {
  return (
    <Box className={className}>
      {label ? <Text className="text-sm mb-1">{label}</Text> : null}

      <Box className="relative w-full">
        {leftElement ? (
          <Box className="absolute left-0 top-0 h-full aspect-square flex items-center justify-center">
            {leftElement}
          </Box>
        ) : null}

        <TextInput
          style={cn(
            "border border-gray-300 rounded-lg px-3 h-10 w-full",
            leftElement ? "pl-10" : "",
            inputClassName
          )}
          placeholderTextColor="#787878"
          {...props}
        />
      </Box>

      {error ? (
        <Text className="text-red-500 text-sm mt-1">{error}</Text>
      ) : null}
    </Box>
  );
};

const Input = <T extends FieldValues>({
  form,
  path,
  ...props
}: InputProps<T>) => {
  if (form && path) {
    return (
      <Controller
        control={form.control}
        name={path}
        render={({ field: { ref, ...field }, fieldState }) => (
          <BaseInput {...props} {...field} error={fieldState.error?.message} />
        )}
      />
    );
  }
  return <BaseInput {...props} />;
};

export default Input;
