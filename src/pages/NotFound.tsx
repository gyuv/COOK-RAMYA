import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/ui';
import { useSeo } from '../hooks/useSeo';

export default function NotFound() {
  useSeo('Page not found');
  const nav = useNavigate();
  return (
    <div className="container" style={{ paddingTop: 60 }}>
      <EmptyState emoji="🍽" title="This page isn't on the menu" body="The page you're looking for doesn't exist or has moved." action="Back to home" onAction={() => nav('/')} />
    </div>
  );
}
