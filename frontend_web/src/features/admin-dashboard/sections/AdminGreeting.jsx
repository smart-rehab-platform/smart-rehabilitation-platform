export function AdminGreeting({ name = "Admin" }) {
  return (
    <section className="pd-greeting pd-admin-greeting pd-section-enter" aria-label="Admin greeting">
      <div className="pd-greeting-main">
        <h1>Welcome, {name}</h1>
        <p>Manage your rehabilitation platform from one place.</p>
      </div>
    </section>
  );
}
