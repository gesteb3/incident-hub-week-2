import Dashboard from './Dashboard';
import IncidentWorkspace from './incidents/IncidentWorkspace';

export default function App() {
  const isDashboard = new URLSearchParams(window.location.search).get('view') === 'dashboard';
  return <div className="app-shell">
    <header className="topbar">
      <a className="brand" href="/" aria-label="IT Incident Hub, inicio"><span className="brand-mark">IH</span><span>IT Incident Hub</span></a>
      <span className="topbar-label">Centro de soporte</span>
      <nav className="view-nav" aria-label="Secciones">
        <a href="/" aria-current={!isDashboard ? 'page' : undefined}>Incidentes</a>
        <a href="/?view=dashboard" aria-current={isDashboard ? 'page' : undefined}>Indicadores</a>
      </nav>
      <span className="avatar" aria-hidden="true">IH</span>
    </header>
    <main className="workspace">{isDashboard ? <Dashboard /> : <IncidentWorkspace />}
      <footer className="page-footer"><span>IT Incident Hub</span><span>Mesa de ayuda · Gestión de incidentes</span></footer>
    </main>
  </div>;
}
