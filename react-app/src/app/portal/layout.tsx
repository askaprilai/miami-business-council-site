// Force dynamic rendering for the entire portal section
export const dynamic = 'force-dynamic';

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
