interface ReminderCardProps {
  message: string;
}

export default function ReminderCard({ message }: ReminderCardProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-white border border-gray-200 shadow-sm px-4 py-3">
      <span className="text-xl flex-shrink-0 mt-0.5" aria-hidden="true">
        ℹ️
      </span>
      <p className="text-sm leading-relaxed text-gray-700">
        <strong>Lembrete:</strong> {message}
      </p>
    </div>
  );
}
