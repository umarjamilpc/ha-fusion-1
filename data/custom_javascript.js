console.debug('🎉 HA-Fusion Size Customization System loaded!');

/**
 * HA-Fusion Dynamic Size Customization System
 * 
 * This system provides a comprehensive UI panel for customizing dashboard component sizes
 * with real-time preview, preset options, and persistent storage.
 * 
 * Features:
 * - Floating UI panel with modern design
 * - Preset size buttons (Small, Medium, Large, XL)
 * - Real-time slider with live preview
 * - Custom pixel value input
 * - Component-specific size overrides
 * - Keyboard shortcuts and accessibility
 * - Persistent user preferences
 * - Desktop-first responsive design
 */

// Global namespace for size customization
window.HAFusionSizeCustomizer = {
    // Configuration
    config: {
        defaultSize: 61.35,
        minSize: 30,
        maxSize: 150,
        presets: {
            small: 45,
            medium: 61.35,
            large: 80,
            xl: 100
        },
        storageKey: 'ha-fusion-size-preferences',
        animationDuration: 300
    },

    // State management
    state: {
        currentSize: 61.35,
        panelVisible: false,
        isInitialized: false,
        componentOverrides: {}
    },

    // Initialize the system
    init() {
        if (this.state.isInitialized) return;
        
        console.debug('Initializing HA-Fusion Size Customization System...');
        
        // Load saved preferences
        this.loadPreferences();
        
        // Create UI elements
        this.createToggleButton();
        this.createSizePanel();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Apply initial sizing
        this.applySizing(this.state.currentSize);
        
        this.state.isInitialized = true;
        console.debug('Size Customization System initialized successfully!');
    },

    // Create the floating toggle button
    createToggleButton() {
        const toggleButton = document.createElement('button');
        toggleButton.id = 'size-customizer-toggle';
        toggleButton.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                <path d="M3 17h4v4H3zm2-2h4v4H5zm2-2h4v4H7zm2-2h4v4H9zm2-2h4v4h-4zm2-2h4v4h-4z"/>
            </svg>
        `;
        toggleButton.title = 'Size Customization Panel (Ctrl+Shift+S)';
        toggleButton.setAttribute('aria-label', 'Open size customization panel');
        
        // Styling
        Object.assign(toggleButton.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            cursor: 'pointer',
            zIndex: '9998',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        });

        // Hover effects
        toggleButton.addEventListener('mouseenter', () => {
            toggleButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            toggleButton.style.transform = 'scale(1.1)';
        });

        toggleButton.addEventListener('mouseleave', () => {
            toggleButton.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            toggleButton.style.transform = 'scale(1)';
        });

        toggleButton.addEventListener('click', () => this.togglePanel());
        
        document.body.appendChild(toggleButton);
    },

    // Create the main size customization panel
    createSizePanel() {
        const panel = document.createElement('div');
        panel.id = 'size-customizer-panel';
        panel.innerHTML = `
            <div class="panel-header">
                <h3>Size Customization</h3>
                <button class="close-btn" aria-label="Close panel">&times;</button>
            </div>
            
            <div class="panel-content">
                <!-- Preset Size Buttons -->
                <div class="preset-section">
                    <label>Quick Presets:</label>
                    <div class="preset-buttons">
                        <button class="preset-btn" data-size="45">Small</button>
                        <button class="preset-btn active" data-size="61.35">Medium</button>
                        <button class="preset-btn" data-size="80">Large</button>
                        <button class="preset-btn" data-size="100">XL</button>
                    </div>
                </div>

                <!-- Real-time Slider -->
                <div class="slider-section">
                    <label for="size-slider">Custom Size: <span id="size-value">61.35px</span></label>
                    <input type="range" id="size-slider" min="30" max="150" value="61.35" step="0.5">
                    <div class="slider-labels">
                        <span>30px</span>
                        <span>150px</span>
                    </div>
                </div>

                <!-- Custom Input -->
                <div class="input-section">
                    <label for="size-input">Precise Value:</label>
                    <div class="input-group">
                        <input type="number" id="size-input" min="30" max="150" step="0.5" value="61.35">
                        <span class="input-suffix">px</span>
                    </div>
                </div>

                <!-- Component Overrides -->
                <div class="overrides-section">
                    <label>Component Specific:</label>
                    <div class="override-controls">
                        <div class="override-item">
                            <span>Buttons:</span>
                            <input type="range" class="component-slider" data-component="button" min="30" max="150" value="61.35">
                            <span class="component-value">61.35px</span>
                        </div>
                        <div class="override-item">
                            <span>Sidebar:</span>
                            <input type="range" class="component-slider" data-component="sidebar" min="30" max="150" value="61.35">
                            <span class="component-value">61.35px</span>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="action-buttons">
                    <button id="reset-btn" class="secondary-btn">Reset to Default</button>
                    <button id="apply-btn" class="primary-btn">Apply Changes</button>
                </div>
            </div>
        `;

        // Panel styling
        Object.assign(panel.style, {
            position: 'fixed',
            top: '50%',
            right: '20px',
            transform: 'translateY(-50%)',
            width: '350px',
            maxHeight: '80vh',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            borderRadius: '12px',
            padding: '0',
            zIndex: '9999',
            display: 'none',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            fontFamily: 'Inter, system-ui, sans-serif',
            overflow: 'hidden'
        });

        document.body.appendChild(panel);
        this.addPanelStyles();
    },

    // Add comprehensive CSS styles for the panel
    addPanelStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #size-customizer-panel .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                background: rgba(255, 255, 255, 0.05);
            }

            #size-customizer-panel h3 {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
            }

            #size-customizer-panel .close-btn {
                background: none;
                border: none;
                color: white;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s ease;
            }

            #size-customizer-panel .close-btn:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }

            #size-customizer-panel .panel-content {
                padding: 20px;
                max-height: calc(80vh - 80px);
                overflow-y: auto;
            }

            #size-customizer-panel .preset-section,
            #size-customizer-panel .slider-section,
            #size-customizer-panel .input-section,
            #size-customizer-panel .overrides-section {
                margin-bottom: 24px;
            }

            #size-customizer-panel label {
                display: block;
                margin-bottom: 8px;
                font-weight: 500;
                font-size: 14px;
            }

            #size-customizer-panel .preset-buttons {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 8px;
            }

            #size-customizer-panel .preset-btn {
                padding: 12px;
                border: 1px solid rgba(255, 255, 255, 0.2);
                background: rgba(255, 255, 255, 0.05);
                color: white;
                border-radius: 8px;
                cursor: pointer;
                transition: all 0.2s ease;
                font-size: 14px;
                font-weight: 500;
            }

            #size-customizer-panel .preset-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: rgba(255, 255, 255, 0.3);
            }

            #size-customizer-panel .preset-btn.active {
                background: rgba(74, 144, 226, 0.3);
                border-color: #4a90e2;
                color: #4a90e2;
            }

            #size-customizer-panel input[type="range"] {
                width: 100%;
                height: 6px;
                border-radius: 3px;
                background: rgba(255, 255, 255, 0.1);
                outline: none;
                -webkit-appearance: none;
                margin: 8px 0;
            }

            #size-customizer-panel input[type="range"]::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #4a90e2;
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            }

            #size-customizer-panel input[type="range"]::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: #4a90e2;
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
            }

            #size-customizer-panel .slider-labels {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.6);
                margin-top: -4px;
            }

            #size-customizer-panel .input-group {
                display: flex;
                align-items: center;
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 8px;
                overflow: hidden;
            }

            #size-customizer-panel #size-input {
                flex: 1;
                padding: 12px;
                background: transparent;
                border: none;
                color: white;
                font-size: 14px;
                outline: none;
            }

            #size-customizer-panel .input-suffix {
                padding: 12px;
                background: rgba(255, 255, 255, 0.1);
                color: rgba(255, 255, 255, 0.7);
                font-size: 14px;
            }

            #size-customizer-panel .override-item {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 12px;
            }

            #size-customizer-panel .override-item span:first-child {
                min-width: 60px;
                font-size: 13px;
            }

            #size-customizer-panel .component-slider {
                flex: 1;
                margin: 0;
            }

            #size-customizer-panel .component-value {
                min-width: 50px;
                text-align: right;
                font-size: 12px;
                color: rgba(255, 255, 255, 0.7);
            }

            #size-customizer-panel .action-buttons {
                display: flex;
                gap: 12px;
                margin-top: 24px;
                padding-top: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }

            #size-customizer-panel .primary-btn,
            #size-customizer-panel .secondary-btn {
                flex: 1;
                padding: 12px;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-size: 14px;
                font-weight: 500;
                transition: all 0.2s ease;
            }

            #size-customizer-panel .primary-btn {
                background: #4a90e2;
                color: white;
            }

            #size-customizer-panel .primary-btn:hover {
                background: #357abd;
            }

            #size-customizer-panel .secondary-btn {
                background: rgba(255, 255, 255, 0.1);
                color: white;
                border: 1px solid rgba(255, 255, 255, 0.2);
            }

            #size-customizer-panel .secondary-btn:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            /* Animation classes */
            .size-transition {
                transition: all ${this.config.animationDuration}ms cubic-bezier(0.4, 0, 0.2, 1) !important;
            }

            /* Custom scrollbar */
            #size-customizer-panel .panel-content::-webkit-scrollbar {
                width: 6px;
            }

            #size-customizer-panel .panel-content::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
            }

            #size-customizer-panel .panel-content::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.3);
                border-radius: 3px;
            }

            #size-customizer-panel .panel-content::-webkit-scrollbar-thumb:hover {
                background: rgba(255, 255, 255, 0.5);
            }
        `;
        document.head.appendChild(style);
    },

    // Set up all event listeners
    setupEventListeners() {
        const panel = document.getElementById('size-customizer-panel');
        
        // Close button
        panel.querySelector('.close-btn').addEventListener('click', () => this.hidePanel());
        
        // Preset buttons
        panel.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = parseFloat(e.target.dataset.size);
                this.setSize(size);
                this.updateActivePreset(size);
            });
        });

        // Main slider
        const slider = panel.querySelector('#size-slider');
        const sizeValue = panel.querySelector('#size-value');
        slider.addEventListener('input', (e) => {
            const size = parseFloat(e.target.value);
            sizeValue.textContent = `${size}px`;
            this.applySizing(size, true); // Live preview
        });

        slider.addEventListener('change', (e) => {
            const size = parseFloat(e.target.value);
            this.setSize(size);
        });

        // Custom input
        const input = panel.querySelector('#size-input');
        input.addEventListener('change', (e) => {
            const size = Math.max(this.config.minSize, Math.min(this.config.maxSize, parseFloat(e.target.value)));
            this.setSize(size);
        });

        // Component sliders
        panel.querySelectorAll('.component-slider').forEach(slider => {
            const component = slider.dataset.component;
            const valueSpan = slider.parentElement.querySelector('.component-value');
            
            slider.addEventListener('input', (e) => {
                const size = parseFloat(e.target.value);
                valueSpan.textContent = `${size}px`;
                this.applyComponentOverride(component, size, true);
            });

            slider.addEventListener('change', (e) => {
                const size = parseFloat(e.target.value);
                this.state.componentOverrides[component] = size;
                this.savePreferences();
            });
        });

        // Action buttons
        panel.querySelector('#reset-btn').addEventListener('click', () => this.resetToDefault());
        panel.querySelector('#apply-btn').addEventListener('click', () => this.applyAndSave());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                this.togglePanel();
            }
            if (e.key === 'Escape' && this.state.panelVisible) {
                this.hidePanel();
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (this.state.panelVisible && 
                !panel.contains(e.target) && 
                !document.getElementById('size-customizer-toggle').contains(e.target)) {
                this.hidePanel();
            }
        });
    },

    // Toggle panel visibility
    togglePanel() {
        if (this.state.panelVisible) {
            this.hidePanel();
        } else {
            this.showPanel();
        }
    },

    // Show the panel with animation
    showPanel() {
        const panel = document.getElementById('size-customizer-panel');
        panel.style.display = 'block';
        
        // Trigger animation
        requestAnimationFrame(() => {
            panel.style.opacity = '0';
            panel.style.transform = 'translateY(-50%) translateX(20px)';
            panel.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
            
            requestAnimationFrame(() => {
                panel.style.opacity = '1';
                panel.style.transform = 'translateY(-50%) translateX(0)';
            });
        });
        
        this.state.panelVisible = true;
        this.updatePanelValues();
    },

    // Hide the panel with animation
    hidePanel() {
        const panel = document.getElementById('size-customizer-panel');
        
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(-50%) translateX(20px)';
        
        setTimeout(() => {
            panel.style.display = 'none';
        }, 300);
        
        this.state.panelVisible = false;
    },

    // Update panel values to reflect current state
    updatePanelValues() {
        const panel = document.getElementById('size-customizer-panel');
        const slider = panel.querySelector('#size-slider');
        const input = panel.querySelector('#size-input');
        const sizeValue = panel.querySelector('#size-value');
        
        slider.value = this.state.currentSize;
        input.value = this.state.currentSize;
        sizeValue.textContent = `${this.state.currentSize}px`;
        
        this.updateActivePreset(this.state.currentSize);
        
        // Update component overrides
        Object.entries(this.state.componentOverrides).forEach(([component, size]) => {
            const componentSlider = panel.querySelector(`[data-component="${component}"]`);
            const valueSpan = componentSlider?.parentElement.querySelector('.component-value');
            if (componentSlider) {
                componentSlider.value = size;
                if (valueSpan) valueSpan.textContent = `${size}px`;
            }
        });
    },

    // Update active preset button
    updateActivePreset(size) {
        const panel = document.getElementById('size-customizer-panel');
        panel.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
            if (Math.abs(parseFloat(btn.dataset.size) - size) < 0.1) {
                btn.classList.add('active');
            }
        });
    },

    // Set the main size
    setSize(size) {
        this.state.currentSize = size;
        this.applySizing(size);
        this.updatePanelValues();
        this.savePreferences();
    },

    // Apply sizing to the dashboard
    applySizing(size, isPreview = false) {
        // Add transition class for smooth animation
        if (!isPreview) {
            document.querySelectorAll('[style*="min-height"], .item, .button').forEach(el => {
                el.classList.add('size-transition');
            });
        }

        // Update CSS custom properties
        document.documentElement.style.setProperty('--ha-fusion-item-height', `${size}px`);
        document.documentElement.style.setProperty('--ha-fusion-button-height', `${size}px`);
        
        // Update specific component styles
        this.updateComponentStyles(size);
        
        // Apply component overrides
        Object.entries(this.state.componentOverrides).forEach(([component, overrideSize]) => {
            this.applyComponentOverride(component, overrideSize);
        });

        // Remove transition class after animation
        if (!isPreview) {
            setTimeout(() => {
                document.querySelectorAll('.size-transition').forEach(el => {
                    el.classList.remove('size-transition');
                });
            }, this.config.animationDuration);
        }
    },

    // Update component-specific styles
    updateComponentStyles(size) {
        // Main dashboard items
        document.querySelectorAll('[style*="min-height"]').forEach(el => {
            if (el.style.minHeight && el.style.minHeight.includes('px')) {
                el.style.minHeight = `${size}px`;
            }
        });

        // Button components
        document.querySelectorAll('.button, [class*="button"]').forEach(el => {
            if (el.style.minHeight) {
                el.style.minHeight = `${size}px`;
            }
        });

        // Grid items
        document.querySelectorAll('.item').forEach(el => {
            if (el.style.height && el.style.height.includes('px')) {
                el.style.height = `${size}px`;
            }
        });
    },

    // Apply component-specific override
    applyComponentOverride(component, size, isPreview = false) {
        const selector = this.getComponentSelector(component);
        
        if (!isPreview) {
            document.querySelectorAll(selector).forEach(el => {
                el.classList.add('size-transition');
            });
        }

        // Apply size based on component type
        switch (component) {
            case 'button':
                document.querySelectorAll(selector).forEach(el => {
                    el.style.minHeight = `${size}px`;
                });
                break;
            case 'sidebar':
                document.querySelectorAll(selector).forEach(el => {
                    el.style.height = `${size}px`;
                });
                break;
        }

        if (!isPreview) {
            setTimeout(() => {
                document.querySelectorAll(selector).forEach(el => {
                    el.classList.remove('size-transition');
                });
            }, this.config.animationDuration);
        }
    },

    // Get CSS selector for component type
    getComponentSelector(component) {
        const selectors = {
            button: '.button, [class*="button"]',
            sidebar: '#sidebar .item, .sidebar-item'
        };
        return selectors[component] || '';
    },

    // Reset to default size
    resetToDefault() {
        this.state.currentSize = this.config.defaultSize;
        this.state.componentOverrides = {};
        this.applySizing(this.config.defaultSize);
        this.updatePanelValues();
        this.savePreferences();
    },

    // Apply changes and save
    applyAndSave() {
        this.savePreferences();
        this.hidePanel();
        
        // Show confirmation
        this.showNotification('Size preferences saved successfully!');
    },

    // Save preferences to localStorage
    savePreferences() {
        const preferences = {
            currentSize: this.state.currentSize,
            componentOverrides: this.state.componentOverrides,
            timestamp: Date.now()
        };
        
        try {
            localStorage.setItem(this.config.storageKey, JSON.stringify(preferences));
        } catch (error) {
            console.warn('Failed to save size preferences:', error);
        }
    },

    // Load preferences from localStorage
    loadPreferences() {
        try {
            const saved = localStorage.getItem(this.config.storageKey);
            if (saved) {
                const preferences = JSON.parse(saved);
                this.state.currentSize = preferences.currentSize || this.config.defaultSize;
                this.state.componentOverrides = preferences.componentOverrides || {};
            }
        } catch (error) {
            console.warn('Failed to load size preferences:', error);
        }
    },

    // Show notification
    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: 'rgba(74, 144, 226, 0.9)',
            color: 'white',
            padding: '12px 24px',
            borderRadius: '8px',
            zIndex: '10000',
            fontSize: '14px',
            fontWeight: '500',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
        });

        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(-50%) translateY(-10px)';
            notification.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => window.HAFusionSizeCustomizer.init(), 1000);
    });
} else {
    setTimeout(() => window.HAFusionSizeCustomizer.init(), 1000);
}

// Also initialize on page navigation (for SPA behavior)
window.addEventListener('popstate', () => {
    setTimeout(() => {
        if (window.HAFusionSizeCustomizer && !window.HAFusionSizeCustomizer.state.isInitialized) {
            window.HAFusionSizeCustomizer.init();
        }
    }, 500);
});

console.debug('HA-Fusion Size Customization System ready!');
