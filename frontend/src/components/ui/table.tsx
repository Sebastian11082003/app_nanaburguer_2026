import * as React from "react";

export function Table({
  className = "",
  ...props
}: React.TableHTMLAttributes<HTMLTableElement>) {
  return <table className={`w-full text-sm ${className}`} {...props} />;
}

export function TableHeader({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className={`border-b border-zinc-800 ${className}`} {...props} />
  );
}

export function TableBody({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={className} {...props} />;
}

export function TableRow({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={`
        border-b
        border-zinc-900
        transition-colors
        hover:bg-zinc-900
        ${className}
      `}
      {...props}
    />
  );
}

export function TableHead({
  className = "",
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={`
        px-4
        py-3
        text-left
        font-medium
        text-zinc-400
        ${className}
      `}
      {...props}
    />
  );
}

export function TableCell({
  className = "",
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={`
        px-4
        py-3
        text-white
        ${className}
      `}
      {...props}
    />
  );
}
