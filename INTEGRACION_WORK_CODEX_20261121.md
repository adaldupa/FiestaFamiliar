# Integración Work + Codex · 21 de noviembre de 2026

**Estado: integrada y validada en computadora; lista para ensayo físico. Sin merge a main.**

Rama: `integracion/work-codex-20261121`. PR: https://github.com/adaldupa/FiestaFamiliar/pull/1. Las fuentes faltantes para Work sí existían en los worktrees de esta computadora. No había un bloqueo funcional impuesto al proyecto: faltaba publicar el trabajo local y la terminal no tenía credenciales para push. La conexión GitHub permite publicar el mismo contenido mediante objetos Git.

## Inventario y procedencia

| Fuente | Referencia encontrada | Resolución |
|---|---|---|
| main | `1fd201ef1b13d0054d2f6978e60a17abe99ee40f` | Sin cambios, sin merge ni auto-merge |
| Work: preparación y documentación | `5a7e71f3fcc1d31542fc9a471118249e3af12836` | Primer padre de la integración; informe original conservado como histórico |
| Work: mecánicas postensayo | `correcciones-turnos-postensayo` / `ce31f23` | Base común, turnos y revisiones conservados |
| Codex: validación y mejoras locales | `revision/mecanicas-20261121` / `561d3fd19903f34663fa03140bc45ac6402ea7f5` | Recuperado íntegro desde `work/prueba-mecanicas-20261121` |
| Publicación equivalente de Codex | `2b952415b1c0a94504d9ff2f055d4fca669ed481` | Mismo padre y árbol que 561d3fd; SHA diferente por metadatos del conector |
| Merge local original | `342f0b2` | Une 5a7e71f y 561d3fd sin reemplazar una fuente por otra |
| Pendientes locales de cierre | Siete archivos en `work/prueba-cierre-20261118` | Copia original intacta. Cambios compatibles ya incluidos; tres pruebas adicionales recuperadas |
| Otras revisiones locales | `8f70433`, `68443da`, `10b81c6` | Comparadas; correcciones compatibles presentes. No recuperar la antigua política de todas las pistas privadas |
| Ramas históricas remotas | fase2-motor-concurso, integracion-fase1-concurso, doce-minijuegos-completos, cierre-funcional-concurso, ajustes-pruebas-manuales, roba-configurable-ensayo | Conservadas; no se reescribieron |

El árbol original de Codex y su publicación equivalente es exactamente `6ee8c1c5481d6d163403517e2f0ed6f6222c3846`. Se adjunta `evidencia/integracion-work-codex/codex-561d3fd.patch` para conservar autoría y parche originales. La publicación de integración conserva como padres la preparación Work y la versión equivalente Codex; no se afirma que el conector publique los mismos metadatos o SHA locales.

## Matriz de integración

| Área | Work conservado | Codex conservado | Verificación |
|---|---|---|---|
| Doce juegos y catálogo editable | Motores y revisiones postensayo; no migrar rondas pasadas | Bancos locales y validación | Doce juegos diferentes en primeras doce rondas |
| Actor y Tararea | Turnos independientes de 90/60 s; cambio de canción antes de iniciar | Pruebas de reloj y recuperación | Cuatro turnos secuenciales; pausa y recarga |
| Sonidos / Palabras | Tarjeta activa pública, representante de espaldas | Saneador con excepción limitada | Aciertos, pasar e infracción cambian tarjeta; tres prohibidas visibles |
| Otras pistas | Privadas | Verificaciones JS/Python/TV | Actor, Tararea, dibujo, objeto y valor real no se publican |
| Roba y Gana | Seis cartas; clasificación previa; robos limitados al saldo; reto explícito; importes configurables | Tablero adaptado al escenario real y pruebas | Elección oculta, revelación conjunta, robo, reto cumplido/no cumplido y repetición autorizada |
| Puntuación | Revisión y confirmación auditada | Tabla configurable aplicada igual en JS y Python | 56 movimientos en 14 rondas; recargar no duplica puntos |
| Guardado LAN | Autenticación del conductor y DTO público | Controles bloqueados durante escritura | Conductor localhost y público por IP sincronizados; reinicio del servidor recupera ronda 5 |
| Sin conexión | Recursos, bancos y fuentes locales | Caché actual verificada, no reciclar recursos antiguos; rechazo de acceso no se convierte en sesión local | Regresión automatizada; ensayo previo real con servidor estático detenido documentado en VALIDACION_MECANICAS_20261121.txt |
| Diseño navideño | Identidad aprobada y recursos originales del proyecto | Ruleta, consola, contraste, premios compactos y tablero Roba | Archivos de aplicación idénticos a 561d3fd; capturas nuevas de escritorio, TV y viewport móvil |
| Premiación | Cuatro lugares y cierre voluntario | Presentación compacta | Orden 4,3,2,1; evento finalizado recuperado tras recargar |

## Conflictos resueltos

El merge solo produjo un conflicto textual en la cabecera de README: Work indicaba fuentes faltantes, Codex indicaba validación local. Se sustituyó por el estado integrado actual y se conservó el informe previo como `informe-work-inicial-historico.md`. No hubo conflictos en motores, estilos o bancos. Tres pruebas de cierre pendientes se añadieron sin eliminar pruebas existentes.

Se mantiene la última decisión expresa: Sonidos y Palabras muestran la tarjeta activa en TV; las demás pistas permanecen privadas. No se importó la política anterior de todas las pistas privadas. Los valores 100/75/50/25 son predeterminados configurables, no una decisión definitiva. Roba adicional requiere autorización de cada ronda.

## Validación repetida en la integración

- `npm test`: **254 aprobadas, 0 fallos: 207 Node + 47 Python**. Registro completo: `evidencia/integracion-work-codex/regresion-integrada.txt`. Incluye puntuación configurable, secretos, LAN, recuperación, concurrencia, cierres y los doce motores.
- Navegador real, interfaz de usuario: **14 rondas consecutivas**, 17 participantes ficticios distribuidos en equipos de 4,4,5,4 (capacidades 4,4,4,5). Semillas controladas para cubrir los doce juegos, no para medir la distribución estadística del azar. Los doce primeros IDs son distintos; rondas 13 y 14 de Roba autorizadas por separado. La animación y el nombre revelado coinciden con el juego de la ronda.
- Actor: pausa, recarga de conductor/TV y recuperación; Tararea: canción cambiada antes de empezar y reloj independiente; Sonidos/Palabras: avance de tarjetas y puntuación por aciertos; simultáneos: finalización individual; Rebote: tres aciertos por equipo y parejas; Objeto: aciertos por turno; Cuántos: valor privado 137 y estimaciones 130/140/137/160, sin valor real en TV.
- Roba: pausa con elecciones ya realizadas, parada/reinicio real del servidor, recarga y recuperación; resultado de reto explícito, premios/robos aplicados tras revisión. La ronda adicional no arranca sin marcar su autorización.
- Marcador final: Estrella **925**, Cascabel **900**, Aurora **850**, Abeto **425**. **56 movimientos**, todos de una única confirmación por equipo/ronda. Ceremonia 4→3→2→1 y cierre formal; mismos resultados tras recargar. Resumen sin claves ni tarjetas privadas: `recorrido-14-rondas.json`.
- TV: 1280×720 y marco interior 1034×900 con escenario 16:9, sin desbordamiento horizontal. Escritorio: vista de conductor. Móvil: iframe con viewport real interior **420×900**, sin desbordamiento; inicio, pausa, reanudación y registro de un turno; siguiente turno preparado a 90 segundos sin arrancar solo. Son pruebas de navegador, no un teléfono o TV físicos.
- Los logs `regresion.txt` (232 pruebas) y `navegadores.txt` (37 intentos bloqueados al iniciar Chromium) son evidencia histórica de Work. No son los resultados actuales ni fallos de esta ejecución CUA.

## Evidencia y aceptación pendiente

Capturas: `final-tv.png`, `final-conductor.png`, `final-tv-letterbox.png`, `roba-ocultas.png`, `roba-revelada.png`, `ruleta-integrada.png`, `movil-420-pausa.png` y `movil-420-siguiente-turno.png`, en `evidencia/integracion-work-codex/`. Los HTML de viewport son marcos reproducibles de prueba, no una segunda aplicación.

No se ha realizado una fiesta real ni una conexión física HDMI/celular. Quedan pendientes legibilidad a distancia, sonido en el equipo real, interacción táctil y conectividad Wi-Fi del lugar. Seguir [ENSAYO_HDMI_CELULAR.md](ENSAYO_HDMI_CELULAR.md), exportar el evento real antes y usar datos de ensayo separados. No se modificaron las sesiones históricas ni se incluyeron claves de control en Git.
