import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../services/reportsApi';

export function useReports() {
  const { data: rawData, isLoading, isError, error } = useQuery({
    queryKey: ['cniReport'],
    queryFn: reportsApi.getCniReportDetail,
  });

  const generateChartData = (data) => {
    if (!data || !Array.isArray(data)) return null;

    let categories = [];
    let caseValues = [];
    let itemCntInPro = [];
    let itemCntRej = [];
    let itemCntOnHold = [];

    // Table specific counts
    let SG1CntInProTbl = [], SG1CntRejTbl = [], SG1CntOnHoldTbl = [];
    let SG2CntInProTbl = [], SG2CntRejTbl = [], SG2CntOnHoldTbl = [];
    let SG3CntInProTbl = [], SG3CntRejTbl = [], SG3CntOnHoldTbl = [];
    let SG4CntInProTbl = [], SG4CntRejTbl = [], SG4CntOnHoldTbl = [];
    let SG5CntInProTbl = [], SG5CntRejTbl = [], SG5CntOnHoldTbl = [];

    data.forEach(value => {
      if (!categories.includes(value.stagename)) {
        categories.push(value.stagename);
      }
      if (!caseValues.includes(value.caseValue)) {
        caseValues.push(value.caseValue);
      }

      if (value.caseValue === "In Process") itemCntInPro.push(value.cnt);
      else if (value.caseValue === "On Hold") itemCntOnHold.push(value.cnt);
      else if (value.caseValue === "Rejected") itemCntRej.push(value.cnt);

      // SG1
      if (value.stagename === 'Stage 1' || value.stagename === 'Gate A') {
        if (value.caseValue === "In Process") SG1CntInProTbl.push(value.cnt);
        if (value.caseValue === "On Hold") SG1CntOnHoldTbl.push(value.cnt);
        if (value.caseValue === "Rejected") SG1CntRejTbl.push(value.cnt);
      }
      // SG2
      if (value.stagename === 'Stage 2' || value.stagename === 'Gate B') {
        if (value.caseValue === "In Process") SG2CntInProTbl.push(value.cnt);
        if (value.caseValue === "On Hold") SG2CntOnHoldTbl.push(value.cnt);
        if (value.caseValue === "Rejected") SG2CntRejTbl.push(value.cnt);
      }
      // SG3
      if (value.stagename === 'Stage 3' || value.stagename === 'Gate C') {
        if (value.caseValue === "In Process") SG3CntInProTbl.push(value.cnt);
        if (value.caseValue === "On Hold") SG3CntOnHoldTbl.push(value.cnt);
        if (value.caseValue === "Rejected") SG3CntRejTbl.push(value.cnt);
      }
      // SG4
      if (value.stagename === 'Stage 4' || value.stagename === 'Gate D') {
        if (value.caseValue === "In Process") SG4CntInProTbl.push(value.cnt);
        if (value.caseValue === "On Hold") SG4CntOnHoldTbl.push(value.cnt);
        if (value.caseValue === "Rejected") SG4CntRejTbl.push(value.cnt);
      }
      // SG5
      if (value.stagename === 'Stage 5' || value.stagename === 'Gate E' || value.stagename === "Stage 5-A") {
        if (value.caseValue === "In Process") SG5CntInProTbl.push(value.cnt);
        if (value.caseValue === "On Hold") SG5CntOnHoldTbl.push(value.cnt);
        if (value.caseValue === "Rejected") SG5CntRejTbl.push(value.cnt);
      }
    });

    const sum = (arr) => arr.reduce((a, b) => a + b, 0);

    const tableData = {
      SG1: { InProcess: sum(SG1CntInProTbl), OnHold: sum(SG1CntOnHoldTbl), Rejected: sum(SG1CntRejTbl) },
      SG2: { InProcess: sum(SG2CntInProTbl), OnHold: sum(SG2CntOnHoldTbl), Rejected: sum(SG2CntRejTbl) },
      SG3: { InProcess: sum(SG3CntInProTbl), OnHold: sum(SG3CntOnHoldTbl), Rejected: sum(SG3CntRejTbl) },
      SG4: { InProcess: sum(SG4CntInProTbl), OnHold: sum(SG4CntOnHoldTbl), Rejected: sum(SG4CntRejTbl) },
      SG5: { InProcess: sum(SG5CntInProTbl), OnHold: sum(SG5CntOnHoldTbl), Rejected: sum(SG5CntRejTbl) },
    };

    const chartOptions = {
      chart: { type: 'column' },
      title: { text: 'Total Count of CNI Projects' },
      subtitle: { text: 'Source: Entgra' },
      xAxis: { categories, crosshair: true },
      yAxis: { min: 0, title: { text: 'Count in Number' }, allowDecimals: false },
      tooltip: {
        headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
        pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
            '<td style="padding:0"><b>{point.y:.0f} count</b></td></tr>',
        footerFormat: '</table>',
        shared: true,
        useHTML: true
      },
      plotOptions: {
        column: { pointPadding: 0.2, borderWidth: 0 }
      },
      series: [
        { name: caseValues[0] || 'In Process', data: itemCntInPro },
        { name: caseValues[1] || 'On Hold', data: itemCntOnHold },
        { name: caseValues[2] || 'Rejected', data: itemCntRej }
      ]
    };

    return { chartOptions, tableData };
  };

  const processedData = generateChartData(rawData);

  return {
    rawData,
    chartOptions: processedData?.chartOptions,
    tableData: processedData?.tableData,
    isLoading,
    isError,
    error,
  };
}
