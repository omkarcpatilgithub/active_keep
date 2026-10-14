"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingForm() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobileNumber: value }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Something went wrong");
        return;
      }
      router.replace("/chat");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 rounded-xl border border-neutral-200 p-6 shadow-sm">
      <div>
        <h1 className="text-xl font-semibold">One last step</h1>
        <p className="mt-1 text-sm text-neutral-600">Add your mobile number to finish setting up your account.</p>
      </div>
      <div>
        <label htmlFor="mobile" className="mb-1 block text-sm font-medium">
          Mobile number
        </label>
        <input
          id="mobile"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+14155552671"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
          required
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {saving ? "Saving..." : "Continue"}
      </button>
    </form>
  );
}
