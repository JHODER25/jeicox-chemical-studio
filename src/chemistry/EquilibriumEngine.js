/**
 * Chemical Equilibrium Studio - Equilibrium Engine
 * Motor de cálculos de equilibrio químico
 */

const R = 8.314; // J/(mol·K) - Constante de los gases

export class EquilibriumEngine {
    constructor(reaction) {
        this.reaction = reaction;
        this.temperature = reaction.recommended.temperature;
        this.pressure = reaction.recommended.pressure;
        this.volume = reaction.recommended.volume;
        this.eaReduction = 0; // Reducción de Ea por catalizador (kJ/mol)

        // Estado actual del sistema
        this.concentrations = this.getInitialConcentrations();
        this.time = 0;

        // Historia de datos para gráficas
        this.history = {
            time: [],
            concentrations: {},
            rates: { forward: [], reverse: [] },
            Q: [],
            deltaG: []
        };

        this.initializeHistory();
    }

    /**
     * Obtiene concentraciones iniciales de la reacción
     */
    getInitialConcentrations() {
        const conc = {};

        this.reaction.reactants.forEach(species => {
            conc[species.formula] = species.initialConc;
        });

        this.reaction.products.forEach(species => {
            conc[species.formula] = species.initialConc;
        });

        return conc;
    }

    /**
     * Inicializa la historia de datos
     */
    initializeHistory() {
        this.reaction.reactants.forEach(species => {
            this.history.concentrations[species.formula] = [];
        });

        this.reaction.products.forEach(species => {
            this.history.concentrations[species.formula] = [];
        });
    }

    /**
     * Actualiza la temperatura y recalcula constantes de velocidad usando Arrhenius
     * k = A * exp(-Ea/RT)
     */
    setTemperature(temp_K) {
        const T_old = this.temperature;
        this.temperature = temp_K;

        // Ecuación de Arrhenius para recalcular k
        const { Ea_forward, Ea_reverse } = this.reaction;
        const kf_old = this.getForwardRateConstant();
        const kr_old = this.getReverseRateConstant();

        // k2/k1 = exp(Ea/R * (1/T1 - 1/T2))
        const factor_forward = Math.exp((Ea_forward * 1000 / R) * (1 / T_old - 1 / temp_K));
        const factor_reverse = Math.exp((Ea_reverse * 1000 / R) * (1 / T_old - 1 / temp_K));

        this.kForward_adjusted = kf_old * factor_forward;
        this.kReverse_adjusted = kr_old * factor_reverse;
    }

    /**
     * Actualiza la presión (afecta equilibrios gaseosos)
     */
    setPressure(pressure_atm) {
        this.pressure = pressure_atm;
    }

    /**
     * Actualiza el volumen del reactor
     */
    setVolume(volume_L) {
        // Cambiar volumen afecta las concentraciones
        const factor = this.volume / volume_L;

        Object.keys(this.concentrations).forEach(species => {
            this.concentrations[species] *= factor;
        });

        this.volume = volume_L;
    }

    /**
     * Establece la reducción de energía de activación por el catalizador
     * Un catalizador reduce Ea en la misma cantidad para ambas direcciones
     * Esto acelera ambas reacciones (k = A·exp(-Ea/RT)) sin cambiar K
     * 
     * @param {number} eaReduction_kJ - Reducción de Ea en kJ/mol (0 = sin catalizador)
     */
    setCatalyst(eaReduction_kJ) {
        this.eaReduction = Math.max(eaReduction_kJ, 0);
    }

    /**
     * Obtiene la constante de velocidad directa (ajustada por temperatura y catalizador)
     * Aplica ecuación de Arrhenius con Ea reducida: k = k_base × exp(ΔEa/RT)
     */
    getForwardRateConstant() {
        const baseRate = this.kForward_adjusted || this.reaction.kForward;

        if (this.eaReduction <= 0) {
            return baseRate;
        }

        // Factor de aceleración: exp(ΔEa / RT)
        const R = 8.314e-3; // kJ/(mol·K)
        const accelerationFactor = Math.exp(this.eaReduction / (R * this.temperature));

        return baseRate * accelerationFactor;
    }

    /**
     * Obtiene la constante de velocidad inversa (ajustada por temperatura y catalizador)
     * Aplica la misma reducción de Ea que la reacción directa
     */
    getReverseRateConstant() {
        const baseRate = this.kReverse_adjusted || this.reaction.kReverse;

        if (this.eaReduction <= 0) {
            return baseRate;
        }

        // Mismo factor de aceleración para mantener K constante
        const R = 8.314e-3; // kJ/(mol·K)
        const accelerationFactor = Math.exp(this.eaReduction / (R * this.temperature));

        return baseRate * accelerationFactor;
    }

    /**
     * Obtiene el factor de aceleración actual del catalizador
     */
    getCatalystAccelerationFactor() {
        if (this.eaReduction <= 0) return 1.0;

        const R = 8.314e-3; // kJ/(mol·K)
        return Math.exp(this.eaReduction / (R * this.temperature));
    }

    /**
     * Obtiene las energías de activación efectivas (reducidas por catalizador)
     */
    getEffectiveActivationEnergies() {
        return {
            eaForwardOriginal: this.reaction.Ea_forward,
            eaReverseOriginal: this.reaction.Ea_reverse,
            eaForwardReduced: Math.max(this.reaction.Ea_forward - this.eaReduction, 5),
            eaReverseReduced: Math.max(this.reaction.Ea_reverse - this.eaReduction, 5),
            reduction: this.eaReduction
        };
    }

    /**
     * Calcula la constante de equilibrio Kc desde termodinámica
     * K = exp(-ΔG° / RT)
     * Donde ΔG° = ΔH - T·ΔS
     * 
     * NOTA: Las contantes cinéticas (kForward/kReverse) han sido ajustadas
     * para coincidir matemáticamente con este valor termodinámico.
     */
    calculateKc() {
        const { deltaH, deltaS } = this.reaction;
        const T = this.temperature;
        const R = 8.314; // J/(mol·K)

        // ΔG° = ΔH - T·ΔS (convertir todo a J)
        const deltaG_standard = (deltaH * 1000) - (T * deltaS);

        // K = exp(-ΔG° / RT)
        const K = Math.exp(-deltaG_standard / (R * T));

        return K;
    }

    /**
     * Calcula el cociente de reacción Q
     * Q = [productos]^coef / [reactivos]^coef
     */
    calculateQ() {
        let numerator = 1;
        let denominator = 1;

        this.reaction.products.forEach(species => {
            const conc = Math.max(this.concentrations[species.formula], 1e-10);
            numerator *= Math.pow(conc, species.coefficient);
        });

        this.reaction.reactants.forEach(species => {
            const conc = Math.max(this.concentrations[species.formula], 1e-10);
            denominator *= Math.pow(conc, species.coefficient);
        });

        return numerator / denominator;
    }

    /**
     * Calcula ΔG en las condiciones actuales
     * ΔG = ΔG° + RT·ln(Q)
     */
    calculateDeltaG() {
        const { deltaH, deltaS } = this.reaction;
        const T = this.temperature;

        // ΔG° = ΔH - T·ΔS
        const deltaG_standard = deltaH - (T * deltaS / 1000); // kJ/mol

        const Q = this.calculateQ();
        const R_kJ = R / 1000; // kJ/(mol·K)

        // ΔG = ΔG° + RT·ln(Q)
        const deltaG = deltaG_standard + (R_kJ * T * Math.log(Q));

        return deltaG;
    }

    /**
     * Calcula la velocidad de reacción directa
     */
    calculateForwardRate() {
        const kf = this.getForwardRateConstant();
        let rate = kf;

        this.reaction.reactants.forEach(species => {
            const conc = Math.max(this.concentrations[species.formula], 0);
            rate *= Math.pow(conc, species.coefficient);
        });

        return rate;
    }

    /**
     * Calcula la velocidad de reacción inversa
     */
    calculateReverseRate() {
        const kr = this.getReverseRateConstant();
        let rate = kr;

        this.reaction.products.forEach(species => {
            const conc = Math.max(this.concentrations[species.formula], 0);
            rate *= Math.pow(conc, species.coefficient);
        });

        return rate;
    }

    /**
     * Avanza la simulación un paso de tiempo (integración numérica)
     * Usa método de Euler simple
     */
    step(dt) {
        const rateForward = this.calculateForwardRate();
        const rateReverse = this.calculateReverseRate();

        const netRate = rateForward - rateReverse;

        // Actualizar concentraciones de reactivos
        this.reaction.reactants.forEach(species => {
            const change = -netRate * species.coefficient * dt;
            this.concentrations[species.formula] = Math.max(
                this.concentrations[species.formula] + change,
                0
            );
        });

        // Actualizar concentraciones de productos
        this.reaction.products.forEach(species => {
            const change = netRate * species.coefficient * dt;
            this.concentrations[species.formula] = Math.max(
                this.concentrations[species.formula] + change,
                0
            );
        });

        this.time += dt;

        // Guardar en historia
        this.recordHistory(rateForward, rateReverse);
    }

    /**
     * Guarda el estado actual en la historia
     */
    recordHistory(rateForward, rateReverse) {
        this.history.time.push(this.time);

        Object.keys(this.concentrations).forEach(species => {
            // Asegurar que el array existe antes de hacer push
            if (this.history.concentrations[species]) {
                this.history.concentrations[species].push(this.concentrations[species]);
            } else {
                console.error(`History array not initialized for species "${species}"`);
                // Inicializar si no existe
                this.history.concentrations[species] = [this.concentrations[species]];
            }
        });

        this.history.rates.forward.push(rateForward);
        this.history.rates.reverse.push(rateReverse);
        this.history.Q.push(this.calculateQ());
        this.history.deltaG.push(this.calculateDeltaG());
    }

    /**
     * Verifica si el sistema está en equilibrio
     */
    isAtEquilibrium(tolerance = 0.05) {
        const Q = this.calculateQ();
        const Kc = this.calculateKc();

        const relativeError = Math.abs(Q - Kc) / Kc;
        return relativeError < tolerance;
    }

    /**
     * Determina la dirección de la reacción
     */
    getReactionDirection() {
        const Q = this.calculateQ();
        const Kc = this.calculateKc();

        if (Math.abs(Q - Kc) / Kc < 0.05) {
            return 'equilibrium';
        }

        return Q < Kc ? 'forward' : 'reverse';
    }

    /**
     * Reinicia la simulación
     */
    reset() {
        this.concentrations = this.getInitialConcentrations();
        this.time = 0;
        this.temperature = this.reaction.recommended.temperature;
        this.pressure = this.reaction.recommended.pressure;
        this.volume = this.reaction.recommended.volume;

        // Limpiar historia
        this.history.time = [];
        this.history.Q = [];
        this.history.deltaG = [];
        this.history.rates.forward = [];
        this.history.rates.reverse = [];

        Object.keys(this.history.concentrations).forEach(species => {
            this.history.concentrations[species] = [];
        });

        // Resetear ajustes de temperatura y catalizador
        this.kForward_adjusted = null;
        this.kReverse_adjusted = null;
        this.eaReduction = 0;
    }

    /**
     * Establece una concentración específica
     */
    setConcentration(species, value) {
        if (this.concentrations.hasOwnProperty(species)) {
            this.concentrations[species] = Math.max(value, 0);
        }
    }

    /**
     * Obtiene información resumida del sistema
     */
    getSystemInfo() {
        return {
            temperature: this.temperature,
            pressure: this.pressure,
            volume: this.volume,
            time: this.time,
            concentrations: { ...this.concentrations },
            Kc: this.calculateKc(),
            Q: this.calculateQ(),
            deltaG: this.calculateDeltaG(),
            direction: this.getReactionDirection(),
            atEquilibrium: this.isAtEquilibrium(),
            forwardRate: this.calculateForwardRate(),
            reverseRate: this.calculateReverseRate()
        };
    }
}
