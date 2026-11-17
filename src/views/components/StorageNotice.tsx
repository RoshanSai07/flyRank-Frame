export function StorageNotice({ message }: { message: string | null }) {
  if (!message) return null
  return <div className="storage-notice" role="alert">{message}</div>
}
