import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { JsonFormatterPage } from './json-formatter/JsonFormatterPage';
import { TextDiffPage } from './text-diff/TextDiffPage';

const toolTabs = [
  {
    id: 'json',
    label: 'JSON 格式化',
    route: 'json'
  },
  {
    id: 'diff',
    label: '文本比对',
    route: 'diff'
  }
];

export function TextToolboxTool() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentTab = location.pathname.endsWith('/diff') ? 'diff' : 'json';

  useEffect(() => {
    if (location.pathname === '/tools/text-toolbox' || location.pathname === '/tools/text-toolbox/') {
      navigate('/tools/text-toolbox/json', { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <section className="tool-page">
      <div className="tool-tabs tool-tabs--workspace" role="tablist" aria-label="文本工具箱标签">
        {toolTabs.map((tab) => {
          const selected = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              className={selected ? 'tool-tabs__item tool-tabs__item--active' : 'tool-tabs__item'}
              onClick={() => navigate(`/tools/text-toolbox/${tab.route}`)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {currentTab === 'diff' ? <TextDiffPage /> : <JsonFormatterPage />}
    </section>
  );
}
