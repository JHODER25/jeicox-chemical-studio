# Chemical Equilibrium Studio

Un simulador interactivo avanzado de equilibrio químico y cinética de reacción con visualización 3D en tiempo real.

## 🌟 Características

- **Visualización 3D de Partículas**: Sistema de partículas moleculares con física realista usando Three.js
- **6 Reacciones Pre-configuradas**: Desde equilibrios simples hasta procesos industriales complejos
- **Motor de Equilibrio Químico**: Cálculos precisos de Kc, Q, ΔG con Principio de Le Chatelier
- **Cinética de Reacción**: Implementación de Ecuación de Arrhenius y efectos de temperatura
- **Gráficas en Tiempo Real**: Concentración vs tiempo, velocidades de reacción, energía de Gibbs
- **Interfaz Premium**: Diseño glassmorphic moderno con modo oscuro
- **Exportación de Datos**: CSV, PNG, configuraciones JSON

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Build de producción
npm run build
```

## 🧪 Reacciones Incluidas

1. **N₂O₄ ⇌ 2NO₂** - Disociación con cambio de color
2. **H₂ + I₂ ⇌ 2HI** - Síntesis clásica de HI
3. **PCl₅ ⇌ PCl₃ + Cl₂** - Efecto de presión
4. **Fe³⁺ + SCN⁻ ⇌ FeSCN²⁺** - Equilibrio iónico
5. **CO + Cl₂ ⇌ COCl₂** - Proceso industrial
6. **N₂ + 3H₂ ⇌ 2NH₃** - Proceso Haber-Bosch

## 🎮 Uso

1. Selecciona una reacción de la lista
2. Ajusta parámetros: temperatura, presión, volumen
3. Modifica concentraciones iniciales
4. Presiona ▶️ Iniciar para comenzar la simulación
5. Observa las partículas 3D y las gráficas en tiempo real
6. Experimenta con perturbaciones (Le Chatelier)
7. Exporta datos para análisis

## 🛠 Tecnologías

- **Vite** - Build tool y dev server
- **Three.js** - Renderizado 3D
- **Chart.js** - Gráficas interactivas
- **Vanilla JavaScript** - Lógica de aplicación
- **CSS3** - Diseño glassmorphic premium

## 📊 Características Técnicas

- Integración numérica con método de Euler
- Distribución de velocidades de Maxwell-Boltzmann
- Detección de colisiones entre partículas
- Ecuación de van't Hoff para temperatura
- Relación entre Kc y Kp
- Balance de materia en tiempo real

## 📝 Licencia

MIT License - Creado para educación en química

## 🧑‍🔬 Autor

Chemical Equilibrium Studio - 2026
