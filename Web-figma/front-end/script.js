const button = document.getElementById('convert');
const status = document.getElementById('status');

button.addEventListener('click', async () => {
    const url = document.getElementById('url').value;
    const depth = document.getElementById('depth').value;
    if (!url) return alert('Por favor, ingresa una URL válida');

    button.disabled = true;
    status.textContent = 'Procesando…';

    try {
        const res = await fetch('http://localhost:8787/extract', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url, depth, mode: 'desktop' })
        });

        if (!res.ok) throw new Error('Error al convertir la página');

        const blob = await res.blob();
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `web_to_figma_${Date.now()}.fig.json`;
        a.click();

        status.textContent = 'Conversión completada ✅';
    } catch (err) {
        status.textContent = 'Error: ' + err.message;
    } finally {
        button.disabled = false;
    }
});