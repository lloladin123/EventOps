"use client";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "@/store/store";
import { increment, decrement } from "@/state/counter/counterSlice";

export default function Home() {
  const value = useSelector((state: RootState) => state.counter.value);
  const dispatch = useDispatch<AppDispatch>();

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-3xl font-bold">Counter: {value}</h1>

      <div className="flex gap-3">
        <button
          className="px-4 py-2 bg-black text-white rounded"
          onClick={() => dispatch(decrement())}
        >
          -
        </button>
        <button
          className="px-4 py-2 bg-black text-white rounded"
          onClick={() => dispatch(increment())}
        >
          +
        </button>
      </div>
    </main>
  );
}
