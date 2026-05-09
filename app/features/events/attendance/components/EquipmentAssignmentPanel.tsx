// components/EquipmentAssignmentPanel.tsx
"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

type EquipmentItem = {
  id: string;
  label: string;
  value: string;
};

type Props = {
  onChange?: (items: EquipmentItem[]) => void;
  initialItems?: EquipmentItem[];
};

function createItem(label = "", value = ""): EquipmentItem {
  return {
    id: crypto.randomUUID(),
    label,
    value,
  };
}

export default function EquipmentAssignmentPanel({
  onChange,
  initialItems,
}: Props) {
  const [items, setItems] = React.useState<EquipmentItem[]>(
    initialItems?.length
      ? initialItems
      : [
          createItem("Vest", ""),
          createItem("Nøgle", ""),
          createItem("Radio nr.", ""),
        ],
  );

  const updateItem = (id: string, field: "label" | "value", next: string) => {
    setItems((prev) => {
      const updated = prev.map((item) =>
        item.id === id
          ? {
              ...item,
              [field]: next,
            }
          : item,
      );

      onChange?.(updated);
      return updated;
    });
  };

  const addItem = () => {
    setItems((prev) => {
      const updated = [...prev, createItem("", "")];
      onChange?.(updated);
      return updated;
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      onChange?.(updated);
      return updated;
    });
  };

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">Udstyr</div>

          <div className="text-xs text-slate-500">
            Tildel udstyr til medarbejderen
          </div>
        </div>

        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
        >
          <Plus className="h-3.5 w-3.5" />
          Tilføj
        </button>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-white p-2 sm:grid-cols-[140px_1fr_auto]"
          >
            <input
              type="text"
              value={item.label}
              onChange={(e) => updateItem(item.id, "label", e.target.value)}
              placeholder="Type"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />

            <input
              type="text"
              value={item.value}
              onChange={(e) => updateItem(item.id, "value", e.target.value)}
              placeholder="Værdi / nummer"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />

            <button
              type="button"
              onClick={() => removeItem(item.id)}
              disabled={items.length <= 1}
              className="inline-flex items-center justify-center rounded-md border border-rose-200 bg-white px-2 py-2 text-rose-700 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-40"
              title="Fjern udstyr"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
