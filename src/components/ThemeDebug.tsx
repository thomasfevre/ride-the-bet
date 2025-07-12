import React, { useEffect, useState } from 'react';

const ThemeDebug: React.FC = () => {
  const [currentTheme, setCurrentTheme] = useState<string>('');
  const [htmlClass, setHtmlClass] = useState<string>('');

  useEffect(() => {
    const updateThemeInfo = () => {
      const theme = localStorage.getItem('theme') || 'system';
      const htmlClasses = document.documentElement.className;
      setCurrentTheme(theme);
      setHtmlClass(htmlClasses);
    };

    // Initial update
    updateThemeInfo();

    // Listen for storage changes
    window.addEventListener('storage', updateThemeInfo);
    
    // Create a MutationObserver to watch for class changes on html element
    const observer = new MutationObserver(updateThemeInfo);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      window.removeEventListener('storage', updateThemeInfo);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-xs font-mono shadow-lg z-50">
      <div className="text-gray-700 dark:text-gray-300">
        <div><strong>Theme:</strong> {currentTheme}</div>
        <div><strong>HTML Class:</strong> {htmlClass || 'none'}</div>
        <div><strong>Dark Mode:</strong> {htmlClass.includes('dark') ? '🌙 ON' : '☀️ OFF'}</div>
      </div>
    </div>
  );
};

export default ThemeDebug;
