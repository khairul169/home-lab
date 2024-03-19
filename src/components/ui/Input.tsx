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
  ...props
}: BaseInputProps) => {
  return (
    <Box className={className}>
      {label ? <Text className="text-sm mb-1">{label}</Text> : null}

      <TextInput
        style={cn(
          "border border-gray-300 rounded-lg px-3 h-10 w-full",
          inputClassName
        )}
        placeholderTextColor="#787878"
        {...props}
      />

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
