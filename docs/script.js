const button = document.getElementById("convert");
const status = document.getElementById("status");
// Cambia este endpoint si Vercel asigna un nuevo dominio a tu API
const API_URL = "https://web-figma-cuyz4kgn5-santis-projects-e614235b.vercel.app/api/extract";

button.addEventListener("click", async () => {
  const url = document.getElementById("url").value;
  const depth = document.getElementById("depth").value;
  if (!url) return alert("Ingresa una URL válida");

  status.textContent = "Procesando...";
  button.disabled = true;

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, depth }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(detail || "Error procesando sitio");
    }

    const blob = await res.blob();
    const download = document.createElement("a");
    download.href = URL.createObjectURL(blob);
    download.download = `web_to_figma_${Date.now()}.fig.json`;
    download.click();
    status.textContent = "Conversión completada ✔";
  } catch (e) {
    status.textContent = "Error: " + e.message;
  } finally {
    button.disabled = false;
  }
});
