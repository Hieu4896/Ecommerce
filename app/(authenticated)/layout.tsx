import Header from "@src/components/layout/Header";
import { Toaster } from "react-hot-toast";

export default function Authenticatedayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header />
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 1500,
        }}
      />
    </>
  );
}
