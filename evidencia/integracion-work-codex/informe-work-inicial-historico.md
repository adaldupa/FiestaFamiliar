# Integración Work + Codex · 21 de noviembre de 2026

**Estado: BLOQUEADA / borrador. No lista para aceptación. Sin merge a main.**

Rama de preparación: `integracion/work-codex-20261121`. Parte del commit remoto `ce31f23e7606bd72e0c71cd0924380e098e90d73`. No se modificaron motores, reglas ni presentación en esta preparación: se conserva íntegra la última base recuperable mientras se localizan las otras fuentes.

## Inventario verificado antes de editar

- Árbol de trabajo inicialmente limpio, sin stash y con un solo worktree. No hay cambios locales sin confirmar que recuperar.
- `git fetch origin` y `git ls-remote --heads origin` muestran ocho ramas remotas: main, integracion-fase1-concurso, fase2-motor-concurso, doce-minijuegos-completos, cierre-funcional-concurso, ajustes-pruebas-manuales, roba-configurable-ensayo y correcciones-turnos-postensayo.
- **No está disponible `revision/mecanicas-20261121`.** Tampoco figura entre las ramas locales ni en el worktree. La búsqueda independiente de ramas del conector GitHub devuelve una lista vacía.
- **No está disponible `561d3fd`.** `git cat-file` no lo reconoce y GitHub responde 422: `No commit found for SHA: 561d3fd`. Esto no demuestra que no exista en otra computadora; significa que no se puede recuperar desde las fuentes accesibles aquí.
- Las referencias locales de ejecuciones anteriores conservan sus commits; no se borraron ni se reescribieron. Los pares local/remoto siguientes tienen exactamente el mismo árbol:

| Commit local atribuido a Codex | Commit publicado equivalente | Contenido comprobado |
|---|---|---|
| `80628ab` | `ce31f23` | Turnos corregidos, Roba por clasificación y cierre voluntario; árbol `4a85c34e36530b235058aaf50b4b4502b6a9feba` |
| `8eaae33` | `2df2683` | Informe de 219 pruebas y ensayo pendiente; árbol `ff554ff3537547172b1fb23763c85b7c569ca437` |
| `a5f2045` | `19bc8e6` | Importes configurables y excepción por ventaja; árbol `e40f357211cb2457d38d429b22ccd62eab1971d8` |

La identidad de autor y los pares de árboles no permiten atribuir a una herramienta una versión visual adicional no publicada. No se confunden estos commits equivalentes con el Work `561d3fd` solicitado.

## Matriz de diferencias funcionales y visuales

Esta matriz se preparó antes de cualquier cambio de código. La rama nueva solo añade informe, guía y resultados de pruebas: **no se intentó resolver una comparación inexistente sustituyendo archivos por versiones antiguas**.

| Componente | Base recuperable `ce31f23` | Work `561d3fd` solicitado | Codex reciente adicional | Resolución |
|---|---|---|---|---|
| Doce juegos y sus bancos | Motores existentes y pruebas por juego | No recuperable | Sin fuente distinta disponible | Conservar base; comparación pendiente |
| Actor y Tararea | Nuevas revisiones por turnos; 90/60 s; tiempos independientes | No recuperable | Local `80628ab` idéntico | Sin conflicto entre copias disponibles |
| Sonido y Palabras | Tarjetas públicas en JS/Python y saneador de TV; representante de espaldas | No recuperable | Local idéntico | Conservar y repetir regresión |
| Roba y Gana | Seis cartas, orden por clasificación, dueños visibles, robos automáticos, retos explícitos | No recuperable | Local idéntico | Conservar importes configurables, política previa y repetición autorizada |
| Escenario navideño | `estilos.css`, `navidad.css`, `equipos.css`, `escenario.css` y `assets/` sin diferencias respecto a main | No recuperable | Mejoras históricas ya presentes | Preservados byte por byte |
| Ruleta y animaciones | `src/wheel.js`, reglas de giro y presentación ampliada existentes | No recuperable | Sin parche visual adicional disponible | No reemplazados; comparación visual pendiente |
| Marcador, instrucciones y tarjetas | Renderizadores y estilos actuales intactos | No recuperable | Sin fuente adicional | No hay rediseño ni reversión |
| Cronómetros y consola | Barra de acciones y resumen de turnos existentes | No recuperable | Local idéntico | Conservar lógica y estilo |
| Premiación y cierre | Ceremonia, clasificación y corrección auditada existentes | No recuperable | Local idéntico | Regresión automatizada; navegador pendiente |
| Resoluciones y capturas | Tests de navegador y capturas históricas disponibles | Faltan las 14 rondas reportadas | Faltan capturas de la nueva presentación solicitada | No se certifica igualdad visual |

## Conflictos y decisiones

| Hallazgo | Decisión | Pendiente |
|---|---|---|
| Work indicado ausente | No inventar ni recrear su código desde el resumen | Publicar `revision/mecanicas-20261121` con `561d3fd`, o proporcionar git bundle/patch con su origen |
| Codex local y remoto con SHAs distintos | Comparar árboles: el contenido es idéntico; partir del remoto para conservar su ascendencia | Ninguno en esos tres pares |
| Nuevos cambios visuales de Codex no localizados | Mantener íntegros los estilos y renderizadores disponibles | Identificar rama/commit o proporcionar el diff local de Codex |
| Posible conflicto de reglas entre fuentes | No se cambió ninguna regla ni se resolvió a ciegas | Revisar cuando existan ambas fuentes |
| Pruebas de 251 casos y 14 rondas de navegador sin archivos fuente/evidencia accesibles | No adoptarlas como ejecución verificada | Recuperar fuente y volver a ejecutar |

No hubo conflictos textuales de merge resueltos: no se ha realizado un merge de las dos fuentes solicitadas. La rama es una preparación trazable, no una integración concluida.

## Pruebas repetidas en esta rama

- `npm test`: **232 aprobadas, 0 fallos** (187 Node + 45 Python), repetidas en esta rama. Consultar `evidencia/integracion-work-codex/regresion.txt`. Incluye todos los tests existentes de dominio y servidor LAN, doce juegos y concursos automatizados de 14 rondas con 2/3/4 equipos. Son fixtures sintéticos, no una fiesta física ni 14 rondas realizadas en navegador.
- `node --test tests/*.browser.cjs`: **37 casos intentados, 0 aprobados, 37 fallidos por bloqueo al iniciar Chromium** (`socket() failed: Operation not permitted`). No alcanzaron la interfaz. Registro: `evidencia/integracion-work-codex/navegadores.txt`.
- Se comprobó igualdad de los árboles local/remoto anteriores y ausencia de diferencias en los recursos navideños enumerados.
- No se ejecutaron pruebas con HDMI, celular ni TV físicos. No se generaron capturas nuevas de la aplicación. Las capturas históricas del repositorio y los HTML de fixtures de `evidencia/postensayo/` conservan su carácter histórico/reproducible; no certifican la integración solicitada.

## Publicación y siguiente paso

La rama de preparación se publica con un PR **en borrador**, marcado bloqueado y sin solicitar aprobación de aceptación. `main` conserva `1fd201ef1b13d0054d2f6978e60a17abe99ee40f`.

Para continuar hace falta publicar o suministrar: (1) `revision/mecanicas-20261121` / `561d3fd`, y (2) la rama, commits o cambios locales de las mejoras visuales recientes de Codex, si son distintos de los pares inventariados. Después se comparan archivos y capturas, se integra respetando la lógica y se repiten las pruebas. No se sustituirá esta carencia por una reconstrucción.

El ensayo físico de la base recuperable se explica en [ENSAYO_HDMI_CELULAR.md](ENSAYO_HDMI_CELULAR.md). No equivale a aceptar una integración que sigue incompleta.
