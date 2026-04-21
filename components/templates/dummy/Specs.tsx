import type { SpecItem } from "@/lib/claude/schema";

type Props = {
  items: SpecItem[];
};

export function DummySpecs({ items }: Props) {
  return (
    <div className="bg-gray-50 px-10 py-12">
      <h3 className="text-xl font-semibold text-gray-900">상세 스펙</h3>
      <table className="mt-6 w-full border-collapse text-sm">
        <tbody>
          {items.map((s, i) => (
            <tr key={i} className="border-b border-gray-200 last:border-b-0">
              <th className="w-40 bg-white py-3 pl-4 text-left font-medium text-gray-600">
                {s.label}
              </th>
              <td className="py-3 pl-4 text-gray-900">{s.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
