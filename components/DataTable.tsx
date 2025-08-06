
import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';

interface Column<T> {
  Header: string;
  accessor: keyof T;
}

interface DataTableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  exportFilename?: string;
}

const DataTable = <T extends object>({ columns, data, exportFilename = 'data' }: DataTableProps<T>) => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortConfig, setSortConfig] = useState<{ key: keyof T; direction: 'asc' | 'desc' } | null>(null);

  const filteredAndSortedData = useMemo(() => {
    let filteredData = data.filter(row => {
      return columns.every(col => {
        const filterValue = filters[col.accessor as string]?.toLowerCase() || '';
        const rowValue = String(row[col.accessor]).toLowerCase();
        return rowValue.includes(filterValue);
      });
    });

    if (sortConfig !== null) {
      filteredData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filteredData;
  }, [data, filters, sortConfig, columns]);

  const handleFilterChange = (accessor: keyof T, value: string) => {
    setFilters(prev => ({ ...prev, [accessor as string]: value }));
  };

  const requestSort = (key: keyof T) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
    
  const exportToCsv = () => {
    const headers = columns.map(c => c.Header).join(',');
    const rows = filteredAndSortedData.map(row => 
        columns.map(col => `"${String(row[col.accessor]).replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const csvString = `${headers}\n${rows}`;
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.href) {
      URL.revokeObjectURL(link.href);
    }
    link.href = URL.createObjectURL(blob);
    link.download = `${exportFilename}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToXlsx = () => {
    const dataToExport = filteredAndSortedData.map(row => {
      let newRow: Record<string, any> = {};
      columns.forEach(col => {
        newRow[col.Header] = row[col.accessor];
      });
      return newRow;
    });

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    XLSX.writeFile(workbook, `${exportFilename}.xlsx`);
  };

  return (
    <div>
        <div className="flex justify-end gap-2 mb-4">
            <button onClick={exportToCsv} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md text-sm">
                Exporter en CSV
            </button>
            <button onClick={exportToXlsx} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md text-sm">
                Exporter en Excel
            </button>
        </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={col.accessor as string} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex flex-col">
                    <button onClick={() => requestSort(col.accessor)} className="font-bold text-left mb-1 flex items-center gap-1">
                      {col.Header}
                      {sortConfig?.key === col.accessor && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                    </button>
                    <input
                      type="text"
                      placeholder={`Filtrer...`}
                      value={filters[col.accessor as string] || ''}
                      onChange={e => handleFilterChange(col.accessor, e.target.value)}
                      className="text-xs p-1 border border-gray-300 rounded"
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {columns.map(col => (
                  <td key={col.accessor as string} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {String(row[col.accessor])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {filteredAndSortedData.length === 0 && (
            <p className="text-center py-10 text-gray-500">Aucune donnée à afficher.</p>
        )}
      </div>
    </div>
  );
};

export default DataTable;
