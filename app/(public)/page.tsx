import Link from "next/link";

export default async function Homepage() {
  return (
    <main className="container flex flex-col min-h-screen items-center justify-center">
      <div className="space-y-5 text-center">
        <h1>Chào mừng đến Ecommerce</h1>
        <p className="text-muted">
          Nếu bạn là người mới, vui lòng <Link href="/login">đăng nhập</Link> để tiếp tục
        </p>
      </div>
    </main>
  );
}
