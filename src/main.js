/**
 * Chemical Equilibrium Studio - Main Application
 * Punto de entrada y orquestador principal
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Chart } from 'chart.js/auto';
import { EquilibriumEngine } from './chemistry/EquilibriumEngine.js';
import { ParticleSystem } from './engine/ParticleSystem.js';
import { getAllReactions, getReactionById } from './chemistry/ReactionLibrary.js';
import { getCatalystById } from './chemistry/CatalystLibrary.js';
import './ui/UIController.js';

class ChemicalEquilibriumStudio {
    constructor() {
        // Estado de la aplicación
        this.isRunning = false;
        this.simulationSpeed = 1.0;
        this.timeScale = 1; // Escala de tiempo: 1, 10, 100, 1000, 10000
        this.currentReaction = null;
        this.equilibriumEngine = null;
        this.particleSystem = null;

        // Configuración de Three.js
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;

        // Gráfica
        this.chart = null;
        this.currentChartType = 'concentration';

        // FPS Counter
        this.lastTime = performance.now();
        this.frameCount = 0;
        this.fps = 60;

        this.init();
    }

    /**
     * Inicializa la aplicación
     */
    init() {
        this.setupScene();
        this.setupUI();
        this.setupChart();
        this.loadReactionList();
        this.animate();

        console.log('🧪 Chemical Equilibrium Studio initialized!');
    }

    /**
     * Configura la escena 3D
     */
    setupScene() {
        const canvas = document.getElementById('scene-canvas');
        const container = canvas.parentElement;

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0e1a);
        this.scene.fog = new THREE.Fog(0x0a0e1a, 10, 50);

        // Camera
        this.camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(12, 8, 12);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(container.clientWidth, container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Controls
        this.controls = new OrbitControls(this.camera, canvas);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 30;

        // Luces
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(10, 10, 10);
        this.scene.add(directionalLight);

        const pointLight1 = new THREE.PointLight(0x06b6d4, 0.5, 50);
        pointLight1.position.set(-10, 5, -10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0x8b5cf6, 0.5, 50);
        pointLight2.position.set(10, 5, 10);
        this.scene.add(pointLight2);

        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    /**
     * Configura los controles de UI
     */
    setupUI() {
        // Botones de simulación
        document.getElementById('play-btn').addEventListener('click', () => this.play());
        document.getElementById('pause-btn').addEventListener('click', () => this.pause());
        document.getElementById('reset-btn').addEventListener('click', () => this.reset());

        // Controles de parámetros
        document.getElementById('temperature-slider').addEventListener('input', (e) => {
            const temp = parseFloat(e.target.value);
            document.getElementById('temperature-value').textContent = `${temp} K`;
            if (this.equilibriumEngine) {
                this.equilibriumEngine.setTemperature(temp);
                this.updateTechnicalData(); // Actualizar datos técnicos
                if (this.particleSystem) {
                    this.particleSystem.setTemperature(temp);
                }
            }
        });

        document.getElementById('pressure-slider').addEventListener('input', (e) => {
            const pressure = parseFloat(e.target.value);
            document.getElementById('pressure-value').textContent = `${pressure.toFixed(1)} atm`;
            if (this.equilibriumEngine) {
                this.equilibriumEngine.setPressure(pressure);
            }
        });

        document.getElementById('volume-slider').addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            document.getElementById('volume-value').textContent = `${volume} L`;
            if (this.equilibriumEngine) {
                this.equilibriumEngine.setVolume(volume);
                if (this.particleSystem) {
                    this.particleSystem.setVolume(volume);
                }
            }
        });

        document.getElementById('catalyst-select').addEventListener('change', (e) => {
            const catalystId = e.target.value;
            const catalyst = getCatalystById(catalystId);

            if (this.equilibriumEngine) {
                this.equilibriumEngine.setCatalyst(catalyst.eaReduction);
                this.updateTechnicalData();
            }

            // Mostrar info del catalizador
            const infoDiv = document.getElementById('catalyst-info');
            if (catalystId === 'none') {
                infoDiv.classList.remove('active');
            } else {
                infoDiv.textContent = `⚡ ${catalyst.description}`;
                infoDiv.classList.add('active');
            }
        });

        document.getElementById('speed-slider').addEventListener('input', (e) => {
            this.simulationSpeed = parseFloat(e.target.value);
            document.getElementById('speed-value').textContent = `${this.simulationSpeed.toFixed(1)}x`;
        });

        document.getElementById('timescale-slider').addEventListener('input', (e) => {
            const scales = [1, 10, 100, 1000, 10000];
            const index = parseInt(e.target.value);
            this.timeScale = scales[index];

            const labels = ['1x', '10x', '100x', '1kx', '10kx'];
            document.getElementById('timescale-value').textContent = labels[index];
        });

        // Tabs de gráficas
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentChartType = e.target.dataset.chart;
                this.updateChart();
            });
        });

        // Export buttons
        document.getElementById('export-csv').addEventListener('click', () => this.exportCSV());
        document.getElementById('export-png').addEventListener('click', () => this.exportPNG());
        document.getElementById('export-config').addEventListener('click', () => this.exportConfig());
    }

    /**
     * Configura la gráfica con Chart.js
     */
    setupChart() {
        const ctx = document.getElementById('main-chart');

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: []
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
                            font: { family: 'Inter' }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Tiempo (s)',
                            color: '#9ca3af'
                        },
                        ticks: { color: '#9ca3af' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Concentración (mol/L)',
                            color: '#9ca3af'
                        },
                        ticks: { color: '#9ca3af' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' }
                    }
                }
            }
        });
    }

    /**
     * Carga la lista de reacciones
     */
    loadReactionList() {
        const container = document.getElementById('reaction-selector');
        const reactions = getAllReactions();

        reactions.forEach(reaction => {
            const card = document.createElement('div');
            card.className = 'reaction-card';
            card.dataset.reactionId = reaction.id;

            const difficultyClass = `badge-${reaction.difficulty}`;

            card.innerHTML = `
        <div class="reaction-card-title">${reaction.equation}</div>
        <div class="reaction-card-desc">${reaction.description}</div>
        <span class="reaction-card-badge ${difficultyClass}">${reaction.difficulty}</span>
      `;

            card.addEventListener('click', () => this.selectReaction(reaction.id));
            container.appendChild(card);
        });
    }

    /**
     * Selecciona una reacción
     */
    selectReaction(reactionId) {
        // Visual feedback
        document.querySelectorAll('.reaction-card').forEach(card => {
            card.classList.remove('active');
        });
        document.querySelector(`[data-reaction-id="${reactionId}"]`).classList.add('active');

        // Cargar reacción
        const reaction = getReactionById(reactionId);
        this.currentReaction = reaction;

        // Limpiar sistema de partículas anterior si existe
        if (this.particleSystem) {
            this.particleSystem.dispose();
        }

        // Crear motores
        this.equilibriumEngine = new EquilibriumEngine(reaction);
        this.particleSystem = new ParticleSystem(this.scene, reaction, reaction.recommended.volume);

        // Crear partículas iniciales
        this.particleSystem.createParticles(this.equilibriumEngine.concentrations);

        // Actualizar UI
        this.updateReactionInfo();
        this.setupConcentrationControls();
        this.updateDataDisplay();
        this.updateTechnicalData();
        this.updateChart();

        // Resetear parámetros
        document.getElementById('temperature-slider').value = reaction.recommended.temperature;
        document.getElementById('temperature-value').textContent = `${reaction.recommended.temperature} K`;
        document.getElementById('pressure-slider').value = reaction.recommended.pressure;
        document.getElementById('pressure-value').textContent = `${reaction.recommended.pressure.toFixed(1)} atm`;
        document.getElementById('volume-slider').value = reaction.recommended.volume;
        document.getElementById('volume-value').textContent = `${reaction.recommended.volume} L`;
        document.getElementById('catalyst-select').value = 'none';
        document.getElementById('catalyst-info').classList.remove('active');
    }

    /**
     * Actualiza el panel de parámetros técnicos
     */
    updateTechnicalData() {
        if (!this.equilibriumEngine) return;

        const reaction = this.currentReaction;
        const engine = this.equilibriumEngine;

        // Constantes de velocidad base (sin temperatura ni catalizador)
        document.getElementById('kf-base').textContent = `${reaction.kForward.toFixed(4)} s⁻¹`;
        document.getElementById('kr-base').textContent = `${reaction.kReverse.toFixed(4)} M⁻¹s⁻¹`;

        // Constantes efectivas (con todo ajustado)
        const kf = engine.getForwardRateConstant();
        const kr = engine.getReverseRateConstant();
        document.getElementById('kf-effective').textContent = `${kf.toFixed(4)} s⁻¹`;
        document.getElementById('kr-effective').textContent = `${kr.toFixed(4)} M⁻¹s⁻¹`;

        // Energías de activación
        const ea = engine.getEffectiveActivationEnergies();
        document.getElementById('ea-forward-orig').textContent = `${ea.eaForwardOriginal.toFixed(1)} kJ/mol`;
        document.getElementById('ea-reverse-orig').textContent = `${ea.eaReverseOriginal.toFixed(1)} kJ/mol`;
        document.getElementById('ea-forward-reduced').textContent = `${ea.eaForwardReduced.toFixed(1)} kJ/mol`;
        document.getElementById('ea-reverse-reduced').textContent = `${ea.eaReverseReduced.toFixed(1)} kJ/mol`;

        // Factor de aceleración
        const factor = engine.getCatalystAccelerationFactor();
        document.getElementById('catalyst-factor').textContent = `${factor.toFixed(2)}x`;
    }

    /**
     * Actualiza la información de la reacción
     */
    updateReactionInfo() {
        document.getElementById('reaction-equation').textContent = this.currentReaction.equation;

        const infoContent = document.getElementById('info-content');

        // Determinar catalizador recomendado
        const recCat = this.currentReaction.recommendedCatalyst;
        let catalystHTML = '';

        if (recCat === 'none') {
            catalystHTML = `
                <p><strong>⭐ Catalizador:</strong> No necesario</p>
                <p style="font-size: 0.875rem; color: var(--text-tertiary); margin-top: 0.5rem;">${this.currentReaction.catalystReason}</p>
            `;
        } else {
            catalystHTML = `
                <p><strong>⭐ Catalizador Recomendado:</strong> ${this.currentReaction.recommendedCatalyst.toUpperCase()}</p>
                <p style="font-size: 0.875rem; background: rgba(6, 182, 212, 0.1); padding: 0.5rem; border-radius: 4px; border-left: 3px solid var(--accent-cyan); margin-top: 0.5rem;">
                  <strong>Por qué:</strong> ${this.currentReaction.catalystReason}
                </p>
                <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 0.5rem;">
                  <strong>Alternativa:</strong> ${this.currentReaction.catalystAlternative}
                </p>
            `;
        }

        infoContent.innerHTML = `
      <p><strong>${this.currentReaction.name}</strong></p>
      <p>${this.currentReaction.description}</p>
      <p><strong>ΔH°:</strong> ${this.currentReaction.deltaH.toFixed(1)} kJ/mol</p>
      <p><strong>ΔS°:</strong> ${this.currentReaction.deltaS.toFixed(1)} J/(mol·K)</p>
      <p><strong>Ea<sub>forward</sub>:</strong> ${this.currentReaction.Ea_forward.toFixed(1)} kJ/mol</p>
      <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 1rem 0;">
      ${catalystHTML}
      <hr style="border: none; border-top: 1px solid rgba(255,255,255,0.1); margin: 1rem 0;">
      <p><strong>⚡ Sobre Catalizadores:</strong> Un catalizador reduce la energía de activación (Ea) en la <em>misma cantidad</em> para ambas direcciones. Esto acelera la reacción según:</p>
      <p style="font-family: var(--font-mono); font-size: 0.75rem; background: rgba(0,0,0,0.3); padding: 0.5rem; border-radius: 4px; margin-top: 0.5rem;">
        k = k₀ × exp(ΔEa/RT)<br>
        Factor = exp(ΔEa/RT)<br>
        K = k<sub>f</sub>/k<sub>r</sub> = constante
      </p>
      <p style="font-size: 0.75rem; color: var(--text-tertiary); margin-top: 0.5rem;">Verifica manualmente: usa los valores del panel "Parámetros Técnicos" con la ecuación de Arrhenius</p>
    `;

        // Resaltar catalizador recomendado en el selector
        this.highlightRecommendedCatalyst();
    }

    /**
     * Resalta el catalizador recomendado en el dropdown
     */
    highlightRecommendedCatalyst() {
        const select = document.getElementById('catalyst-select');
        const recommended = this.currentReaction.recommendedCatalyst;

        // Reiniciar todas las opciones
        Array.from(select.options).forEach(opt => {
            const originalText = opt.textContent.replace(' ⭐', '');
            opt.textContent = originalText;
            opt.style.fontWeight = 'normal';
        });

        // Resaltar la recomendada
        if (recommended !== 'none') {
            Array.from(select.options).forEach(opt => {
                if (opt.value === recommended) {
                    opt.textContent = opt.textContent + ' ⭐';
                    opt.style.fontWeight = 'bold';
                }
            });
        }
    }

    /**
     * Configura controles de concentración inicial
     */
    setupConcentrationControls() {
        const container = document.getElementById('concentration-controls');
        container.innerHTML = '';

        [...this.currentReaction.reactants, ...this.currentReaction.products].forEach(species => {
            const group = document.createElement('div');
            group.className = 'concentration-input-group';

            group.innerHTML = `
        <span class="molecule-label">${species.formula}</span>
        <input 
          type="number" 
          class="concentration-input" 
          data-species="${species.formula}"
          value="${species.initialConc}"
          min="0"
          step="0.1"
        />
        <span class="concentration-unit">mol/L</span>
      `;

            container.appendChild(group);

            const input = group.querySelector('input');
            input.addEventListener('change', (e) => {
                const value = parseFloat(e.target.value);
                this.equilibriumEngine.setConcentration(species.formula, value);
                if (this.particleSystem) {
                    this.particleSystem.createParticles(this.equilibriumEngine.concentrations);
                }
            });
        });
    }

    /**
     * Inicia la simulación
     */
    play() {
        if (!this.equilibriumEngine) {
            alert('Por favor selecciona una reacción primero');
            return;
        }

        this.isRunning = true;
        document.getElementById('play-btn').disabled = true;
        document.getElementById('pause-btn').disabled = false;
    }

    /**
     * Pausa la simulación
     */
    pause() {
        this.isRunning = false;
        document.getElementById('play-btn').disabled = false;
        document.getElementById('pause-btn').disabled = true;
    }

    /**
     * Reinicia la simulación
     */
    reset() {
        if (this.equilibriumEngine) {
            this.equilibriumEngine.reset();
            if (this.particleSystem) {
                this.particleSystem.createParticles(this.equilibriumEngine.concentrations);
            }
            this.updateChart();
            this.updateDataDisplay();
        }
        this.pause();
    }

    /**
     * Actualiza la pantalla de datos
     */
    updateDataDisplay() {
        if (!this.equilibriumEngine) return;

        const info = this.equilibriumEngine.getSystemInfo();

        document.getElementById('k-value').textContent = info.Kc.toExponential(2);
        document.getElementById('q-value').textContent = info.Q.toExponential(2);
        document.getElementById('delta-g-value').textContent = info.deltaG.toFixed(2);
        document.getElementById('time-value').textContent = info.time.toFixed(2);

        // Indicador de equilibrio
        const statusText = document.getElementById('equilibrium-text');
        const statusDot = document.querySelector('.indicator-dot');

        if (info.atEquilibrium) {
            statusText.textContent = '⚖️ En equilibrio';
            statusDot.style.background = '#10b981';
            statusDot.style.boxShadow = '0 0 10px #10b981';
        } else if (info.direction === 'forward') {
            statusText.textContent = '➡️ Hacia productos';
            statusDot.style.background = '#06b6d4';
            statusDot.style.boxShadow = '0 0 10px #06b6d4';
        } else {
            statusText.textContent = '⬅️ Hacia reactivos';
            statusDot.style.background = '#f59e0b';
            statusDot.style.boxShadow = '0 0 10px #f59e0b';
        }
    }

    /**
     * Actualiza la gráfica
     */
    updateChart() {
        if (!this.equilibriumEngine || !this.chart) return;

        const history = this.equilibriumEngine.history;

        if (this.currentChartType === 'concentration') {
            const datasets = [];
            const species = [...this.currentReaction.reactants, ...this.currentReaction.products];

            species.forEach(sp => {
                datasets.push({
                    label: sp.formula,
                    data: history.concentrations[sp.formula],
                    borderColor: sp.color,
                    backgroundColor: sp.color + '40',
                    borderWidth: 2,
                    pointRadius: 0,
                    tension: 0.4
                });
            });

            this.chart.data.labels = history.time;
            this.chart.data.datasets = datasets;
            this.chart.options.scales.y.title.text = 'Concentración (mol/L)';

        } else if (this.currentChartType === 'rate') {
            this.chart.data.labels = history.time;
            this.chart.data.datasets = [
                {
                    label: 'Velocidad Directa',
                    data: history.rates.forward,
                    borderColor: '#06b6d4',
                    backgroundColor: '#06b6d440',
                    borderWidth: 2,
                    pointRadius: 0
                },
                {
                    label: 'Velocidad Inversa',
                    data: history.rates.reverse,
                    borderColor: '#f59e0b',
                    backgroundColor: '#f59e0b40',
                    borderWidth: 2,
                    pointRadius: 0
                }
            ];
            this.chart.options.scales.y.title.text = 'Velocidad (mol/L·s)';

        } else if (this.currentChartType === 'energy') {
            this.chart.data.labels = history.time;
            this.chart.data.datasets = [
                {
                    label: 'ΔG (kJ/mol)',
                    data: history.deltaG,
                    borderColor: '#8b5cf6',
                    backgroundColor: '#8b5cf640',
                    borderWidth: 2,
                    pointRadius: 0
                }
            ];
            this.chart.options.scales.y.title.text = 'ΔG (kJ/mol)';
        }

        this.chart.update('none');
    }

    /**
     * Loop de animación principal
     */
    animate() {
        requestAnimationFrame(() => this.animate());

        // FPS counter
        const currentTime = performance.now();
        this.frameCount++;
        if (currentTime - this.lastTime >= 1000) {
            this.fps = this.frameCount;
            document.getElementById('fps-value').textContent = this.fps;
            this.frameCount = 0;
            this.lastTime = currentTime;
        }

        // Actualizar simulación si está corriendo
        if (this.isRunning && this.equilibriumEngine && this.particleSystem) {
            const dt = 0.016 * this.simulationSpeed * this.timeScale; // Aplicar escala de tiempo

            // Step del motor de equilibrio
            this.equilibriumEngine.step(dt);

            // Actualizar partículas (sin escala de tiempo para física visual)
            this.particleSystem.update(this.equilibriumEngine.concentrations, 0.016 * this.simulationSpeed);

            // Actualizar contador de partículas
            document.getElementById('particle-count').textContent = this.particleSystem.getParticleCount();

            // Actualizar datos cada 5 frames para performance
            if (this.frameCount % 5 === 0) {
                this.updateDataDisplay();
                this.updateChart();
            }
        }

        // Render
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    /**
     * Maneja cambio de tamaño de ventana
     */
    onWindowResize() {
        const container = document.querySelector('.canvas-container');

        this.camera.aspect = container.clientWidth / container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(container.clientWidth, container.clientHeight);
    }

    /**
     * Exporta datos a CSV
     */
    exportCSV() {
        if (!this.equilibriumEngine) return;

        const history = this.equilibriumEngine.history;
        let csv = 'Time(s)';

        // Headers
        Object.keys(history.concentrations).forEach(species => {
            csv += `,${species}(mol/L)`;
        });
        csv += ',Forward Rate,Reverse Rate,Q,DeltaG(kJ/mol)\n';

        // Data
        for (let i = 0; i < history.time.length; i++) {
            csv += history.time[i].toFixed(3);

            Object.keys(history.concentrations).forEach(species => {
                csv += `,${history.concentrations[species][i].toFixed(6)}`;
            });

            csv += `,${history.rates.forward[i].toFixed(6)}`;
            csv += `,${history.rates.reverse[i].toFixed(6)}`;
            csv += `,${history.Q[i].toFixed(6)}`;
            csv += `,${history.deltaG[i].toFixed(6)}\n`;
        }

        this.downloadFile(csv, 'simulation_data.csv', 'text/csv');
    }

    /**
     * Exporta gráfica a PNG
     */
    exportPNG() {
        if (!this.chart) return;

        const url = this.chart.toBase64Image();
        const link = document.createElement('a');
        link.download = 'chart.png';
        link.href = url;
        link.click();
    }

    /**
     * Exporta configuración
     */
    exportConfig() {
        if (!this.equilibriumEngine) return;

        const config = {
            reaction: this.currentReaction.id,
            temperature: this.equilibriumEngine.temperature,
            pressure: this.equilibriumEngine.pressure,
            volume: this.equilibriumEngine.volume,
            concentrations: this.equilibriumEngine.concentrations
        };

        const json = JSON.stringify(config, null, 2);
        this.downloadFile(json, 'config.json', 'application/json');
    }

    /**
     * Helper para descargar archivos
     */
    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = filename;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
    }
}

// Iniciar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ChemicalEquilibriumStudio();
});
