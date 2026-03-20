export default function StudentInfoSection() {
  return (
    <div className="grid grid-cols-2 gap-4 border-t border-b border-gray-300 py-4 mt-4">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Name:</span>
        <span className="flex-1 border-b border-gray-300" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Roll Number:</span>
        <span className="flex-1 border-b border-gray-300" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Class:</span>
        <span className="flex-1 border-b border-gray-300" />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">Section:</span>
        <span className="flex-1 border-b border-gray-300" />
      </div>
    </div>
  );
}
