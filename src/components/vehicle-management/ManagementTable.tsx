import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface TableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (item: T) => React.ReactNode;
}

interface ManagementTableProps<T> {
  columns: TableColumn<T>[];
  rows: T[];
  isLoading?: boolean;
  emptyLabel?: string;
}

export function ManagementTable<T>({
  columns,
  rows,
  isLoading,
  emptyLabel = "No data found."
}: ManagementTableProps<T>) {
  return (
    <div className="overflow-hidden rounded-lg border border-border/50 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-0">
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                {columns.map((column) => (
                  <TableCell key={`${column.key}-${index}`}>
                    <Skeleton className="h-5 w-full max-w-[10rem]" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          {!isLoading && rows.length === 0 && (
            <TableRow>
              <TableCell
                className={cn("h-24 text-center text-sm text-muted-foreground")}
                colSpan={columns.length}
              >
                {emptyLabel}
              </TableCell>
            </TableRow>
          )}
          {!isLoading &&
            rows.map((row, index) => (
              <TableRow key={`row-${index}`}>
                {columns.map((column) => (
                  <TableCell key={`${column.key}-${index}`}>
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
