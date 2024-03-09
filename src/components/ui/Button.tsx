import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";
import { Pressable, Text } from "react-native";
import React from "react";
import Slot from "./Slot";

const buttonVariants = cva(
  "flex flex-row items-center justify-center rounded-md",
  {
    variants: {
      variant: {
        default: "bg-primary",
        secondary: "bg-secondary",
        destructive: "bg-red-500",
        ghost: "",
        link: "text-primary underline-offset-4",
        outline: "border border-primary",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-2",
        lg: "h-12 px-8",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const buttonTextVariants = cva("text-center font-medium", {
  variants: {
    variant: {
      default: "text-primary-foreground",
      secondary: "text-secondary-foreground",
      destructive: "text-white",
      ghost: "text-primary",
      link: "text-primary-foreground underline",
      outline: "text-primary",
    },
    size: {
      default: "text-base",
      sm: "text-sm",
      lg: "text-xl",
      icon: "text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
});

interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof Pressable>,
    VariantProps<typeof buttonVariants> {
  label?: string;
  labelClasses?: string;
  className?: string;
  icon?: React.ReactNode;
}
function Button({
  label,
  labelClasses,
  className,
  variant,
  size,
  icon,
  ...props
}: ButtonProps) {
  const textStyles = cn(
    buttonTextVariants({ variant, size, className: labelClasses })
  );

  return (
    <Pressable
      style={({ pressed }) =>
        cn(
          buttonVariants({ variant, size, className }),
          pressed ? "opacity-60" : "opacity-100"
        )
      }
      {...props}
    >
      {icon ? <Slot.View style={textStyles}>{icon}</Slot.View> : null}

      {label ? <Text style={textStyles}>{label}</Text> : null}
    </Pressable>
  );
}

export { buttonVariants, buttonTextVariants };

export default Button;
