import React from "react";
import { Platform } from "react-native";
import Helmet from "react-helmet";
import { APP_NAME } from "@/lib/constants";

type HeadProps = {
  title?: string;
};

const Head = ({ title }: HeadProps) => {
  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <Helmet>
      <title>{title ? `${title} - ${APP_NAME}` : APP_NAME}</title>
    </Helmet>
  );
};

export default Head;
