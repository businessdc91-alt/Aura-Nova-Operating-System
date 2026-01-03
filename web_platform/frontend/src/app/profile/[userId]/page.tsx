import ProfileClient from './ProfileClient';

export function generateStaticParams() {
  return [];
}

export default function ProfilePage({ params }: { params: { userId: string } }) {
  return <ProfileClient userId={params.userId} />;
}
