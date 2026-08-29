import { Camera, FileCode2, ImageIcon, X } from "lucide-react";

export function AttachSheet({
  onClose,
  onPickImage,
  onPickFile,
  onPickCamera,
}: {
  onClose: () => void;
  onPickImage: () => void;
  onPickFile: () => void;
  onPickCamera: () => void;
}) {
  const actions = [
    {
      label: "Photo library",
      hint: "Attach a screenshot or mock",
      icon: ImageIcon,
      color: "bg-clay/12 text-clay",
      run: onPickImage,
    },
    {
      label: "Camera",
      hint: "Capture a whiteboard or UI",
      icon: Camera,
      color: "bg-lagoon/15 text-lagoon",
      run: onPickCamera,
    },
    {
      label: "Code file",
      hint: "Share a file from the paired repo",
      icon: FileCode2,
      color: "bg-moss/15 text-moss",
      run: onPickFile,
    },
  ];

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end bg-ink/35" onClick={onClose}>
      <div
        className="anim-sheet rounded-t-[28px] bg-cream px-4 pb-8 pt-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-mist" />
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-serif text-[22px] text-ink">Add to chat</h3>
          <button
            type="button"
            onClick={onClose}
            className="press flex h-8 w-8 items-center justify-center rounded-full bg-mist"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
        <p className="mb-4 text-[13px] text-stone">
          Multimodal context for the paired Claude Code session.
        </p>
        <div className="space-y-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={action.run}
                className="flex w-full items-center gap-3 rounded-2xl bg-cream-2 px-3 py-3 text-left"
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${action.color}`}>
                  <Icon size={18} />
                </span>
                <span>
                  <span className="block text-[14px] font-medium text-ink">{action.label}</span>
                  <span className="block text-[12px] text-stone">{action.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
