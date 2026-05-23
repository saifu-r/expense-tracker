// Bottom sheet confirm dialog — mobile friendly
export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmLabel = 'Delete', confirmClass = 'bg-red-500 text-white' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ maxWidth: 480, margin: '0 auto', paddingBottom: '75px' }}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />

      {/* Sheet */}
      <div className="relative w-full bg-[#18181f] rounded-t-3xl p-6 border-t border-white/10">
        <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
        <h3 className="font-display font-bold text-white text-lg mb-2">{title}</h3>
        <p className="text-gray-400 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-3 rounded-2xl font-medium text-gray-300 bg-white/5 border border-white/10 active:scale-95 transition-transform">
            Cancel
          </button>
          <button onClick={onConfirm}
            className={`flex-1 py-3 rounded-2xl font-bold active:scale-95 transition-transform ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
