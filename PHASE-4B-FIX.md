# Phase 4B — Corrections & Améliorations

Fichier unique à modifier : `frontend/src/components/pages/StatsPage.tsx`

## Fix 1 — Remplacer LineChart par AreaChart

Le `<Line>` avec `fill`/`fillOpacity` ne crée pas de remplissage sous la courbe. Il faut utiliser `AreaChart` + `Area`.

Dans les imports, ajouter `Area` et `AreaChart`, retirer `Line` et `LineChart` :
```typescript
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
```

Remplacer le bloc `<LineChart>` du "Délai moyen de récupération" par :
```tsx
<AreaChart
  data={avgRetrievalDelayTrend}
  margin={{ top: 8, right: 16, left: -16, bottom: 8 }}
>
  <defs>
    <linearGradient id="gradientCorail" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor={CORAIL} stopOpacity={0.15} />
      <stop offset="95%" stopColor={CORAIL} stopOpacity={0.02} />
    </linearGradient>
  </defs>
  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
  <XAxis
    dataKey="month"
    tick={{ fontSize: 11, fill: '#6B7280' }}
    axisLine={{ stroke: '#E5E7EB' }}
    tickLine={false}
  />
  <YAxis
    tick={{ fontSize: 11, fill: '#6B7280' }}
    axisLine={{ stroke: '#E5E7EB' }}
    tickLine={false}
    tickFormatter={(v) => `${v}j`}
  />
  <Tooltip
    contentStyle={tooltipStyle}
    formatter={(v) => [`${v} j`, 'Délai moyen']}
  />
  <Area
    type="monotone"
    dataKey="days"
    stroke={CORAIL}
    strokeWidth={2.5}
    fill="url(#gradientCorail)"
    dot={{ r: 4, fill: CORAIL, strokeWidth: 0 }}
    activeDot={{ r: 6 }}
    isAnimationActive={false}
  />
</AreaChart>
```

## Fix 2 — Ajouter le label central au donut

Après le `<Pie>` component (et avant `</PieChart>`), ajouter un texte SVG au centre :
```tsx
<text
  x="50%"
  y="42%"
  textAnchor="middle"
  dominantBaseline="central"
  className="fill-gray-900 font-bold"
  style={{ fontSize: 22 }}
>
  {frenchNumber(totalDossiers)}
</text>
<text
  x="50%"
  y="52%"
  textAnchor="middle"
  dominantBaseline="central"
  className="fill-gray-400"
  style={{ fontSize: 11 }}
>
  dossiers
</text>
```

## Fix 3 — Ajouter le 5ème graphique : Taux par type d'examen

Ajouter l'import de `retrievalByExamType` depuis mockStats :
```typescript
import {
  avgRetrievalDelayTrend,
  kpis,
  responseRateByChannel,
  resultStatusDistribution,
  retrievalByExamType,
  weeklyReminderVolume,
} from '../../data/mockStats';
```

Ajouter un 5ème ChartCard après le grid existant. Changer le grid pour supporter le 5ème graphique qui prend toute la largeur en bas :

Après la `</div>` qui ferme le grid `grid-cols-1 lg:grid-cols-2 gap-4`, ajouter :
```tsx
<div className="mt-4">
  <ChartCard
    title="Taux de récupération par type d'examen"
    subtitle="Pourcentage de résultats récupérés"
  >
    <BarChart
      data={retrievalByExamType}
      layout="vertical"
      margin={{ top: 8, right: 32, left: 8, bottom: 8 }}
    >
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="#E5E7EB"
        horizontal={false}
      />
      <XAxis
        type="number"
        domain={[0, 100]}
        tick={{ fontSize: 11, fill: '#6B7280' }}
        tickFormatter={(v) => `${v}%`}
        axisLine={{ stroke: '#E5E7EB' }}
        tickLine={false}
      />
      <YAxis
        type="category"
        dataKey="exam"
        tick={{ fontSize: 11, fill: '#374151' }}
        axisLine={{ stroke: '#E5E7EB' }}
        tickLine={false}
        width={140}
      />
      <Tooltip
        contentStyle={tooltipStyle}
        cursor={{ fill: 'rgba(0,0,0,0.03)' }}
        formatter={(v) => [`${v}%`, 'Taux']}
      />
      <Bar
        dataKey="rate"
        radius={[0, 6, 6, 0]}
        fill={CORAIL}
        isAnimationActive={false}
        label={{
          position: 'right',
          fontSize: 11,
          fill: '#6B7280',
          formatter: (v: number) => `${v}%`,
        }}
      />
    </BarChart>
  </ChartCard>
</div>
```

Ce 5ème graphique prend toute la largeur et utilise la couleur RainPath (#E85D4A) — c'est une vue transversale par type d'examen, distincte de la vue par canal.

Sa hauteur devrait être plus grande car il y a 9 types d'examen. Modifier le ChartCard pour ce cas : ajouter une prop optionnelle `height` au ChartCard :

```typescript
interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
}

function ChartCard({ title, subtitle, children, height = 250 }: ChartCardProps) {
  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <header className="mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </header>
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </section>
  );
}
```

Et utiliser `height={320}` pour le graphique par type d'examen (9 barres nécessitent plus de hauteur).

## Vérifications

1. `cd frontend && npx tsc --noEmit` → 0 erreur
2. Vérifier visuellement que :
   - Le graphique d'évolution du délai a un remplissage dégradé sous la courbe
   - Le donut affiche le total "1 115" au centre + "dossiers" en dessous
   - Le 5ème graphique (taux par type d'examen) s'affiche en pleine largeur sous le grid
3. Pas de warning React dans la console
4. Git commit : `fix: Phase 4B — area chart, donut label, graphique par examen`
