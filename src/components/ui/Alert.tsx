import { cn } from "@/lib/utils";
import { ComponentPropsWithClassName } from "@/types/components";
import { View } from "react-native";
import Text from "./Text";
import { VariantProps, cva } from "class-variance-authority";

const alertVariants = cva(
  "rounded-md bg-gray-100 border border-gray-300 px-3 py-2 w-full",
  {
    variants: {
      variant: {
        default: "bg-gray-100 border-gray-300",
        success: "bg-green-100 border-green-300",
        error: "bg-red-100 border-red-300",
        warning: "bg-yellow-100 border-yellow-300",
        info: "bg-blue-100 border-blue-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const alertTextVariants = cva("text-sm", {
  variants: {
    variant: {
      default: "text-gray-700",
      success: "text-green-700",
      error: "text-red-700",
      warning: "text-yellow-700",
      info: "text-blue-700",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

type Props = Omit<ComponentPropsWithClassName<typeof View>, "children"> &
  VariantProps<typeof alertVariants> & {
    children?: string;
    textClassName?: string;
    error?: unknown;
  };

const Alert = ({
  className,
  textClassName,
  children,
  variant: variantName,
  error,
}: Props) => {
  let variant = variantName;
  let message = children;

  if (error) {
    variant = "error";
    message = (error as any)?.message || "An error occured!";
  }

  if (!message) {
    return null;
  }

  return (
    <View style={cn(alertVariants({ variant }), className)}>
      <Text className={[alertTextVariants({ variant }), textClassName]}>
        {message}
      </Text>
    </View>
  );
};

export default Alert;
