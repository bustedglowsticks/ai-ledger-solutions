// Visualization Toggle Module for Elite Asset Command Nexus
// Provides 2D/3D visualization mode toggle functionality

function initVisualizationToggle(setVisualizationMode, visualizationMode) {
    // This function would be called from the main component to add the toggle button
    // Since direct DOM manipulation might conflict with React, it's better to handle this within React components
    // For now, we'll define the toggle button JSX that should be inserted into the header
    console.log('Visualization toggle module initialized');
    
    // Return a JSX-like structure that can be used in the React component
    return {
        toggleButton: (
            `<button onClick={() => setVisualizationMode(visualizationMode === '2d' ? '3d' : '2d')} 
                className=\'interactive-btn px-3 py-1 text-sm rounded-lg transition-colors ${visualizationMode === '3d' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}'>
                {visualizationMode === '3d' ? '🔮 3D View' : '📊 2D View'}
            </button>`
        )
    };
}

// Export for use in main component
// In a real React app, this would be imported and used directly, but for our inline HTML approach, we'll attach it to window
window.initVisualizationToggle = initVisualizationToggle;
console.log('Visualization toggle module loaded');
