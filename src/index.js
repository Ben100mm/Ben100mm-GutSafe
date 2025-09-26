/**
 * @fileoverview index.js
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

/**
 * @fileoverview index.js
 * @copyright Copyright (c) 2024 Benjamin [Last Name]. All rights reserved.
 * @license PROPRIETARY - See LICENSE file for details
 * @private
 */

import React from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  return React.createElement('div', null, 
    React.createElement('h1', null, 'GutSafe App'),
    React.createElement('p', null, 'Full application is loading...'),
    React.createElement('p', null, 'Testing React Native Web components...')
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(App));
