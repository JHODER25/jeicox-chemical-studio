/**
 * Setup collapsible sections in sidebar
 */
setupCollapsibles() {
    const collapsibleHeaders = document.querySelectorAll('.collapsible-toggle');

    collapsibleHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const isOpen = content.classList.contains('open');

            // Toggle open class
            if (isOpen) {
                content.classList.remove('open');
                header.classList.remove('active');
                content.style.display = 'none';
            } else {
                content.classList.add('open');
                header.classList.add('active');
                content.style.display = 'block';
            }
        });
    });
}

/**
 * Setup fullscreen chart functionality
 */
setupFullscreenChart() {
    const fullscreenBtn = document.getElementById('chart-fullscreen-btn');
    const modal = document.getElementById('chart-fullscreen-modal');
    const closeBtn = document.getElementById('close-fullscreen');
    const fullscreenCanvas = document.getElementById('fullscreen-chart');

    let fullscreenChart = null;

    // Open fullscreen
    fullscreenBtn.addEventListener('click', () => {
        modal.classList.add('active');

        // Create fullscreen chart with same data as main chart
        if (this.chart && this.equilibriumEngine) {
            const ctx = fullscreenCanvas.getContext('2d');
            const history = this.equilibriumEngine.history;

            const datasets = [];
            const species = [...this.currentReaction.reactants, ...this.currentReaction.products];

            species.forEach(sp => {
                const data = history.concentrations[sp.formula];
                if (data && Array.isArray(data) && data.length > 0) {
                    datasets.push({
                        label: sp.formula,
                        data: data,
                        borderColor: sp.color,
                        backgroundColor: sp.color + '40',
                        borderWidth: 3,
                        pointRadius: 0,
                        tension: 0.4
                    });
                }
            });

            fullscreenChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: history.time,
                    datasets: datasets
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: false,
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                color: '#d1d5db',
                                font: { family: 'Inter', size: 14 }
                            }
                        }
                    },
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Tiempo (s)',
                                color: '#9ca3af',
                                font: { size: 14 }
                            },
                            ticks: {
                                color: '#9ca3af',
                                callback: function (value) {
                                    return Number(value).toFixed(1);
                                }
                            },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Concentración (mol/L)',
                                color: '#9ca3af',
                                font: { size: 14 }
                            },
                            ticks: { color: '#9ca3af' },
                            grid: { color: 'rgba(255, 255, 255, 0.1)' }
                        }
                    }
                }
            });
        }
    });

    // Close fullscreen
    const closeFullscreen = () => {
        modal.classList.remove('active');
        if (fullscreenChart) {
            fullscreenChart.destroy();
            fullscreenChart = null;
        }
    };

    closeBtn.addEventListener('click', closeFullscreen);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeFullscreen();
        }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeFullscreen();
        }
    });
}
}

// Append these methods to ChemicalEquilibriumStudio class
