/**
 * Catalizadores reales con sus propiedades
 */
export const Catalysts = {
    none: {
        id: 'none',
        name: 'Sin catalizador',
        eaReduction: 0,
        description: 'Sin efecto catalítico'
    },

    platinum: {
        id: 'platinum',
        name: 'Platino (Pt)',
        eaReduction: 35, // kJ/mol de reducción
        description: 'Metal noble usado en hidrogenación y oxidación. Reduce Ea ~35 kJ/mol',
        applications: 'Hidrogenación de alquenos, convertidores catalíticos de automóviles'
    },

    palladium: {
        id: 'palladium',
        name: 'Paladio (Pd)',
        eaReduction: 30,
        description: 'Catalizador para acoplamientos C-C (Suzuki, Heck). Reduce Ea ~30 kJ/mol',
        applications: 'Síntesis orgánica, acoplamiento cruzado, hidrogenación'
    },

    vanadium: {
        id: 'vanadium',
        name: 'Pentóxido de Vanadio (V₂O₅)',
        eaReduction: 40,
        description: 'Catalizador del proceso Contact (H₂SO₄). Reduce Ea ~40 kJ/mol',
        applications: 'Producción de ácido sulfúrico (SO₂ → SO₃)'
    },

    enzyme: {
        id: 'enzyme',
        name: 'Enzima biológica',
        eaReduction: 55,
        description: 'Biocatalizadores altamente eficientes. Reduce Ea ~55 kJ/mol',
        applications: 'Reacciones biológicas, digestión, fermentación'
    },

    iron: {
        id: 'iron',
        name: 'Hierro (Fe) promovido',
        eaReduction: 45,
        description: 'Catalizador del proceso Haber-Bosch. Reduce Ea ~45 kJ/mol',
        applications: 'Síntesis de amoníaco (N₂ + 3H₂ → 2NH₃)'
    }
};

/**
 * Obtiene un catalizador por ID
 */
export function getCatalystById(id) {
    return Catalysts[id] || Catalysts.none;
}

/**
 * Calcula el factor de aceleración basado en la ecuación de Arrhenius
 * factor = exp(ΔEa / RT)
 * donde ΔEa es la reducción de energía de activación
 */
export function calculateAccelerationFactor(eaReduction_kJ, temperature_K) {
    const R = 8.314e-3; // kJ/(mol·K)

    if (eaReduction_kJ <= 0) return 1.0;

    // exp(ΔEa/RT) - cuánto más rápido va con Ea reducida
    return Math.exp(eaReduction_kJ / (R * temperature_K));
}
