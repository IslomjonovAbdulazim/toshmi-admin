import React from 'react';

const Table = ({ 
  columns, 
  data, 
  loading = false, 
  emptyMessage = 'Ma\'lumotlar topilmadi',
  className = ''
}) => {
  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Ma'lumotlar yuklanmoqda...
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-4">📭</div>
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key} className={column.headerClassName || ''}>
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={row.id || index}>
              {columns.map((column) => (
                <td key={column.key} className={column.cellClassName || ''}>
                  {column.render 
                    ? column.render(row, index)
                    : row[column.key]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;