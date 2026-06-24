import React from "react";

type Props = {
  children?: React.ReactNode;
};

export default function OperationalGrid({ children }: Props) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
      {children}
    </section>
  );
}
