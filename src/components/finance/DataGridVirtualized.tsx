import { useState, useMemo } from 'react';

interface DataGridVirtualizedProps {
  data: any[];
  columns: {
    key: string;
    label: string;
    width: number;
    render?: (value: any, row: any, index: number) => React.ReactNode;
  }[];
  height?: number;
  rowHeight?: number;
  onRowClick?: (row: any, index: number) => void;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
}

export const DataGridVirtualized = ({
  data,
  columns,
  height = 400,
  rowHeight = 50,
  onRowClick
}: DataGridVirtualizedProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalWidth = useMemo(() => 
    columns.reduce((sum, col) => sum + col.width, 0), 
    [columns]
  );

  const Row = ({ index, style }: RowProps) => {
    const item = data[index];
    const isHovered = hoveredIndex === index;

    return (
      <div
        style={style}
        className={`flex border-b cursor-pointer transition-colors ${
          isHovered ? 'bg-muted/50' : 'bg-background'
        }`}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
        onClick={() => onRowClick?.(item, index)}
      >
        {columns.map((column, colIndex) => (
          <div
            key={column.key}
            className="flex items-center px-3 py-2 text-sm border-r last:border-r-0"
            style={{ width: column.width, minWidth: column.width }}
          >
            {column.render
              ? column.render(item[column.key], item, index)
              : String(item[column.key] || '-')
            }
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-muted/50 border-b">
        <div className="flex" style={{ width: totalWidth }}>
          {columns.map((column) => (
            <div
              key={column.key}
              className="flex items-center px-3 py-3 text-sm font-medium border-r last:border-r-0"
              style={{ width: column.width, minWidth: column.width }}
            >
              {column.label}
            </div>
          ))}
        </div>
      </div>

      {/* Simple scrollable body (virtualization to be added later) */}
      <div style={{ height, width: '100%', overflowY: 'auto' }}>
        {data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Nenhum registro encontrado
          </div>
        ) : (
          data.slice(0, 100).map((item, index) => (
            <Row key={index} index={index} style={{ height: rowHeight }} />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="bg-muted/30 border-t px-3 py-2 text-sm text-muted-foreground">
        Total: {data.length} registros
      </div>
    </div>
  );
};