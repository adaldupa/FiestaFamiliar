# Cierre funcional de La Gran Noche de Retos

Rama de trabajo: `cierre-funcional-concurso`. Base verificable: `doce-minijuegos-completos`, commit `829f6de`. No se ha hecho merge ni se ha modificado `main`.

## Consolidación de la ejecución anterior

En este espacio solo había un worktree, sin cambios pendientes ni stash. Las ramas locales, remotas y el reflog no contenían otra ejecución de 170 pruebas ni los dos commits locales reportados. El árbol de la rama local de doce juegos coincidía con la versión publicada. No se afirma haber recuperado esos commits originales.

La base disponible aprobó **167 pruebas**, no 170. Se recuperó únicamente el comportamiento necesario mediante dos regresiones nuevas:

- **Tiempos LAN:** el desfase estimado del reloj puede tener fracciones de milisegundo. Una finalización observada ahora se redondea a un entero no negativo; las pausas y plazos conservan su precisión. Python y JavaScript aceptan el estado y el servidor lo recupera después de reiniciar.
- **Puntos editados:** una corrección explícita de puntos en una ronda definitiva genera una revisión con motivo. Solo se aplica al confirmar; sustituye el lote activo, conserva el lote anulado y sobrevive a recarga. El motor respeta esa corrección en vez de descartarla al recalcular. Corregir después los resultados originales retira la excepción de puntos y vuelve al cálculo por reglas.

## Estado real

| Componente | Implementación y evidencia | Pendiente |
|---|---|---|
| Participantes y equipos | Fase 1 reutilizada; conservación de IDs, miembros y eventos | Ensayo físico en dispositivos |
| Doce minijuegos | Se reutilizan sus bancos, controles y motores; 12 rondas distintas consecutivas con 2, 3 y 4 equipos | Validación visual en navegador |
| Roba y Gana permanente/repetible | Disponible aunque se quite de la selección; repetición ordinaria conservada | Validación visual |
| Repetición por ventaja | Regla explícita, configurable, desactivada por defecto; anuncio previo y sorteo de una sola opción programada | Validación visual |
| Premios, robos y retos | Baraja de seis; elecciones únicas; revelación conjunta; clasificación previa congelada; retos confirmados; sin dobles lotes | Ensayo físico de conducción |
| Representantes antes de revelar | Opción global; excepciones `representativePolicy`; parejas de Rebote; juego y reloj ocultos antes de confirmar | Validación visual |
| Duelo de Generaciones | 48 preguntas privadas, generaciones, 10 puntos independientes, clasificado para siguiente juego, uso sin repetición | Validación visual |
| Premiación | Clasificación congelada, presentación por grupos de lugar, empates, animación TV, resumen y cierre formal | Verificar animación y legibilidad en TV real |
| Correcciones durante premiación | Retirada explícita con motivo, corrección auditable de una ronda y nueva ceremonia | Ensayo manual del procedimiento |
| Persistencia/LAN/privacidad | Recarga, reinicio, conflicto entre conductores, proyección Python/JS y rechazo de alteraciones | Prueba de red y pantallas reales |

Los recorridos de dominio y servidor están verificados. **El criterio de aceptación visual de una fiesta completa todavía no está certificado:** Chromium aborta antes de abrir las páginas por `socket() failed: Operation not permitted`. Las pruebas bloqueadas no se contabilizan como aprobadas.

## Roba y Gana: reglas y parámetros

La baraja sigue siendo exactamente **+100, +75, robar 50, robar 25, reto por 100 y reto por 50**. Se mezcla en cada aparición; cada equipo participante elige una tarjeta diferente. Las seis se revelan juntas al completar las elecciones. Los retos necesitan una decisión explícita del conductor, incluso si no se cumplieron.

Para las nuevas apariciones en eventos con cierre funcional:

1. Al revelar se congelan clasificación, saldos y movimientos que originaron esos saldos.
2. El líder roba al segundo equipo de esa clasificación. Los demás roban al mejor clasificado que no sea su propio equipo.
3. En empate se usa el orden estable de los equipos para elegir entre oponentes empatados. Un colíder puede robar al otro colíder; el desempate técnico no altera lugares ni premios.
4. Los premios de esa aparición no cambian las víctimas ni financian los robos. Cada víctima puede perder como máximo su saldo anterior a la revelación.
5. Si coinciden varios robos, se resuelven en el orden público de equipos. Nunca se crea un saldo negativo.
6. El conductor revisa y confirma un único lote de resultados. Los intentos anulados permanecen en el libro.

Estos criterios operativos quedan visibles/documentados; no se reescriben apariciones históricas que usaban captura manual de víctimas.

| Parámetro | Predeterminado | Rango permitido |
|---|---:|---|
| Repetición automática | Desactivada | Activar/desactivar |
| Ventaja sobre el siguiente equipo por puntuación | 200 puntos | 25–10000 |
| Rondas transcurridas desde la última aparición | 2 | 1–20 |
| Representantes antes de revelar | Desactivado | Activar/desactivar, con excepciones de ficha |

Cuando la repetición está activada, se evalúa **antes de girar** en preparación o siguiente ronda. Si se cumple ventaja y separación, se anuncia una ronda extra de Roba y Gana; la ruleta muestra esa única opción. No se sustituye el resultado de un giro ya iniciado. Después de Roba se vuelve a exigir la separación configurada. La regla y el resultado se auditan. Los importes y el número de tarjetas no son parámetros editables.

## Representantes y Duelo

La opción global se aplica al preparar cada nueva ronda. Una ficha puede indicar `representativePolicy: "before"`, `"after"` o `"global"`; no se cambian las revisiones de Biblioteca para aplicar la opción del evento. Rebote mantiene dos personas distintas por equipo, elegibles dentro de sus integrantes. Si faltan personas, el equipo puede optar por no participar con motivo; no se crean representantes ficticios.

Duelo es complementario y se juega antes de girar el siguiente minijuego:

- El conductor elige generación y presenta una pregunta no utilizada. La TV recibe la pregunta, nunca la respuesta ni el banco.
- Tras identificar quién acertó, confirma: se crea un movimiento independiente de **10 puntos** y queda reservado ese representante para el siguiente juego.
- Hay un clasificado por equipo para ese siguiente juego. No se sustituye silenciosamente por otra respuesta posterior.
- La selección ganada prevalece sobre la sugerencia de menor participación. Una sustitución o no participación requiere el motivo auditable ya existente.
- Pasar una pregunta también la consume. No se puede premiar dos veces un mismo intento ni girar con una pregunta pendiente.
- Las etiquetas generacionales organizan afinidades culturales; no afirman que cada pregunta o personaje se estrenó en esa década.

Los eventos nuevos creados desde la interfaz incluyen estas opciones. Para uno abierto de la versión anterior, usar **Activar opciones del concurso** en una etapa segura; conserva sus rondas y revisiones. Un evento terminado no se modifica.

## Premiación y corrección explícita

Al iniciar la premiación se congelan clasificación, movimientos y resumen de rondas. No se aceptan edición de puntos, nuevos turnos ni cambios de juegos desde esa fase.

El conductor presenta de menor a mayor clasificación, agrupando empates. Con 2 o 3 equipos no se inventan lugares adicionales. Si hay posiciones 1, 1, 3, se presentan los grupos 3 y 1, sin crear un segundo lugar. La pantalla TV tiene entrada animada de ganadores y respeta movimiento reducido.

Si se detecta un error: **Retirar ceremonia y corregir una ronda**, seleccionar ronda y motivo. Se conserva la ceremonia retirada; el conductor revisa/confirma la corrección mediante el libro de puntos y vuelve a iniciar la premiación. No se mantiene una clasificación definitiva obsoleta.

Después de presentar todos los grupos, **Cerrar formalmente el evento** guarda la fecha de cierre. Se mantienen clasificación, rondas, Duelo, ceremonias retiradas y movimientos. No se reabren ni sobrescriben eventos anteriores.

## Evidencia y limitaciones

- `npm test`: **188 pruebas aprobadas**: 154 Node y 34 Python. Incluye la base de doce juegos y 15 pruebas nuevas de cierre más seis de LAN.
- Regresiones: tiempo LAN fraccionario, puntos editados, doble confirmación, preguntas agotadas, selección por Duelo, excepción de ficha, repetición anunciada, clasificación anterior a premios, robos sin fondos, empates, correcciones de ceremonia y conservación histórica.
- `evidencia/cierre/traza-integral.json`: fases, 12 minijuegos distintos, lotes confirmados y clasificación final para 2, 3 y 4 equipos. **Es una ejecución automatizada con datos sintéticos aislados**, no resultados de una fiesta real ni evidencia visual.
- `npm run test:full-browser`: los 12 casos no llegan a abrir páginas por el bloqueo de Chromium.
- `npm run test:closure-browser`: el recorrido de Duelo, selección previa, pausa/recarga, corrección y ceremonia también queda bloqueado en el arranque de Chromium.
- No se tocaron sesiones reales para generar la evidencia. Las pruebas LAN usan carpetas y servidores temporales.
- La observación de aciertos, infracciones, retos y pruebas físicas sigue a cargo del conductor; no se inventan resultados ni se añade reconocimiento automático.
- Los límites existentes de almacenamiento del navegador y tamaño de sesión se conservan: un fallo de guardado cancela el cambio; no elimina eventos para hacer espacio.

Ver [PRUEBA_MANUAL_CIERRE.md](PRUEBA_MANUAL_CIERRE.md) para el ensayo pendiente en celular y televisión.
