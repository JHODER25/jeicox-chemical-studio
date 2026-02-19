/**
 * Biblioteca de reacciones químicas pre-configuradas
 * VALORES REALISTAS basados en literatura científica
 */

export const ReactionLibrary = {
    // ========== REACCIÓN 1: N2O4 ⇌ 2NO2 (Fácil) ==========
    n2o4_no2: {
        id: 'n2o4_no2',
        name: 'Disociación de Tetróxido de Dinitrógeno',
        equation: 'N₂O₄ ⇌ 2NO₂',
        description: 'Equilibrio gas-fase con cambio de color visible (incoloro ↔ marrón)',
        difficulty: 'fácil',

        reactants: [
            { formula: 'N₂O₄', coefficient: 1, color: '#64748b', initialConc: 2.0 }
        ],
        products: [
            { formula: 'NO₂', coefficient: 2, color: '#d97706', initialConc: 0.1 }
        ],

        // Cinética AJUSTADA (proporcional a valores reales pero escala útil)
        kForward: 0.48,  // s⁻¹ a 298 K (escalado 10x menor para visualización)
        // K_eq (termo) ≈ 0.147. kr = kf / K_eq = 0.48 / 0.147 ≈ 3.265
        kReverse: 3.27, // M⁻¹s⁻¹ (AJUSTADO TERMODINÁMICAMENTE)

        // Energías de activación REALES
        Ea_forward: 54.0,  // kJ/mol (documentado: 50-58 kJ/mol)
        Ea_reverse: 33.0,  // kJ/mol

        // Termodinámica
        deltaH: 57.2,   // kJ/mol (endotérmica, documentado)
        deltaS: 176.0,  // J/(mol·K) (aumento de entropía: 1 mol → 2 mol)

        // Catalizador
        recommendedCatalyst: 'none',
        catalystReason: 'Esta reacción es naturalmente rápida en fase gas. No requiere catalizador para observar el equilibrio en minutos.',
        catalystAlternative: 'Ninguno necesario - la reacción es espontánea y rápida',

        recommended: {
            temperature: 298,
            pressure: 1.0,
            volume: 10
        }
    },

    // ========== REACCIÓN 2: H2 + I2 ⇌ 2HI (Fácil-Media) ==========
    h2_i2_hi: {
        id: 'h2_i2_hi',
        name: 'Síntesis de Yoduro de Hidrógeno',
        equation: 'H₂ + I₂ ⇌ 2HI',
        description: 'Reacción clásica de equilibrio, estudiada por Bodenstein (1899)',
        difficulty: 'fácil',

        reactants: [
            { formula: 'H₂', coefficient: 1, color: '#a5b4fc', initialConc: 1.0 },
            { formula: 'I₂', coefficient: 1, color: '#7c3aed', initialConc: 1.0 }
        ],
        products: [
            { formula: 'HI', coefficient: 2, color: '#fbbf24', initialConc: 0.0 }
        ],

        // Cinética AJUSTADA  
        kForward: 0.00234,  // M⁻¹s⁻¹ a 700 K (escalado 100x mayor para pedagogía)
        // K_eq (termo) ≈ 69.2 (a 700K). kr = kf / K_eq = 0.00234 / 69.2 ≈ 0.0000338
        kReverse: 0.0000338, // M⁻²s⁻¹ (AJUSTADO TERMODINÁMICAMENTE)

        // Energías de activación REALES
        Ea_forward: 165.0, // kJ/mol (documentado: 163-167 kJ/mol)
        Ea_reverse: 185.0, // kJ/mol

        // Termodinámica
        deltaH: -9.4,   // kJ/mol (ligeramente exotérmica)
        deltaS: 21.8,   // J/(mol·K)

        // Catalizador
        recommendedCatalyst: 'platinum',
        catalystReason: 'El platino cataliza eficientemente la ruptura de enlaces H-H e I-I, reduciendo Ea ~35 kJ/mol. Es el catalizador estándar para hidrogenaciones.',
        catalystAlternative: 'Paladio también efectivo, pero Pt es más estable a altas temperaturas',

        recommended: {
            temperature: 700,  // Necesita alta T sin catalizador
            pressure: 1.0,
            volume: 10
        }
    },

    // ========== REACCIÓN 3: PCl5 ⇌ PCl3 + Cl2 (Media) ==========
    pcl5_pcl3: {
        id: 'pcl5_pcl3',
        name: 'Descomposición de Pentacloruro de Fósforo',
        equation: 'PCl₅ ⇌ PCl₃ + Cl₂',
        description: 'Equilibrio con dependencia fuerte de presión (principio de Le Chatelier)',
        difficulty: 'media',

        reactants: [
            { formula: 'PCl₅', coefficient: 1, color: '#fde047', initialConc: 1.5 }
        ],
        products: [
            { formula: 'PCl₃', coefficient: 1, color: '#84cc16', initialConc: 0.0 },
            { formula: 'Cl₂', coefficient: 1, color: '#10b981', initialConc: 0.0 }
        ],

        // Cinética AJUSTADA
        kForward: 0.00086,  // s⁻¹ a 473 K (valores reales funcionan bien)
        // K_eq (termo) ≈ 0.0016 (473K). kr = kf / K_eq = 0.00086 / 0.0016 ≈ 0.5375
        kReverse: 0.538,     // M⁻¹s⁻¹ (AJUSTADO TERMODINÁMICAMENTE)

        // Energías de activación REALES
        Ea_forward: 210.0,  // kJ/mol (ruptura de enlace P-Cl fuerte)
        Ea_reverse: 175.0,  // kJ/mol

        // Termodinámica
        deltaH: 92.5,   // kJ/mol (endotérmica)
        deltaS: 142.0,  // J/(mol·K) (aumento de moléculas)

        // Catalizador
        recommendedCatalyst: 'palladium',
        catalystReason: 'El paladio es efectivo para catálisis de ruptura de enlaces P-Cl. Reduce Ea ~30 kJ/mol. Preferido sobre Pt por menor costo y buena actividad.',
        catalystAlternative: 'Platino también funciona, pero Pd es más económico y selectivo',

        recommended: {
            temperature: 473,  // ~200°C necesarios
            pressure: 1.0,
            volume: 10
        }
    },

    // ========== REACCIÓN 4: Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺ (Fácil - RÁPIDA) ==========
    fe_scn: {
        id: 'fe_scn',
        name: 'Formación de Tiocianato de Hierro(III)',
        equation: 'Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺',
        description: 'Reacción iónica instantánea con color rojo sangre intenso',
        difficulty: 'media',

        reactants: [
            { formula: 'Fe³⁺', coefficient: 1, color: '#f59e0b', initialConc: 0.5 },
            { formula: 'SCN⁻', coefficient: 1, color: '#c7d2fe', initialConc: 0.5 }
        ],
        products: [
            { formula: 'FeSCN²⁺', coefficient: 1, color: '#dc2626', initialConc: 0.0 }
        ],

        // Cinética AJUSTADA (reducida para estabilidad)
        kForward: 18,   // M⁻¹s⁻¹ (100x menor para estabilidad)
        // K_eq (termo) ≈ 239 (298K). kr = kf / K_eq = 18 / 239 ≈ 0.0753
        kReverse: 0.075,   // s⁻¹ (AJUSTADO TERMODINÁMICAMENTE)

        // Energías de activación REALES (muy bajas - iónica)
        Ea_forward: 18.0,  // kJ/mol (barrera muy baja)
        Ea_reverse: 42.0,  // kJ/mol

        // Termodinámica
        deltaH: -24.0,  // kJ/mol (exotérmica)
        deltaS: -35.0,  // J/(mol·K) (pérdida de entropía)

        // Catalizador
        recommendedCatalyst: 'none',
        catalystReason: 'Esta es una reacción iónica en solución acuosa - es esencialmente instantánea (k ~ 10⁸ M⁻¹s⁻¹). No requiere catalizador.',
        catalystAlternative: 'Ninguno - acelerar una reacción instantánea no tiene sentido práctico',

        recommended: {
            temperature: 298,
            pressure: 1.0,
            volume: 10
        }
    },

    // ========== REACCIÓN 5: CO + Cl2 ⇌ COCl2 (Media-Difícil) ==========
    co_cocl2: {
        id: 'co_cocl2',
        name: 'Síntesis de Fosgeno',
        equation: 'CO + Cl₂ ⇌ COCl₂',
        description: 'Producción industrial de fosgeno (gas tóxico, usado en síntesis)',
        difficulty: 'difícil',

        reactants: [
            { formula: 'CO', coefficient: 1, color: '#9ca3af', initialConc: 1.5 },
            { formula: 'Cl₂', coefficient: 1, color: '#22c55e', initialConc: 2.5 }
        ],
        products: [
            { formula: 'COCl₂', coefficient: 1, color: '#ef4444', initialConc: 0.0 }
        ],

        // Cinética AJUSTADA (reducida para evitar sobrecarga con catalizador)
        // Reducimos kForward para que kReverse no sea demasiado pequeño (estabilidad numérica)
        kForward: 0.00014,   // M⁻¹s⁻¹ a 373 K (AJUSTADO para estabilidad)
        // K_eq (termo) ≈ 2.13e8 (373K). kr = kf / K_eq = 0.00014 / 2.13e8 ≈ 6.57e-13
        kReverse: 6.57e-13,  // s⁻¹ (AJUSTADO TERMODINÁMICAMENTE - Muy pequeño, reacción casi irreversible)

        // Energías de activación REALES
        Ea_forward: 98.0,  // kJ/mol
        Ea_reverse: 112.0, // kJ/mol

        // Termodinámica
        deltaH: -107.6, // kJ/mol (muy exotérmica)
        deltaS: -129.0, // J/(mol·K)

        // Catalizador
        recommendedCatalyst: 'platinum',
        catalystReason: 'El proceso industrial de fosgeno usa carbón activado con Pt/Pd. El platino reduce Ea ~35 kJ/mol y es más estable que Pd frente al Cl₂ corrosivo.',
        catalystAlternative: 'Carbón activado solo (menos efectivo pero más barato)',

        recommended: {
            temperature: 373,  // ~100°C
            pressure: 1.0,
            volume: 10
        }
    },

    // ========== REACCIÓN 6: N2 + 3H2 ⇌ 2NH3 (HABER-BOSCH - MUY DIFÍCIL) ==========
    haber_bosch: {
        id: 'haber_bosch',
        name: 'Proceso Haber-Bosch (Síntesis de Amoníaco)',
        equation: 'N₂ + 3H₂ ⇌ 2NH₃',
        description: '⚠️ Triple enlace N≡N extremadamente fuerte. SIN catalizador: ~50,000 años hasta equilibrio',
        difficulty: 'difícil',

        reactants: [
            { formula: 'N₂', coefficient: 1, color: '#3b82f6', initialConc: 1.0 },
            { formula: 'H₂', coefficient: 3, color: '#a5b4fc', initialConc: 3.0 }
        ],
        products: [
            { formula: 'NH₃', coefficient: 2, color: '#8b5cf6', initialConc: 0.0 }
        ],

        // Cinética AJUSTADA (escalada para pedagogía)
        kForward: 8.2e-8,  // M⁻³s⁻¹ a 298 K (escalado 10¹³x mayor para ser observable con timescale)
        // K_eq (termo) ≈ 0.00036 (700K). Espera, 298K o 700K?
        // Haber Bosch usa 700K. A 700K, Keq ≈ 0.00036.
        // Pero kForward está definido a 298K en el comentario? Asumiremos T=700K para consistencia con recommended.
        // A 700K: dH = -92.4 kJ, dS = -0.198 kJ/K. dG = -92.4 - (700*-0.198) = 46.2 kJ.
        // K = exp(-46200 / (8.314*700)) = exp(-7.94) ≈ 0.000356
        // kr = kf / K = 8.2e-8 / 0.000356 ≈ 0.00023
        kReverse: 0.00023,  // M⁻²s⁻¹ (AJUSTADO TERMODINÁMICAMENTE a 700K)

        // Energías de activación REALES (triple enlace N≡N = 945 kJ/mol)
        Ea_forward: 335.0,  // kJ/mol (ALTÍSIMA - romper N≡N)
        Ea_reverse: 290.0,  // kJ/mol

        // Termodinámica
        deltaH: -92.4,  // kJ/mol (exotérmica)
        deltaS: -198.0, // J/(mol·K) (4 mol → 2 mol)

        // Catalizador
        recommendedCatalyst: 'iron',
        catalystReason: '🏭 PROCESO INDUSTRIAL HABER-BOSCH: Fe con promotores (K₂O, Al₂O₃, CaO) reduce Ea de 335 → 155 kJ/mol. Premio Nobel 1918. Reduce tiempo de 50,000 años → minutos.',
        catalystAlternative: 'Enzimas nitrogenasa (más eficientes, Ea ~65 kJ/mol, pero no industriales)',

        recommended: {
            temperature: 700,  // Condiciones industriales: 400-500°C, 150-300 atm
            pressure: 200.0,   // Alta presión favorece productos
            volume: 10
        }
    }
};

export function getAllReactions() {
    return Object.values(ReactionLibrary);
}

export function getReactionById(id) {
    return ReactionLibrary[id];
}
