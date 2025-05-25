import { Document, Page, Text, View, StyleSheet, Svg, Path, Image, Line } from '@react-pdf/renderer';
import { Day } from '../types';
import { formatCurrency } from '../utils/format';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 20,
    fontFamily: 'Helvetica'
  },
  header: {
    marginBottom: 15,
    borderBottom: '1 solid #1e40af',
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    flex: 1
  },
  headerRight: {
    width: 80,
    height: 25
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 2
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b'
  },
  section: {
    marginBottom: 12,
    backgroundColor: '#ffffff',
    borderRadius: 6,
    padding: 10,
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    borderBottom: '1 solid #3b82f6',
    paddingBottom: 4
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4
  },
  gridItem: {
    width: '50%',
    padding: 4
  },
  card: {
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 6,
    marginBottom: 6,
    border: '1 solid #e2e8f0'
  },
  cardTitle: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: 'bold'
  },
  cardValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 2
  },
  cardGoal: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 4
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 2
  },
  chart: {
    height: 150,
    marginVertical: 10,
    backgroundColor: '#f8fafc',
    padding: 10,
    borderRadius: 6,
    border: '1 solid #e2e8f0'
  },
  chartBar: {
    width: 25,
    backgroundColor: '#3b82f6',
    marginHorizontal: 3
  },
  chartLabel: {
    fontSize: 8,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 2
  },
  table: {
    display: 'flex',
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
    borderRadius: 4,
    overflow: 'hidden'
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minHeight: 24
  },
  tableHeader: {
    backgroundColor: '#1e40af',
    color: '#ffffff'
  },
  tableCell: {
    padding: 4,
    fontSize: 8,
    flex: 1,
    textAlign: 'left'
  },
  headerCell: {
    padding: 4,
    fontSize: 8,
    flex: 1,
    textAlign: 'left',
    color: '#ffffff',
    fontWeight: 'bold'
  },
  sectionHeader: {
    backgroundColor: '#f1f5f9',
    padding: 4,
    marginBottom: 6,
    borderRadius: 3,
    borderLeft: '2 solid #1e40af'
  },
  sectionHeaderText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1e40af'
  },
  twoColumnLayout: {
    flexDirection: 'row',
    gap: 10
  },
  column: {
    flex: 1
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 4,
    gap: 10
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3
  },
  legendColor: {
    width: 6,
    height: 6,
    borderRadius: 1
  },
  legendText: {
    fontSize: 8,
    color: '#64748b'
  },
  metricGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -3
  },
  metricItem: {
    width: '25%',
    padding: 3
  },
  metricCard: {
    backgroundColor: '#f8fafc',
    padding: 6,
    borderRadius: 4,
    border: '1 solid #e2e8f0'
  },
  metricLabel: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 1
  },
  metricValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af'
  }
});

interface Goal {
  section: string;
  goals: number[];
}

interface PDFReportProps {
  selectedDay: Day;
  avsAssignments: any[];
  insuranceAgreements: any[];
  precalibratedTVs: any[];
  repairTickets: any[];
  goalsData: Goal[];
}

export default function PDFReport({
  selectedDay,
  avsAssignments,
  insuranceAgreements,
  precalibratedTVs,
  repairTickets,
  goalsData
}: PDFReportProps) {
  // Calculate totals and goals
  const totalGM = avsAssignments.reduce((sum, a) => sum + (a.gm || 0), 0);
  const totalTA = insuranceAgreements.reduce((sum, t) => sum + (t.sold || 0), 0);
  const totalTV = precalibratedTVs.reduce((sum, p) => sum + (p.completed || 0), 0);
  const totalTickets = repairTickets.reduce((sum, r) => sum + (r.completed || 0), 0);

  const taGoal = goalsData.find(g => g.section === 'Insurance Agreements')?.goals[5] || 0;
  const tvGoal = goalsData.find(g => g.section === 'Precalibrated TVs')?.goals[5] || 0;
  const ticketsGoal = goalsData.find(g => g.section === 'RepairTickets')?.goals[5] || 0;
  const gmGoal = goalsData.find(g => g.section === 'AVS')?.goals[5] || 0;

  // Calculate daily data for charts
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dailyData = days.map(day => ({
    day,
    gm: avsAssignments.filter(a => a.day === day).reduce((sum, a) => sum + (a.gm || 0), 0),
    avs: avsAssignments.filter(a => a.day === day).reduce((sum, a) => sum + (a.sold || 0), 0),
    ta: insuranceAgreements.filter(t => t.day === day).reduce((sum, t) => sum + (t.sold || 0), 0),
    tv: precalibratedTVs.filter(p => p.day === day).reduce((sum, p) => sum + (p.completed || 0), 0),
    tickets: repairTickets.filter(r => r.day === day).reduce((sum, r) => sum + (r.completed || 0), 0)
  }));

  // Calculate progress percentages
  const taProgress = (totalTA / taGoal) * 100;
  const tvProgress = (totalTV / tvGoal) * 100;
  const ticketsProgress = (totalTickets / ticketsGoal) * 100;
  const gmProgress = (totalGM / gmGoal) * 100;

  // Get unique people
  const people = new Set([
    ...avsAssignments.map((a) => a.person),
    ...insuranceAgreements.map((t) => t.person),
    ...precalibratedTVs.map((p) => p.person),
    ...repairTickets.map((r) => r.person),
  ]);

  // Calculate per-person breakdown
  const perPerson = Array.from(people).sort().map(person => ({
    person,
    gm: avsAssignments.filter(a => a.person === person).reduce((sum, a) => sum + (a.gm || 0), 0),
    avs: avsAssignments.filter(a => a.person === person).reduce((sum, a) => sum + (a.sold || 0), 0),
    ta: insuranceAgreements.filter(t => t.person === person).reduce((sum, t) => sum + (t.sold || 0), 0),
    tv: precalibratedTVs.filter(p => p.person === person).reduce((sum, p) => sum + (p.completed || 0), 0),
    tickets: repairTickets.filter(r => r.person === person).reduce((sum, r) => sum + (r.completed || 0), 0)
  }));

  // Calculate section totals
  const avsSection = avsAssignments.reduce((acc, a) => {
    acc[a.serviceId] = (acc[a.serviceId] || 0) + (a.sold || 0);
    return acc;
  }, {} as Record<string, number>);

  const taSection = insuranceAgreements.reduce((acc, t) => {
    acc[t.person] = (acc[t.person] || 0) + (t.sold || 0);
    return acc;
  }, {} as Record<string, number>);

  const tvSection = precalibratedTVs.reduce((acc, p) => {
    acc[p.person] = (acc[p.person] || 0) + (p.completed || 0);
    return acc;
  }, {} as Record<string, number>);

  const ticketsSection = repairTickets.reduce((acc, r) => {
    acc[r.person] = (acc[r.person] || 0) + (r.completed || 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>Weekly Performance Report</Text>
            <Text style={styles.subtitle}>Generated for {selectedDay}</Text>
          </View>
          <View style={styles.headerRight}>
            <Image src="/elkjop_logo.png" />
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Performance Indicators</Text>
          <View style={styles.metricGrid}>
            <View style={styles.metricItem}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Gross Margin</Text>
                <Text style={styles.metricValue}>{formatCurrency(totalGM)}</Text>
                <Text style={styles.cardGoal}>Goal: {formatCurrency(gmGoal)}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(gmProgress, 100)}%` }]} />
                </View>
              </View>
            </View>
            <View style={styles.metricItem}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Insurance Agreements</Text>
                <Text style={styles.metricValue}>{totalTA}</Text>
                <Text style={styles.cardGoal}>Goal: {taGoal}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(taProgress, 100)}%` }]} />
                </View>
              </View>
            </View>
            <View style={styles.metricItem}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Precalibrated TVs</Text>
                <Text style={styles.metricValue}>{totalTV}</Text>
                <Text style={styles.cardGoal}>Goal: {tvGoal}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(tvProgress, 100)}%` }]} />
                </View>
              </View>
            </View>
            <View style={styles.metricItem}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Repair Tickets</Text>
                <Text style={styles.metricValue}>{totalTickets}</Text>
                <Text style={styles.cardGoal}>Goal: {ticketsGoal}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${Math.min(ticketsProgress, 100)}%` }]} />
                </View>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.twoColumnLayout}>
          {/* Left Column */}
          <View style={styles.column}>
            {/* Daily Performance Chart */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Daily Performance</Text>
              <View style={styles.chart}>
                <Svg height="150" width="250">
                  {/* Grid lines */}
                  {[0, 37.5, 75, 112.5, 150].map((y, i) => (
                    <Line
                      key={i}
                      x1="0"
                      y1={y}
                      x2="250"
                      y2={y}
                      stroke="#e2e8f0"
                      strokeWidth="1"
                    />
                  ))}
                  
                  {/* GM Line */}
                  <Path
                    d={dailyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${i * 40 + 25} ${150 - (d.gm / Math.max(...dailyData.map(d => d.gm))) * 112.5}`).join(' ')}
                    stroke="#1e40af"
                    strokeWidth={2}
                    fill="none"
                  />
                  
                  {/* AVS Line */}
                  <Path
                    d={dailyData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${i * 40 + 25} ${150 - (d.avs / Math.max(...dailyData.map(d => d.avs))) * 112.5}`).join(' ')}
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="none"
                  />
                  
                  {/* X-axis labels */}
                  {dailyData.map((d, i) => (
                    <Text key={d.day} style={[styles.chartLabel, { position: 'absolute', left: i * 40 + 15, top: 155 }]}>
                      {d.day.slice(0, 3)}
                    </Text>
                  ))}
                </Svg>
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#1e40af' }]} />
                    <Text style={styles.legendText}>Gross Margin</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendColor, { backgroundColor: '#10b981' }]} />
                    <Text style={styles.legendText}>AVS</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Per Person Breakdown */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Per Person Breakdown</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.headerCell}>Person</Text>
                  <Text style={styles.headerCell}>GM</Text>
                  <Text style={styles.headerCell}>AVS</Text>
                  <Text style={styles.headerCell}>TA</Text>
                  <Text style={styles.headerCell}>TV</Text>
                  <Text style={styles.headerCell}>Tickets</Text>
                </View>
                {perPerson.map(row => (
                  <View key={row.person} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{row.person}</Text>
                    <Text style={styles.tableCell}>{formatCurrency(row.gm)}</Text>
                    <Text style={styles.tableCell}>{row.avs}</Text>
                    <Text style={styles.tableCell}>{row.ta}</Text>
                    <Text style={styles.tableCell}>{row.tv}</Text>
                    <Text style={styles.tableCell}>{row.tickets}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.column}>
            {/* Section Totals */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Section Totals</Text>
              
              {/* AVS by Service */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>AVS by Service</Text>
              </View>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.headerCell}>Service</Text>
                  <Text style={styles.headerCell}>Sold</Text>
                </View>
                {(Object.entries(avsSection) as [string, number][]).map(([service, sold]) => (
                  <View key={service} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{service}</Text>
                    <Text style={styles.tableCell}>{sold}</Text>
                  </View>
                ))}
              </View>

              {/* Insurance Agreements by Person */}
              <View style={[styles.sectionHeader, { marginTop: 15 }]}>
                <Text style={styles.sectionHeaderText}>Insurance Agreements by Person</Text>
              </View>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.headerCell}>Person</Text>
                  <Text style={styles.headerCell}>Sold</Text>
                </View>
                {(Object.entries(taSection) as [string, number][]).map(([person, sold]) => (
                  <View key={person} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{person}</Text>
                    <Text style={styles.tableCell}>{sold}</Text>
                  </View>
                ))}
              </View>

              {/* Precalibrated TVs by Person */}
              <View style={[styles.sectionHeader, { marginTop: 15 }]}>
                <Text style={styles.sectionHeaderText}>Precalibrated TVs by Person</Text>
              </View>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.headerCell}>Person</Text>
                  <Text style={styles.headerCell}>Completed</Text>
                </View>
                {(Object.entries(tvSection) as [string, number][]).map(([person, completed]) => (
                  <View key={person} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{person}</Text>
                    <Text style={styles.tableCell}>{completed}</Text>
                  </View>
                ))}
              </View>

              {/* Repair Tickets by Person */}
              <View style={[styles.sectionHeader, { marginTop: 15 }]}>
                <Text style={styles.sectionHeaderText}>Repair Tickets by Person</Text>
              </View>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={styles.headerCell}>Person</Text>
                  <Text style={styles.headerCell}>Completed</Text>
                </View>
                {(Object.entries(ticketsSection) as [string, number][]).map(([person, completed]) => (
                  <View key={person} style={styles.tableRow}>
                    <Text style={styles.tableCell}>{person}</Text>
                    <Text style={styles.tableCell}>{completed}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
} 