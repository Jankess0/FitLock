export function BlockView() {
  return (
    <div className="tab-view">
      <div className="logged-actions">
        <button className="btn-primary btn-block" type="button">
          Blokuj tę stronę
        </button>
        <button className="btn-secondary-text" type="button">
          Edytuj listę blokowanych stron
        </button>
      </div>
    </div>
  );
}