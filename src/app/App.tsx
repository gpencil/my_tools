import { HashRouter, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';

import { toolRegistry } from '../tools/registry';
import './styles.css';

export function App() {
  return (
    <HashRouter>
      <AppFrame />
    </HashRouter>
  );
}

function AppFrame() {
  const location = useLocation();
  const defaultToolPath = toolRegistry[0]?.defaultPath ?? toolRegistry[0]?.route ?? '/';

  return (
    <div className="app-shell">
      <main className="app-shell__main">
        {toolRegistry.length > 1 ? (
          <nav className="tool-tabs tool-tabs--workspace" aria-label="工具导航">
            {toolRegistry.map((tool) => {
              const targetPath = tool.defaultPath ?? tool.route;
              const selected = location.pathname.startsWith(tool.route);

              return (
                <NavLink
                  key={tool.id}
                  to={targetPath}
                  className={selected ? 'tool-tabs__item tool-tabs__item--active' : 'tool-tabs__item'}
                >
                  {tool.name}
                </NavLink>
              );
            })}
          </nav>
        ) : null}

        <Routes>
          <Route path="/" element={<Navigate to={defaultToolPath} replace />} />
          {toolRegistry.map((tool) => {
            const ToolComponent = tool.component;

            return (
              <Route key={tool.id} path={`${tool.route}/*`} element={<ToolComponent />} />
            );
          })}
          <Route path="*" element={<Navigate to={defaultToolPath} replace />} />
        </Routes>
      </main>
    </div>
  );
}
