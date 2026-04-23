# Checklist SEO — Arreglar Indexación en Google Search Console
**Fecha:** 14 Febrero 2026
**Web:** https://golfinmallorca.com

---

## PASO 1 — REDESPLEGAR LA WEB

- [ ] En Emergent → pulsar botón **"Deploy"** (o "Save to GitHub" según tu flujo)
- [ ] Esperar a que termine el despliegue (~2-5 min)

Archivos modificados automáticamente subidos:
- `/frontend/public/index.html` (meta tags, canonical, hreflang, schema)
- `/frontend/public/sitemap.xml` (19 cursos de golf, lastmod 2026-02-14)
- `/frontend/public/robots.txt` (sin `Disallow: /*?lang=`)

---

## PASO 2 — VERIFICAR QUE LOS CAMBIOS ESTÁN ONLINE

Abre cada URL en el navegador y comprueba:

- [ ] **https://golfinmallorca.com/robots.txt**
  → NO debe contener la línea `Disallow: /*?lang=`

- [ ] **https://golfinmallorca.com/sitemap.xml**
  → Debe listar **19 cursos**, incluyendo:
  - `/golf-courses/golf-de-andratx`
  - `/golf-courses/golf-maioris`
  - `/golf-courses/golf-son-termens`

- [ ] **https://golfinmallorca.com/** → Click derecho → "Ver código fuente de la página"
  - Buscar `canonical` → solo debe haber **una etiqueta**: `<link rel="canonical" href="https://golfinmallorca.com/" />`
  - Buscar `hreflang` → **solo** deben aparecer `hreflang="en"` y `hreflang="x-default"`
  - Buscar `19 best golf courses` → debe aparecer en el meta description
  - NO debe haber `?lang=de`, `?lang=fr`, `?lang=sv` en ninguna parte

---

## PASO 3 — GOOGLE SEARCH CONSOLE

### 3.A) Reenviar el sitemap
1. Entra a **Google Search Console** → selecciona tu propiedad `golfinmallorca.com`
2. Menú izquierdo → **Sitemaps**
3. Si aparece `sitemap.xml` en la lista:
   - Click en los 3 puntos a la derecha → **Eliminar sitemap**
4. Añadirlo de nuevo:
   - Escribir: `sitemap.xml`
   - Click **Enviar**
5. ✅ Debe aparecer "Correcto" en 1-3 días

### 3.B) Solicitar re-indexación de páginas clave
Menú izquierdo → **Inspección de URLs** → pegar cada URL y hacer click en **"Solicitar indexación"**:

- [ ] `https://golfinmallorca.com/`
- [ ] `https://golfinmallorca.com/book-tee-times`
- [ ] `https://golfinmallorca.com/golf-holidays-mallorca`
- [ ] `https://golfinmallorca.com/golf-courses/golf-de-andratx` (curso nuevo)
- [ ] `https://golfinmallorca.com/golf-courses/golf-maioris` (curso nuevo)
- [ ] `https://golfinmallorca.com/golf-courses/golf-son-termens` (curso nuevo)
- [ ] `https://golfinmallorca.com/golf-courses/golf-son-gual`
- [ ] `https://golfinmallorca.com/golf-courses/golf-alcanada`

⚠️ Google limita a ~10 solicitudes manuales al día. Prioriza las más importantes.

### 3.C) Validar correcciones de errores de indexación
1. Menú izquierdo → **Páginas** (Indexación)
2. Baja a la sección **"Por qué no se indexan las páginas"**
3. Para cada tipo de error listado abajo, click en el error → botón **"Validar corrección"**:

- [ ] **Alternate page with proper canonical tag** (el error principal de tus screenshots)
- [ ] **Página con redirección**
- [ ] **Bloqueada por robots.txt**
- [ ] **Duplicada: Google ha elegido una página canónica diferente**
- [ ] **Rastreada, actualmente no indexada**

Google empezará una auditoría y te enviará un email cuando termine (1-4 semanas).

---

## PASO 4 — MONITORIZACIÓN (SEGUIMIENTO SEMANAL)

Cada semana durante 1 mes:

- [ ] Entrar en Search Console → **Páginas**
- [ ] Comprobar que el número de **"Páginas no indexadas"** baja
- [ ] Comprobar que el número de **"Páginas indexadas"** sube
- [ ] En **Rendimiento** → revisar que las impresiones y clicks no caen (deben subir)

---

## TIEMPOS ESPERADOS

| Hito | Tiempo |
|---|---|
| Crawl del nuevo sitemap | 1-3 días |
| Re-indexación de URLs solicitadas manualmente | 3-10 días |
| Desaparición de errores "Alternate page" | 1-4 semanas |
| Limpieza completa del índice | 4-8 semanas |

---

## QUÉ VA A PASAR (RESUMEN)

✅ **Se solucionarán**:
- Errores "Alternate page with proper canonical tag"
- Errores de canonical mal configurado
- Conflictos entre `hreflang` y `robots.txt`

✅ **Google re-indexará**:
- Home + todas las landing pages con meta actualizada ("19 golf courses")
- 3 cursos nuevos (Andratx, Maioris, Son Termens)

❌ **Desaparecerán del índice** (correcto, eran duplicados):
- URLs con `?lang=de`, `?lang=fr`, `?lang=sv`

---

## NOTA IMPORTANTE — MULTI-IDIOMA

Tu web actualmente **solo rankea en inglés** en Google.
El selector de idioma (DE/FR/SV) funciona **solo en el navegador** del usuario pero Google no lo ve.

Si en el futuro quieres rankear en Alemania/Francia/Suecia de verdad, hay que crear rutas con HTML traducido (`/de/`, `/fr/`, `/sv/`). Es un trabajo aparte que podemos abordar cuando quieras. Por ahora, lo más importante es **limpiar los errores de indexación actuales** con este checklist.

---

## CONTACTO DE SOPORTE

Si algún paso de Google Search Console no va bien, haz screenshot del error y avísame — te ayudo a debuggear.

¡Buena suerte! 🚀⛳
