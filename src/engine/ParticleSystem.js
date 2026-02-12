/**
 * Chemical Equilibrium Studio - 3D Particle System
 * Sistema de partículas moleculares con física y colisiones
 */

import * as THREE from 'three';

export class ParticleSystem {
    constructor(scene, reaction, volume = 10) {
        this.scene = scene;
        this.reaction = reaction;
        this.volume = volume;

        this.particles = [];
        this.particlesPerMol = 20; // Reducido de 50 para mejor rendimiento
        this.MAX_PARTICLES = 400;  // Límite absoluto de partículas
        this.MAX_PARTICLES_PER_FRAME = 20; // Máximo a añadir por frame

        // Límites del contenedor (caja cúbica)
        this.bounds = this.calculateBounds(volume);

        // Parámetros de física
        this.temperature = 298; // K
        this.dt = 0.016; // Time step (60 FPS)

        this.createContainer();
    }

    /**
     * Calcula los límites del contenedor basado en el volumen
     */
    calculateBounds(volume_L) {
        // Volumen en L, convertir a escala visual
        const size = Math.cbrt(volume_L) * 2; // Escala para visualización
        return {
            x: [-size / 2, size / 2],
            y: [-size / 2, size / 2],
            z: [-size / 2, size / 2]
        };
    }

    /**
     * Crea el contenedor visual
     */
    createContainer() {
        const size = this.bounds.x[1] - this.bounds.x[0];

        // Geometría de caja con bordes
        const geometry = new THREE.BoxGeometry(size, size, size);
        const edges = new THREE.EdgesGeometry(geometry);
        const material = new THREE.LineBasicMaterial({
            color: 0x06b6d4,
            transparent: true,
            opacity: 0.3
        });

        this.container = new THREE.LineSegments(edges, material);
        this.scene.add(this.container);

        // Plano de fondo sutil
        const planeGeometry = new THREE.PlaneGeometry(size, size);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0x1a2332,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });

        const plane = new THREE.Mesh(planeGeometry, planeMaterial);
        plane.position.z = -size / 2;
        this.scene.add(plane);
    }

    /**
     * Crea partículas basadas en las concentraciones
     */
    createParticles(concentrations) {
        this.clear();

        // Crear partículas para cada especie
        [...this.reaction.reactants, ...this.reaction.products].forEach(species => {
            const concentration = concentrations[species.formula] || 0;
            const numParticles = Math.round(concentration * this.particlesPerMol);

            for (let i = 0; i < numParticles; i++) {
                this.addParticle(species);
            }
        });
    }

    /**
     * Añade una partícula de una especie química
     */
    addParticle(species) {
        // Geometría de esfera para la partícula
        const radius = 0.15;
        const geometry = new THREE.SphereGeometry(radius, 16, 16);

        // Material con color de la especie
        const material = new THREE.MeshPhongMaterial({
            color: species.color,
            shininess: 80,
            emissive: species.color,
            emissiveIntensity: 0.2
        });

        const mesh = new THREE.Mesh(geometry, material);

        // Posición inicial aleatoria dentro del contenedor
        mesh.position.set(
            THREE.MathUtils.randFloatSpread(this.bounds.x[1] * 1.8),
            THREE.MathUtils.randFloatSpread(this.bounds.y[1] * 1.8),
            THREE.MathUtils.randFloatSpread(this.bounds.z[1] * 1.8)
        );

        // Velocidad basada en la temperatura (distribución de Maxwell-Boltzmann)
        const velocity = this.getMaxwellBoltzmannVelocity();

        this.scene.add(mesh);

        const particle = {
            mesh,
            species: species.formula,
            color: species.color,
            coefficient: species.coefficient,
            velocity,
            isReactant: this.reaction.reactants.some(r => r.formula === species.formula)
        };

        this.particles.push(particle);
    }

    /**
     * Genera una velocidad según distribución de Maxwell-Boltzmann
     */
    getMaxwellBoltzmannVelocity() {
        const kB = 1.380649e-23; // Constante de Boltzmann
        const m = 5e-26; // Masa molecular promedio (kg)
        const T = this.temperature;

        // Velocidad RMS: v_rms = sqrt(3kT/m)
        const v_rms = Math.sqrt(3 * kB * T / m) * 0.0001; // Escala para visualización

        // Componentes gaussianas
        const vx = (Math.random() - 0.5) * v_rms;
        const vy = (Math.random() - 0.5) * v_rms;
        const vz = (Math.random() - 0.5) * v_rms;

        return new THREE.Vector3(vx, vy, vz);
    }

    /**
     * Actualiza el sistema de partículas
     */
    update(concentrations, dt = this.dt) {
        // Ajustar número de partículas según concentraciones actuales
        this.adjustParticleCount(concentrations);

        // Actualizar física de cada partícula
        this.particles.forEach(particle => {
            // Mover partícula
            particle.mesh.position.add(
                particle.velocity.clone().multiplyScalar(dt)
            );

            // Colisiones con las paredes del contenedor
            this.handleWallCollisions(particle);
        });

        // Colisiones entre partículas (simplificado)
        this.handleParticleCollisions();
    }

    /**
     * Maneja colisiones con las paredes
     */
    handleWallCollisions(particle) {
        const pos = particle.mesh.position;
        const vel = particle.velocity;
        const bounds = this.bounds;

        // X axis
        if (pos.x < bounds.x[0] || pos.x > bounds.x[1]) {
            vel.x *= -1;
            pos.x = THREE.MathUtils.clamp(pos.x, bounds.x[0], bounds.x[1]);
        }

        // Y axis
        if (pos.y < bounds.y[0] || pos.y > bounds.y[1]) {
            vel.y *= -1;
            pos.y = THREE.MathUtils.clamp(pos.y, bounds.y[0], bounds.y[1]);
        }

        // Z axis
        if (pos.z < bounds.z[0] || pos.z > bounds.z[1]) {
            vel.z *= -1;
            pos.z = THREE.MathUtils.clamp(pos.z, bounds.z[0], bounds.z[1]);
        }
    }

    /**
     * Maneja colisiones entre partículas (simplificado)
     */
    handleParticleCollisions() {
        const collisionDistance = 0.3;

        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const p1 = this.particles[i];
                const p2 = this.particles[j];

                const distance = p1.mesh.position.distanceTo(p2.mesh.position);

                if (distance < collisionDistance) {
                    // Colisión elástica simple
                    const temp = p1.velocity.clone();
                    p1.velocity.copy(p2.velocity);
                    p2.velocity.copy(temp);

                    // Separar partículas para evitar overlap
                    const direction = p1.mesh.position.clone().sub(p2.mesh.position).normalize();
                    const separation = (collisionDistance - distance) / 2;
                    p1.mesh.position.add(direction.multiplyScalar(separation));
                    p2.mesh.position.sub(direction.multiplyScalar(separation));
                }
            }
        }
    }

    /**
     * Ajusta el número de partículas según las concentraciones actuales
     */
    adjustParticleCount(concentrations) {
        // Verificar límite global primero
        const totalParticles = this.particles.length;

        [...this.reaction.reactants, ...this.reaction.products].forEach(species => {
            const targetCount = Math.round(concentrations[species.formula] * this.particlesPerMol);
            const currentCount = this.particles.filter(p => p.species === species.formula).length;

            if (targetCount > currentCount) {
                // Añadir partículas (CON LÍMITES)
                const toAdd = targetCount - currentCount;

                // Limitar cuántas podemos añadir este frame
                const maxCanAdd = Math.min(
                    toAdd,
                    this.MAX_PARTICLES_PER_FRAME,
                    this.MAX_PARTICLES - this.particles.length
                );

                for (let i = 0; i < maxCanAdd; i++) {
                    this.addParticle(species);
                }
            } else if (targetCount < currentCount) {
                // Remover partículas
                const toRemove = currentCount - targetCount;
                const speciesParticles = this.particles.filter(p => p.species === species.formula);

                for (let i = 0; i < Math.min(toRemove, speciesParticles.length); i++) {
                    const particle = speciesParticles[i];
                    this.scene.remove(particle.mesh);
                    particle.mesh.geometry.dispose();
                    particle.mesh.material.dispose();

                    const index = this.particles.indexOf(particle);
                    if (index > -1) {
                        this.particles.splice(index, 1);
                    }
                }
            }
        });
    }

    /**
     * Actualiza la temperatura del sistema
     */
    setTemperature(temp_K) {
        this.temperature = temp_K;

        // Reescalar velocidades según nueva temperatura
        const scaleFactor = Math.sqrt(temp_K / 298); // Relativo a 298 K

        this.particles.forEach(particle => {
            particle.velocity.multiplyScalar(scaleFactor);
        });
    }

    /**
     * Actualiza el volumen del contenedor
     */
    setVolume(volume_L) {
        this.volume = volume_L;
        this.bounds = this.calculateBounds(volume_L);

        // Actualizar contenedor visual
        this.scene.remove(this.container);
        this.createContainer();

        // Reposicionar partículas que están fuera de los nuevos límites
        this.particles.forEach(particle => {
            const pos = particle.mesh.position;
            pos.x = THREE.MathUtils.clamp(pos.x, this.bounds.x[0], this.bounds.x[1]);
            pos.y = THREE.MathUtils.clamp(pos.y, this.bounds.y[0], this.bounds.y[1]);
            pos.z = THREE.MathUtils.clamp(pos.z, this.bounds.z[0], this.bounds.z[1]);
        });
    }

    /**
     * Limpia todas las partículas
     */
    clear() {
        this.particles.forEach(particle => {
            this.scene.remove(particle.mesh);
            particle.mesh.geometry.dispose();
            particle.mesh.material.dispose();
        });

        this.particles = [];
    }

    /**
     * Obtiene el número actual de partículas
     */
    getParticleCount() {
        return this.particles.length;
    }

    /**
     * Elimina completamente el sistema de partículas de la escena
     * (útil al cambiar de reacción)
     */
    dispose() {
        // Limpiar partículas
        this.clear();

        // Eliminar contenedor de la escena
        if (this.container) {
            this.scene.remove(this.container);
            this.container.geometry.dispose();
            this.container.material.dispose();
            this.container = null;
        }

        // Eliminar cualquier plano de fondo u otros objetos
        // Buscar y eliminar todos los objetos que este sistema añadió
        const objectsToRemove = [];
        this.scene.children.forEach(child => {
            if (child.type === 'Mesh' && child.material && child.material.opacity === 0.1) {
                objectsToRemove.push(child);
            }
        });

        objectsToRemove.forEach(obj => {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) obj.material.dispose();
        });
    }
}
