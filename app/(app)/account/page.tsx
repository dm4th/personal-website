import { UserProfile } from '@clerk/nextjs';

export default function AccountPage() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '6rem 1.5rem 2rem' }}>
      <UserProfile />
    </div>
  );
}
