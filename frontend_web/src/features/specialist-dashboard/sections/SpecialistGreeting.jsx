export function SpecialistGreeting({ firstName }) {
  return (
    <section className="pd-greeting pd-section-enter" aria-label="Specialist greeting">
      <div className="pd-greeting-main">
        <h1>Welcome back, {firstName}</h1>
        <p>Here&apos;s an overview of your clinical work today.</p>
      </div>
    </section>
  );
}
