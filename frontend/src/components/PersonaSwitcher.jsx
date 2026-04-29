export default function PersonaSwitcher({ personas, activeId, onChange }) {
  return (
    <div className="persona-list">
      {personas.map((persona) => (
        <button
          key={persona.id}
          type="button"
          className={`persona-button ${activeId === persona.id ? "active" : ""}`}
          onClick={() => onChange(persona.id)}
        >
          <div className="persona-title">{persona.name}</div>
          <div className="persona-subtitle">{persona.subtitle}</div>
        </button>
      ))}
    </div>
  );
}
