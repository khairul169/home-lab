import { ClassInput, create as createTwrnc } from "twrnc";

export const tw = createTwrnc(require(`../../tailwind.config.js`));

export const cn = (...args: ClassInput[]) => {
  if (Array.isArray(args[0])) {
    return tw.style(...args[0]);
  }

  return tw.style(...args);
};
