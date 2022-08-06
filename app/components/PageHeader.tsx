export function PageHeader({ children }: { children?: React.ReactNode }) {
  return (
    <div className="page-header h-[55px] flex-shrink-0 border-b">
      {children}
    </div>
  );
}
