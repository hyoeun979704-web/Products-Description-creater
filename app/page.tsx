export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16">
      <h1 className="text-4xl font-bold tracking-tight">
        Products Description Creator
      </h1>
      <p className="mt-4 text-center text-lg text-gray-600">
        상품 사진 한 장으로 상세페이지를 만들어드립니다.
      </p>
      <div className="mt-10 flex gap-3">
        <a
          href="/create"
          className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
        >
          시작하기
        </a>
        <a
          href="/create/preview?id=demo-coffee"
          className="rounded-lg border border-gray-300 px-6 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          데모 미리보기
        </a>
      </div>
      <p className="mt-16 text-xs text-gray-400">
        MVP · Smart Store 전용 (쿠팡·해외 준비중)
      </p>
    </main>
  );
}
