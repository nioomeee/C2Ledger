import Navigation from '@/components/Navigation';

export default function IssueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      <Navigation />
    </>
  );
}