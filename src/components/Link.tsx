"use client";

import NextLink, { type LinkProps } from "next/link";
import { forwardRef } from "react";

const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(props, ref) {
  return <NextLink {...props} ref={ref} />;
});

export default Link;
