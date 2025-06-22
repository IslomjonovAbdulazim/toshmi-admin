import React from 'react';

const Table = ({ columns, data, actions }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.title}</th>
          ))}
          {actions && <th>Amallar</th>}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {columns.map((column) => (
              <td key={column.key}>
                {column.render ? column.render(row[column.key], row) : row[column.key]}
              </td>
            ))}
            {actions && (
              <td>
                <div className="actions">
                  {actions(row)}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;