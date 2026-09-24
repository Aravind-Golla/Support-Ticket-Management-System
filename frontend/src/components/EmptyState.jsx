export default function EmptyState({ message = 'Nothing to show yet.' }) {
  return <div className="empty">{message}</div>;
}
