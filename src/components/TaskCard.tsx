import { useDraggable } from '@dnd-kit/core';

interface Props { id: string; title: string }

export default function TaskCard({ id, title }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id });
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)` } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes} className="bg-white rounded shadow p-3 mb-2 cursor-grab active:cursor-grabbing">
      <p className="text-sm">{title}</p>
    </div>
  );
}
