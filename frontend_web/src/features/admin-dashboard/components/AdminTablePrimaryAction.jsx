export function AdminTablePrimaryAction({
  children,
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={`pd-admin-table-primary-action${className ? ` ${className}` : ""}`}
      {...props}
    >
      {children}
    </button>
  );
}
