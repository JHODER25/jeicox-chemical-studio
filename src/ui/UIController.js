/**
 * Chemical Equilibrium Studio - UI Controller  
 * Controlador adicional para elementos de UI
 */

// Este archivo puede extenderse con funcionalidad UI adicional
// Por ahora sirve como punto de entrada para futuros módulos

export class UIController {
    constructor() {
        this.notifications = [];
    }

    /**
     * Muestra una notificación
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type}`;
        notification.innerHTML = `
      <span class="alert-icon">${this.getIcon(type)}</span>
      <div class="alert-content">
        <div class="alert-message">${message}</div>
      </div>
    `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Obtiene icono según tipo
     */
    getIcon(type) {
        const icons = {
            info: 'ℹ️',
            success: '✅',
            warning: '⚠️',
            error: '❌'
        };
        return icons[type] || icons.info;
    }
}

// Exportar instancia singleton
export default new UIController();
