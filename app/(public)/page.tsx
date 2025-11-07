import Link from "next/link";

export default async function Homepage() {
  return (
    <section className="space-y-5 text-center">
      <h1>Chào mừng đến Ecommerce</h1>
      <p className="text-muted">
        Nếu bạn là người mới, vui lòng <Link href="/login">Đăng Nhập</Link> để tiếp tục
      </p>
    </section>
  );
}
