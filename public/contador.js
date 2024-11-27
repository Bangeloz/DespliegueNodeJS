window.onload = function() {
    const targetDate = new Date('2025-02-28T00:00:00'); // Data de contagem regressiva para 28 de fevereiro de 2025
    const contador = document.getElementById('contador');

    function updateCountdown() {
        const now = new Date();
        const timeRemaining = targetDate - now;

        if (timeRemaining <= 0) {
            contador.textContent = '¡Tiempo agotado!';
            return;
        }

        // Calcular dias, horas, minutos e segundos restantes
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24)); // Calcular dias
        const hours = String(Math.floor((timeRemaining / (1000 * 60 * 60)) % 24)).padStart(2, '0');
        const minutes = String(Math.floor((timeRemaining / (1000 * 60)) % 60)).padStart(2, '0');
        const seconds = String(Math.floor((timeRemaining / 1000) % 60)).padStart(2, '0');

        // Atualizar o contador no formato "dias : horas : minutos : segundos"
        contador.textContent = `${days} días : ${hours}h : ${minutes}m : ${seconds}s`;
    }

    // Atualizar a contagem regressiva a cada segundo
    setInterval(updateCountdown, 1000);

    // Atualizar imediatamente na carga da página
    updateCountdown();
};
