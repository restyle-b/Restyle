import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold">דשבורד</h1>
      <p className="mt-2 text-neutral-400">בחרו פעולה מהתפריט.</p>
      <ul className="mt-6 space-y-2">
        <li>
          <Link href="/admin/settings" className="text-accent hover:underline">
            הגדרות אתר ושעות פתיחה
          </Link>
        </li>
      </ul>
    </div>
  );
}
