# Correcciones posteriores al ensayo del 20 de noviembre de 2026

Rama: `correcciones-turnos-postensayo`. Base: árbol publicado de `roba-configurable-ensayo`, commit remoto `2df2683efa4204b3491ea997cb82a7e05e0c414f`. Se revisaron referencias locales y remotas y se comprobó igualdad de contenido antes de crear la rama. No se fusiona con main.

## Correcciones

- **Actor dramático y Tararea:** la falla reproducida era `executionMode: simultaneous` y un cierre de turno que solo entendía conteos. Las nuevas revisiones usan turnos. Cada equipo recibe su tarjeta al preparar su turno; iniciar reinicia su reloj individual de 90/60 s; Registrar finalización conserva milisegundos y pasa al siguiente equipo sin arrancar su reloj. Finalizar sin acierto o agotar el tiempo registra no completar y cero. Las pausas excluyen el tiempo detenido. Los empates comparten puntos y saltan posiciones. Las canciones cambian únicamente antes de iniciar el turno propio. Una acción de otro equipo se rechaza.
- **Sonido y Palabras prohibidas:** se verificó el soporte público ya existente, sin reconstruirlo. Objetivo y tres prohibidas (cuando corresponde) atraviesan las proyecciones JS/Python y el saneador de TV solo durante el turno activo. Correcto/Pasar/Infracción consumen una tarjeta única; la infracción solo invalida esa tarjeta. Se aclara la prohibición de derivados evidentes. El representante adivina de espaldas; el equipo ve la TV y da pistas/sonidos. Los demás juegos conservan sus estímulos privados.
- **Roba y Gana:** nueva elección ordenada por clasificación descendente; empate: orden estable de equipos del evento. El dominio rechaza elecciones fuera de turno. TV muestra seis cartas ocultas, su número y el equipo propietario; los importes no salen en el DTO antes de revelar. Todas se revelan juntas, incluidas las no seleccionadas. Resultados agrupados por equipo y sección separada para cartas no elegidas. Los robos se resuelven automáticamente con la política ya existente y la clasificación previa a la revelación; los retos requieren seleccionar y guardar Cumplido o No cumplido. No hay selección de víctima adicional en la revisión nueva. Los puntos se calculan automáticamente y se aplican una sola vez mediante la revisión/confirmación normal del concurso.
- **Finalización:** se detecta que ya se jugó cada juego ordinario elegible al menos una vez, incluso si su ficha permite repetirlo. Se destaca Finalizar concurso/iniciar premiación y se exige autorizar una ronda adicional de Roba; el sorteo de esa ronda tiene una única opción anunciada. Una repetición ordinaria autorizada expresamente vuelve a habilitar su juego. No se retira su regla de repetición ni se inicia nada automáticamente. La política de ventaja de Roba se conserva.
- **Conductor:** reloj/acciones en franja fija para turnos individuales, resumen compacto de los cuatro equipos, representante identificado y etiquetas de etapa en español. Solo se muestra un control de finalización para el equipo activo; no cuatro finalizaciones simultáneas que contradigan la dinámica corregida.

Los seis premios predeterminados siguen en 100, 75, robar 50, robar 25, reto 100 y reto 50. Los parámetros configurables aprobados anteriormente no se borran ni se cambian silenciosamente; cada aparición conserva su configuración congelada. Para ensayar los valores predeterminados, restaurarlos explícitamente antes de una nueva aparición. Los límites y la excepción de repetición ya probados se conservan.

## Datos y compatibilidad

`manual-rules.js` transforma una copia del catálogo para instalar **nuevas revisiones** a través de Biblioteca. El archivo original, los bancos y las revisiones anteriores permanecen. La instalación es idempotente. Crear un evento nuevo utiliza las revisiones vigentes.

Un evento ya abierto no se migra silenciosamente: al terminar la ronda y pasar a Siguiente ronda, aparece **Aplicar correcciones a futuras rondas**. Ese control usa la selección versionada existente y registra la actualización. Las rondas ya creadas conservan modalidad, tarjetas, resultados, movimientos y regla original; una ronda simultánea histórica no se convierte a mitad de ejecución. No se borraron participantes, equipos, sesiones, datos ni revisiones.

Las pruebas históricas de Actor simultáneo se conservan para garantizar lectura de sesiones antiguas. Las pruebas nuevas usan explícitamente las nuevas revisiones. Se ampliaron dos listas de dependencias públicas para incluir únicamente `reward-show.js`, que es presentación y no lee estado privado.

## Auditoría de los doce juegos

Estado indicado: **operativo bajo pruebas automatizadas**. El ensayo físico permanece pendiente para los doce, y la revisión visual real está bloqueada.

| Minijuego | Modalidad y reloj | Tarjeta / quién adivina | Victoria / puntos | Estado |
|---|---|---|---|---|
| La galleta viajera | Simultáneo, 90 s | Sin tarjeta | Posición por finalización | Conservado; regresión aprobada |
| Picasso a oscuras | Simultáneo, 90 s | Consigna privada al dibujante; equipo adivina | Menor tiempo válido | Conservado; regresión aprobada |
| Roba y Gana | Elección secuencial, revelación conjunta; sin límite obligatorio | Seis ocultas hasta completar elecciones | Premios/robos; retos confirmados | Corregido; pruebas de dueños, orden, revelación y confirmación |
| Tararea si puedes | Turnos independientes, 60 s | Canción privada al representante; equipo adivina | Menor tiempo válido | Corregido; pausa, cambio previo, empate, no completar y corrección probados |
| La torre traicionera | Simultáneo, 90 s | Sin tarjeta; seis vasos 3-2-1 | Posición de finalización | Conservado; regresión aprobada |
| ¡Hazme el sonido! | Turnos, 60 s | Objetivo público; representante de espaldas adivina | Más aciertos válidos | Proyección pública y consumo sin repetición comprobados |
| Rebote imposible | Simultáneo, sin límite obligatorio | Dos representantes; tres rebotes válidos | Orden al llegar a tres aciertos | Conservado; regresión aprobada |
| Manos de mantequilla | Simultáneo, 120 s | Sin tarjeta | Posición de finalización | Conservado; regresión aprobada |
| El actor dramático | Turnos independientes, 90 s | Personaje/acción/lugar privados; equipo adivina | Menor tiempo de combinación completa | Corregido; turnos, reloj, privacidad, empate y cero probados |
| Palabras prohibidas | Turnos, 60 s | Objetivo y tres prohibidas públicos; representante de espaldas | Más aciertos válidos | Proyección, infracción por tarjeta y consumo sin repetición comprobados |
| ¡Yo soy el objeto! | Turnos, 90 s | Objeto privado al representante; equipo adivina | Más aciertos válidos | Conservado según ficha vigente; no se cambió privacidad sin instrucción explícita |
| ¿Cuántos hay? | Estimaciones por equipo, sin límite obligatorio | Valor real privado; equipos estiman | Menor diferencia absoluta | Conservado; el aviso de fin no confunde repetible con ordinario sin jugar |

Los motores de clasificación mantienen 100/75/50/25, empates con saltos de rango y cero cuando no se completa. Se conservaron los bancos y la exclusión de tarjetas usadas en el evento. La verificación automatizada de recarga cubre las rondas corregidas; no demuestra que una persona pueda completar físicamente un reto.

## Evidencia, fallos y límites

**Suite completa: 232 pruebas aprobadas, cero fallos finales (187 Node + 45 Python).** Registro: `evidencia/postensayo/regresion-completa.txt`. Incluye las pruebas anteriores y las nuevas, sin eliminación de casos. Las nuevas pruebas integrales ejecutan catorce rondas con 2, 3 y 4 equipos, revisión de puntos tras cada ronda y premiación/cierre. `flujo-14-rondas.json` registra sus resultados de fixture y movimientos: no es una fiesta real ni una simulación de un motor pendiente.

Durante el desarrollo, las tres pruebas integrales detectaron que ¿Cuántos hay? seguía elegible como repetible e impedía el aviso; se corrigió la detección sin retirar su repetición. Otra primera ejecución falló por un error del nuevo test HTTP que serializaba bytes sin decodificarlos; se corrigió el test. El registro inicial está separado del definitivo.

**Navegador:** cinco casos nuevos intentados; bloqueados en el arranque de Chromium por `socket() failed: Operation not permitted`. Ninguno alcanzó la aplicación. El registro está en `evidencia/postensayo/navegador.txt`. No hay capturas reales de conductor/TV ni una revisión visual certificada. Las páginas HTML del mismo directorio proceden de los renderizadores reales con datos sintéticos y sirven para inspección reproducible; están rotuladas y no se presentan como capturas ni como pruebas de navegador aprobadas.

Pendientes reales: comprobar legibilidad de las seis cartas, disposición de reloj/acciones en celular, proyección a distancia, ausencia de superposiciones, fluidez de transiciones y conexión/recuperación por Wi-Fi físico. No se certifica el criterio físico de cierre todavía.

## Archivos y prueba de esta versión

Dominio: `src/manual-rules.js`, `src/full-engines.js`, `src/contest-core.js`, `full_engines.py`, `concurso_publico.py`. Interfaz: `src/conductor.js`, `src/full-host.js`, `src/contest-host.js`, `src/contest-show.js`, `src/reward-show.js`, `src/presentation-copy.js`, `presentation_copy.py`, `contest.css`. Caché: `service-worker.js`, `src/offline-host.js`. Pruebas y evidencia: `tests/postensayo*`, `tests/test_postensayo_lan.py`, listas públicas en `tests/core.test.js` y `tests/teams.test.js`, `package.json`, `evidencia/postensayo/`. Documentación: este informe, README y guía de ensayo.

1. Descargar la rama `correcciones-turnos-postensayo`, conservar carpeta de datos real y exportar respaldo antes de operar.
2. Para ensayo aislado: `python3 servidor_local.py --host 0.0.0.0 --port 8081 --data-dir ../fiesta-ensayo-postensayo`. En Windows puede utilizarse `py`.
3. En computadora: `http://127.0.0.1:8081/index.html`. Obtener ahí el código privado. En celular: `http://IP_DE_LA_COMPUTADORA:8081/index.html`, con código. En TV: `http://IP_DE_LA_COMPUTADORA:8081/publico.html`, sin código. Misma red, sin aislamiento de clientes; mantener servidor abierto.
4. Crear un evento nuevo o, entre rondas de uno existente, usar Aplicar correcciones a futuras rondas. No iniciar una nueva sesión sobre una histórica para obtener la corrección.
5. Actor/Tararea: comprobar un solo equipo activo, tarjeta privada, reloj individual y avance sin inicio automático. Sonido/Palabras: representante de espaldas, tarjetas en TV y acciones sincronizadas. Roba: comprobar seis ocultas y propietarios, elección en orden, revelación conjunta y retos explícitos.
6. Después de los doce juegos, comprobar aviso y cierre o dos rondas adicionales autorizadas; finalizar premiación. Pausar, desconectar/reconectar Wi-Fi y recargar; reiniciar el servidor con la misma carpeta. Verificar mismas cartas/puntos y ausencia de duplicados.
7. Automatizadas: `npm test`. Navegador: `npm run test:postensayo-browser` (requiere Chromium funcional). Para HTML y traza reproducibles: `node tests/postensayo-evidence.js`.

La guía LAN previa conserva las instrucciones de IP y recuperación. Su sección antigua de Actor simultáneo queda sustituida por este informe y la guía vigente de ensayo.
