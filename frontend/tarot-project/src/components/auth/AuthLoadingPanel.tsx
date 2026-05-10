export default function AuthLoadingPanel() {
  return (
    <section className="mx-auto mt-10 max-w-xl px-4 text-center">
      <div className="glass-panel rounded-[28px] p-8">
        <div className="mx-auto h-14 w-14 animate-pulse rounded-full border border-[rgba(212,160,23,0.2)] bg-[radial-gradient(circle,rgba(139,61,255,0.25),rgba(15,10,30,0.25))]" />
        <h2 className="mt-5 font-heading text-xl text-gold-300">세션을 확인하고 있어요</h2>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          저장된 로그인 상태가 있으면 자동으로 복원합니다.
        </p>
      </div>
    </section>
  );
}
