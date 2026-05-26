interface FundSnapshotProps {
  fund: {
    aum: number;
    expense_ratio: number;
    min_sip_amount: number;
    min_lumpsum: number;
    launch_date: string;
    exit_load: string;
  };
}

export default function FundSnapshot({ fund }: FundSnapshotProps) {
  const formatCrore = (val: number) => {
    if (!val) return 'N/A';
    if (val >= 10000) return `₹${(val / 10000).toFixed(2)} Lac Cr`;
    return `₹${val.toFixed(2)} Cr`;
  };
  const formatDate = (date: string) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="text-sm text-gray-500">AUM</div>
        <div className="text-xl font-bold">{formatCrore(fund.aum)}</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="text-sm text-gray-500">Expense Ratio</div>
        <div className="text-xl font-bold">{fund.expense_ratio ?? 'N/A'}%</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="text-sm text-gray-500">Min SIP</div>
        <div className="text-xl font-bold">₹{fund.min_sip_amount ?? 'N/A'}</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="text-sm text-gray-500">Min Lumpsum</div>
        <div className="text-xl font-bold">₹{fund.min_lumpsum ?? 'N/A'}</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="text-sm text-gray-500">Launch Date</div>
        <div className="text-xl font-bold">{formatDate(fund.launch_date)}</div>
      </div>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="text-sm text-gray-500">Exit Load</div>
        <div className="text-xl font-bold">{fund.exit_load || 'N/A'}</div>
      </div>
    </div>
  );
}
