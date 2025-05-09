import { useState } from 'react';
import { calculateGrossMargin } from '../utils/grossMargin';

export default function GMCalculatorExample() {
  const [cost, setCost] = useState(549.25);
  const [price, setPrice] = useState(3196);

  const { gm, gmPercent } = calculateGrossMargin(cost, price);

  return (
    <div className="p-4 rounded-xl shadow bg-white max-w-md mx-auto mt-6">
      <h2 className="text-xl font-bold mb-4">GM Calculator Example</h2>

      <label className="block mb-2">
        Cost Price:
        <input
          type="number"
          className="w-full border px-2 py-1 rounded"
          value={cost}
          onChange={(e) => setCost(parseFloat(e.target.value))}
        />
      </label>

      <label className="block mb-2">
        Selling Price:
        <input
          type="number"
          className="w-full border px-2 py-1 rounded"
          value={price}
          onChange={(e) => setPrice(parseFloat(e.target.value))}
        />
      </label>

      <div className="mt-4 text-sm">
        <p><strong>Gross Margin:</strong> NOK {gm}</p>
        <p><strong>Gross Margin %:</strong> {gmPercent}%</p>
      </div>
    </div>
  );
}