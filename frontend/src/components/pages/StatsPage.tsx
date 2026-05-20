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
import {
  avgRetrievalDelayTrend,
  kpis,
  responseRateByChannel,
  resultStatusDistribution,
  retrievalByExamType,
  weeklyReminderVolume,
} from '../../data/mockStats';

const CORAIL = '#E85D4A';

const CHANNEL_COLORS = {
  email: '#007AFF',
  sms: '#34C759',
  whatsapp: '#25D366',
  appel: '#5856D6',
  courrier: '#003DA5',
};

const frenchNumber = (n: number) =>
  n.toLocaleString('fr-FR', { maximumFractionDigits: 1 });

interface KpiCardProps {
  label: string;
  value: string;
  tone?: 'default' | 'danger';
}

function KpiCard({ label, value, tone = 'default' }: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4 min-w-[180px] flex-1">
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </div>
      <div
        className={`text-2xl font-bold mt-1 ${
          tone === 'danger' ? 'text-red-500' : 'text-gray-900'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
}

function ChartCard({
  title,
  subtitle,
  children,
  height = 250,
}: ChartCardProps) {
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

const tooltipStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  fontSize: 12,
  padding: '6px 10px',
  boxShadow: '0 4px 6px rgba(0,0,0,0.06)',
};

export function StatsPage() {
  const totalDossiers = resultStatusDistribution.reduce(
    (acc, s) => acc + s.count,
    0,
  );

  return (
    <div className="mx-auto max-w-[1200px] p-6">
      <header className="mb-6">
        <h1 className="text-lg font-semibold text-gray-900">Statistiques</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Données de démonstration
        </p>
      </header>

      <div className="flex flex-wrap gap-3 mb-6">
        <KpiCard
          label="Patients suivis"
          value={frenchNumber(kpis.totalPatients)}
        />
        <KpiCard
          label="Taux de récupération"
          value={`${frenchNumber(kpis.retrievalRate)}%`}
        />
        <KpiCard
          label="Délai moyen"
          value={`${frenchNumber(kpis.avgDelay)} j`}
        />
        <KpiCard
          label="Relances actives"
          value={frenchNumber(kpis.activeReminders)}
        />
        <KpiCard
          label="Dossiers expirés"
          value={frenchNumber(kpis.overdueCount)}
          tone={kpis.overdueCount > 0 ? 'danger' : 'default'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Taux de réponse par canal"
          subtitle="Pourcentage de patients ayant réagi"
        >
          <BarChart
            data={responseRateByChannel}
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
              dataKey="channel"
              tick={{ fontSize: 11, fill: '#374151' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
              width={70}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              cursor={{ fill: 'rgba(0,0,0,0.03)' }}
              formatter={(v) => [`${v}%`, 'Taux']}
            />
            <Bar
              dataKey="rate"
              radius={[0, 6, 6, 0]}
              label={{
                position: 'right',
                fontSize: 11,
                fill: '#6B7280',
                formatter: (v) => `${v}%`,
              }}
            >
              {responseRateByChannel.map((entry) => (
                <Cell key={entry.channel} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ChartCard>

        <ChartCard
          title="Délai moyen de récupération"
          subtitle="6 derniers mois — en jours"
        >
          <AreaChart
            data={avgRetrievalDelayTrend}
            margin={{ top: 8, right: 16, left: -16, bottom: 8 }}
          >
            <defs>
              <linearGradient id="gradientCorail" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={CORAIL}
                  stopOpacity={0.15}
                />
                <stop
                  offset="95%"
                  stopColor={CORAIL}
                  stopOpacity={0.02}
                />
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
        </ChartCard>

        <ChartCard
          title="Répartition des dossiers"
          subtitle={`${frenchNumber(totalDossiers)} dossiers au total`}
        >
          <PieChart>
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v, n) => [frenchNumber(Number(v)), String(n)]}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 11 }}
            />
            <Pie
              data={resultStatusDistribution}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="45%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={2}
              isAnimationActive={false}
            >
              {resultStatusDistribution.map((entry) => (
                <Cell key={entry.status} fill={entry.color} />
              ))}
            </Pie>
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
          </PieChart>
        </ChartCard>

        <ChartCard
          title="Volume de relances par semaine"
          subtitle="8 dernières semaines"
        >
          <BarChart
            data={weeklyReminderVolume}
            margin={{ top: 8, right: 16, left: -16, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              dataKey="week"
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
              tickLine={false}
            />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              wrapperStyle={{ fontSize: 11 }}
            />
            <Bar
              dataKey="email"
              stackId="reminders"
              fill={CHANNEL_COLORS.email}
              name="Email"
              isAnimationActive={false}
            />
            <Bar
              dataKey="sms"
              stackId="reminders"
              fill={CHANNEL_COLORS.sms}
              name="SMS"
              isAnimationActive={false}
            />
            <Bar
              dataKey="whatsapp"
              stackId="reminders"
              fill={CHANNEL_COLORS.whatsapp}
              name="WhatsApp"
              isAnimationActive={false}
            />
            <Bar
              dataKey="appel"
              stackId="reminders"
              fill={CHANNEL_COLORS.appel}
              name="Appel"
              isAnimationActive={false}
            />
            <Bar
              dataKey="courrier"
              stackId="reminders"
              fill={CHANNEL_COLORS.courrier}
              name="Courrier"
              radius={[6, 6, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartCard>
      </div>

      <div className="mt-4">
        <ChartCard
          title="Taux de récupération par type d'examen"
          subtitle="Pourcentage de résultats récupérés"
          height={320}
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
                formatter: (v) => `${v}%`,
              }}
            />
          </BarChart>
        </ChartCard>
      </div>
    </div>
  );
}
