# Ajustes de las pruebas manuales

Revisión del usuario: 18 de noviembre de 2026. Rama: `ajustes-pruebas-manuales`, basada en `cierre-funcional-concurso` (`dba63dd`). La copia local coincidía con lo publicado y no tenía cambios pendientes. Se conserva `main` y no se ha hecho merge.

## Resultado verificable

**203 pruebas aprobadas: 165 Node y 38 Python.** Se conservan los recorridos de los doce juegos, eventos con 2/3/4 equipos, Duelo, premiación, recuperación, correcciones y libro de puntos. Se añadieron once regresiones de la revisión manual y cuatro pruebas LAN.

La ejecución interactiva de navegador sigue **bloqueada**, no aprobada:

- Los cinco casos nuevos de `npm run test:manual-browser` abortan al iniciar Chromium por `socket() failed: Operation not permitted`.
- Se intentó un navegador remoto real como alternativa. No puede acceder al servidor de ensayo local: `net::ERR_CONNECTION_REFUSED`.
- No se presentan imágenes generadas, capturas antiguas ni HTML estático como evidencia de un ensayo visual actual. La geometría real, legibilidad, animaciones y comodidad en los dispositivos de destino quedan pendientes de aceptación.

## Fallas, causa y corrección

| Componente | Evidencia / causa | Corrección | Verificación real alcanzada |
|---|---|---|---|
| Palabras prohibidas en TV | El DTO excluía todas las tarjetas; solo el conductor recibía el contenido | Se proyecta objetivo y tres prohibidas de la tarjeta activa, únicamente durante su turno | Motor, DTO Python/JS, HTTP público y renderer aprobados; navegador bloqueado |
| Roles de Palabras prohibidas | La ficha decía que el representante describía | Representante de espaldas a TV y adivinando; el equipo da pistas sin decir objetivo ni prohibidas | Copia de presentación aprobada y nueva revisión de la ficha; datos históricos conservados |
| ¡Hazme el sonido! | La misma exclusión impedía mostrar el estímulo al equipo | Tarjeta activa pública; representante de espaldas y compañeros haciendo sonidos, sin palabras ni gestos | DTO/HTTP/render y controles probados; navegador bloqueado |
| Actor: finalizaciones | El conductor generaba artículos verticales, cada uno con tarjeta y botón después del contenido | Cuadrícula 2×2, botón antes de la tarjeta privada, barra fija con reloj y controles; al iniciar enfoca esa barra | Cuatro controles y reloj comprobados en el renderer; visibilidad medida a 1440×900 y 420×900 preparada, pero bloqueada |
| Corrección de tiempos | Campo numérico rotulado en milisegundos | Segundos o `mm:ss`, con decimales; conversión a milisegundos enteros dentro de la transacción | Parser y corrección real del motor aprobados; no se modifica la puntuación por posición |
| Ruleta TV pequeña | Tamaño de 28vh limitado a 330 px y etiquetas de 11 px | TV usa hasta 60% de la altura del escenario, limitada por ancho; etiquetas mayores y marcador compacto | Geometría matemática conservada; prueba de tamaño en navegador bloqueada |
| Lista tras selección | Mientras el conductor no confirmaba, la fase seguía siendo sorteo y mostraba la lista aun con la animación terminada | Desaparece al terminar el giro; se mantiene la ruleta detenida hasta confirmar | Renderer probado antes/después del giro |
| Instrucciones extensas | Se proyectaban materiales y preparación completos | Regla principal, pasos breves y duración/criterio; detalles completos en conductor | Separación de contenido aprobada en pruebas de render |
| Nombres en clasificación | Se imprimía el representante en cualquier etapa | Se omiten representantes en sorteo, selección, clasificación y premiación; se conservan en ejecución cuando aportan contexto | Renderer probado; no se borran ni filtran nombres del evento |
| Actualizaciones de puntos | No había diferencia visual destacada | Pulso sobre equipos cuyos puntos o lugar cambian; compara únicamente valores ya confirmados | Comparador probado sin mutación de datos; aspecto visual pendiente |
| Transiciones | La TV reconstruía la escena entera cada 200 ms durante el giro, reiniciando animaciones | Actualización de rotación/título sobre el DOM existente; transición solo al cambiar de etapa | Funciones y regresiones de ruleta aprobadas; fluidez visual pendiente |
| Premiación | Se conserva el flujo auditable ya implementado | Conserva ganadores, empates, movimiento reducido, resumen acumulado y corrección explícita | Regresión completa de cierre aprobada; presentación física pendiente |

## Estado por minijuego

En todos los casos la validación de navegador está pendiente por el bloqueo descrito; “aprobado” en esta tabla se refiere a dominio/servidor/contrato y render, no a una fiesta física ya realizada.

| Minijuego | Estado del motor y puntuación | Tarjeta en televisión / revisión |
|---|---|---|
| La galleta viajera | Regresión aprobada; 90 s y clasificación intactos | Sin respuesta privada que proyectar; conserva instrucciones breves |
| Picasso a oscuras | Rapidez y correcciones aprobadas | Consigna privada; prueba de exclusión de TV |
| Roba y Gana | Se conservan seis tarjetas, revelación conjunta, robos y retos | Premios públicos solo después de las elecciones; regresión aprobada |
| Tararea si puedes | 60 s y cambio previo de canción conservados | Canción privada; prueba de exclusión de TV |
| La torre traicionera | 90 s y estructura 3-2-1 conservados | Controles simultáneos agrupados; sin cambio del cálculo |
| ¡Hazme el sonido! | Correcto/pasar y clasificación por aciertos aprobados | **Tarjeta activa pública**; representante de espaldas |
| Rebote imposible | Dos representantes y tres rebotes conservados | Controles simultáneos agrupados; requisitos y clasificación intactos |
| Manos de mantequilla | 120 s, ejecución simultánea y rapidez conservados | Usa la misma cuadrícula y reloj; sin cambio del cálculo |
| El actor dramático | 90 s, tarjetas distintas y simultaneidad conservados; posiciones, cero al no completar y empates probados | **Tarjetas privadas**; cuatro finalizaciones agrupadas |
| Palabras prohibidas | Correcto/pasar/infracción, aciertos y clasificación aprobados; sin repetición entre equipos/rondas | **Objetivo y tres prohibidas públicos** solo durante el turno activo |
| ¡Yo soy el objeto! | Conteo y controles conservados | Objeto privado para quien actúa; prueba de exclusión de TV |
| ¿Cuántos hay? | Estimaciones, diferencia absoluta y empates conservados | Valor real y estimaciones privadas; resultados confirmados públicos |

## Límites de la publicación de tarjetas

La excepción pública se limita a los IDs `palabras-prohibidas` y `hazme-sonido`, con motor de conteo y un turno en ejecución. Se envía únicamente la tarjeta del equipo activo. No se envía el banco, el siguiente estímulo ni las tarjetas de otros equipos.

Al pausar, finalizar o preparar al siguiente equipo, la tarjeta pública se retira. Reanudar conserva la misma tarjeta. El agotamiento no inventa tarjetas ni repite las usadas. La TV aplica otra lista blanca y rechaza un campo de tarjeta pública inyectado en Actor, Tararea, Picasso u Objeto.

Las reglas visibles corregidas se aplican también a sesiones guardadas de esos dos juegos, sin reescribir sus resultados, tarjetas ni copias históricas. Las futuras reuniones reciben nuevas revisiones de las dos fichas; se conservan las revisiones anteriores de Biblioteca. No se reincorporan juegos descartados.

## Corrección de tiempos

| Entrada del conductor | Valor interno |
|---|---:|
| `12` | 12000 ms |
| `12.5` o `12,5` | 12500 ms |
| `01:12.500` | 72500 ms |
| `01:30` | 90000 ms |
| Vacío | No completó |

Se rechazan negativos, segundos fuera de rango en `mm:ss`, texto inválido y más de tres decimales. El motor mantiene el límite de duración del juego y recalcula los puestos con las mismas reglas. No se cambiaron cronómetros, empates, 100/75/50/25 puntos ni el cero por no completar.

## Qué se conserva

Participantes, IDs, equipos, ruleta y su selección guardada, confirmación de juego, representantes, tarjetas privadas, simultaneidad, relojes, registros, correcciones auditadas, Biblioteca, sesiones, sincronización, Duelo y ceremonia. No se borraron datos para acomodar los cambios. Escenario, decoración y paleta se conservan; la compactación del marcador solo corresponde al sorteo.

## Evidencia y ensayo pendiente

- `evidencia/ajustes-manuales/pruebas-aprobadas.txt`: salida de `npm test`, con 203 aprobadas.
- `evidencia/ajustes-manuales/regresiones-manuales.txt`: once casos específicos, incluido no repetir Palabras prohibidas al autorizar una nueva ronda y conservar revisiones/eventos.
- `evidencia/ajustes-manuales/navegador-bloqueado.txt`: cinco pruebas de navegador bloqueadas antes de abrir páginas. Ninguna se cuenta como aprobada.
- `evidencia/ajustes-manuales/contrato-publico.json`: muestras sintéticas del DTO, sin sesiones reales ni bancos privados completos.

Para el ensayo usar una carpeta de datos separada, como indica `PRUEBA_MANUAL_CIERRE.md`, y después seguir `PRUEBA_MANUAL_AJUSTES.md`. El criterio de cierre visual exige ejecutarlo en el celular y la TV de destino; no se declara cumplido por las pruebas automatizadas.
