export default function StatsCards({ items }) {
  return (
    <section className="grid stats">
      {items.map((item) => (
        <article className="card" key={item.label}>
          <div className="muted">{item.label}</div>
          <div className="stat-value">{item.value}</div>
        </article>
      ))}
    </section>
  );
}
