import Image from "next/image";

export default function Header() {
  return (
    <header className="w-full h-15 py-2 bg-warning flex justify-between items-center">
      <nav className="container h-full flex items-center justify-between">
        <Image src="/logo.png" alt="Pawsy" width={60} height={60} className="w-8 h-auto" />
        <div className="w-8 h-8 aspect-auto relative">
          <Image src="/cart.png" alt="Pawsy" fill sizes="40px" />
        </div>
      </nav>
    </header>
  );
}
