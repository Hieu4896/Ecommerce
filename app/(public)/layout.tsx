import Image from "next/image";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="flex flex-col h-screen items-center justify-center relative">
      <Image
        src="/cover-background.jpg"
        alt="Ecommerce cover background"
        fill
        sizes="100vw"
        className="object-cover object-center z-10"
      />
      <div className="absolute z-20 w-full h-full  bg-accent-foreground opacity-60" />
      <div className="container z-50 relative">{children}</div>
    </main>
  );
}
