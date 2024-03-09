import { ComponentProps } from "react";

export type ComponentPropsWithClassName<T extends React.ElementType> =
  ComponentProps<T> & {
    className?: any;
  };
