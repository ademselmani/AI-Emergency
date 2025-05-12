import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Lundi', valeur: 30 },
  { name: 'Mardi', valeur: 50 },
  { name: 'Mercredi', valeur: 40 },
  { name: 'Jeudi', valeur: 70 },
  { name: 'Vendredi', valeur: 60 },
];

const Supervision = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Page de Supervision</h1>
      <p className="mb-6">
        Voici la courbe de supervision de la semaine. Elle vous permet de visualiser les données de manière efficace.
      </p>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid stroke="#ccc" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="valeur" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Supervision;
