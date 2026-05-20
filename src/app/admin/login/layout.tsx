export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  // Login page renders as full-screen overlay, hiding the parent sidebar
  return (
    <div className="fixed inset-0 z-[100] bg-[#FAFAFA]">
      {children}
    </div>
  );
}
