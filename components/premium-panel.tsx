export function PremiumPanel({
  children,
  className = ""
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`rounded-lg bg-white/92 p-6 shadow-luxury ring-1 ring-ruby-900/10 backdrop-blur ${className}`}>
      {children}
    </section>
  );
}

export function LuxuryButton({
  children,
  className = "",
  variant = "ruby",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "ruby" | "charcoal" | "outline";
}) {
  const styles = {
    ruby: "bg-ruby-900 text-white shadow-luxury hover:bg-ruby-700",
    charcoal: "bg-charcoal text-white hover:bg-charcoal/90",
    outline: "border border-ruby-900/20 text-ruby-900 hover:bg-ruby-50"
  };

  return (
    <button
      {...props}
      className={`rounded-lg px-5 py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function PremiumInput({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-charcoal/75">{label}</span>
      {children}
    </label>
  );
}
