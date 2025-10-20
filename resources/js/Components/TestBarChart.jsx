 // resources/js/Components/TestBarChart.jsx
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const data = [
  { hari: 'Senin', total: 4000 },
  { hari: 'Selasa', total: 3000 },
  { hari: 'Rabu', total: 2000 },
  { hari: 'Kamis', total: 2780 },
  { hari: 'Jumat', total: 1890 },
];

export default function TestBarChart() {
  return (
    <div className="flex justify-center items-center w-full mt-8">
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 20, right: 30, left: 20, bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="hari" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="total" fill="#4f46e5" />
      </BarChart>
    </div>
  );
}
