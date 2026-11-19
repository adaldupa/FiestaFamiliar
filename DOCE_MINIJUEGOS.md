# Los doce minijuegos definitivos

Rama: `doce-minijuegos-completos`, basada en `integracion-fase1-concurso` (`500cbe3`). No se modificó ni se fusionó `main`.

## Estado real

Los doce juegos tienen recorrido de dominio completo, controles privados, proyección pública y validación LAN. **La validación visual interactiva sigue pendiente**: Chromium no inicia en este entorno (`socket() failed: Operation not permitted`). Por ello no se declara ninguno completamente validado en navegador, celular o televisor físico.

| Minijuego | Implementación y prueba de principio a fin | Estado de validación |
|---|---|---|
| La galleta viajera | 90 s simultáneos; finalización, tiempos, empate, no completó y puntos por posición | Dominio/LAN aprobado; navegador pendiente |
| Picasso a oscuras | 90 s simultáneos; consigna privada distinta, adivinanza validada por conductor, rapidez | Dominio/LAN aprobado; navegador pendiente |
| Roba y Gana | Seis tarjetas mezcladas, elección única, revelación conjunta, premios, robos limitados al saldo, retos confirmados | Dominio/LAN aprobado; navegador pendiente |
| Tararea si puedes | 60 s simultáneos; canción privada, cambio antes de iniciar, rapidez al adivinar | Dominio/LAN aprobado; navegador pendiente |
| La torre traicionera | 90 s simultáneos; pirámide de seis vasos 3-2-1, validación y rapidez | Dominio/LAN aprobado; navegador pendiente |
| ¡Hazme el sonido! | Turnos de 60 s; tarjeta privada, correcto/pasar, clasificación por aciertos | Dominio/LAN aprobado; navegador pendiente |
| Rebote imposible | Dos representantes distintos por equipo; simultáneo, tres rebotes válidos para terminar; tiempo transcurrido sin corte automático | Dominio/LAN aprobado; navegador pendiente |
| Manos de mantequilla | 120 s simultáneos; envoltura con guantes, validación y tiempos | Dominio/LAN aprobado; navegador pendiente |
| El actor dramático | 90 s simultáneos; personaje + acción + lugar privados; rapidez de adivinanza | Dominio/LAN aprobado; navegador pendiente |
| Palabras prohibidas | Turnos de 60 s; tres prohibidas por tarjeta; infracción actual o anulación posterior de un acierto, sin borrar otros | Dominio/LAN aprobado; navegador pendiente |
| ¡Yo soy el objeto! | Turnos de 90 s; objetos privados, aciertos/pases y clasificación | Dominio/LAN aprobado; navegador pendiente |
| ¿Cuántos hay? | Valor real privado, estimaciones, diferencias absolutas y empates; sin límite obligatorio inventado | Dominio/LAN aprobado; navegador pendiente |

## Uso

1. Arrancar con `python3 servidor_local.py` para conductor y TV en la misma Wi-Fi. Para uso en una computadora, también está disponible `npm start`.
2. Abrir `index.html`. El conductor instala las fichas definitivas como revisiones nuevas; no cambia las instantáneas de eventos abiertos o terminados. Los eventos antiguos continúan con sus motores/reglas anteriores.
3. Confirmar participantes y equipos. Crear una **reunión nueva** desde Inicio; las doce revisiones definitivas están seleccionadas por defecto. Los campos antiguos de segundos/puntos no sustituyen las reglas definitivas.
4. Girar, revelar, presentar instrucciones y confirmar representantes. Rebote requiere guardar además el segundo representante; no se inventan integrantes si un equipo tiene menos de dos personas.
5. Preparar. El conductor comunica cada tarjeta privada solo a su representante, sin proyectarla. Para estimación registra el valor real. En Roba y Gana puede editar ambos retos antes de iniciar.
6. Iniciar, pausar y reanudar según corresponda. En juegos simultáneos los botones de todos los equipos permanecen disponibles; no se fuerza un orden de turnos.
7. Finalizar, revisar y confirmar la puntuación. El marcador se actualiza únicamente en la confirmación. Después, Siguiente ronda.

La TV solo consume el DTO público: instrucciones, reloj, equipos, progreso permitido y resultados confirmados. Los premios de Roba y Gana pasan a ser públicos todos juntos tras las elecciones. Nunca se envían bancos, tarjetas de adivinanza, prohibidas, canciones, estimaciones privadas ni valor real.

## Bancos privados utilizables

| Banco | Cantidad |
|---|---:|
| Sonidos | 300: 100 lugares, 100 cosas, 100 acciones |
| Palabras prohibidas | 300 objetivos distintos con tres prohibidas cada uno |
| Actuación | 100 combinaciones de personaje, acción y lugar |
| Objetos | 207 |
| Canciones | 110 títulos e intérpretes en español, de varias generaciones; sin letras |
| Dibujos | 60 consignas cotidianas |

Fuentes del proyecto: `scripts/build-approved.py`, `catalogo/bancos-definitivos.json` y `catalogo/catalogo-definitivo.json`. No hay respuestas de partidas simuladas. Las tarjetas se mezclan por semilla y se consumen al mostrarse, incluso si se pasan o se cambia una canción. No se repiten en otra ronda del mismo evento. Un banco agotado permite terminar el turno y rechaza aciertos inexistentes; una nueva preparación se bloquea si faltan tarjetas para los participantes.

## Puntuación y decisiones explícitas

- Posición y rapidez: tiempo efectivo sin pausas; menos tiempo es mejor. Conteo: más aciertos válidos es mejor. Cercanía: menor diferencia absoluta es mejor.
- Puntos por puesto: 100, 75, 50, 25. Empates comparten puesto y saltan rangos: 1, 1, 3. No completar, no participar o cero aciertos da cero puntos.
- Los botones de finalización registran el tiempo efectivo. Para registrar un empate confirmado o corregir la observación se puede introducir el mismo tiempo en milisegundos, con motivo. Se recalculan todos los puestos.
- Tararea y Actor usan rapidez de adivinanza entre equipos simultáneos. Los tres juegos de conteo son Sonidos, Palabras prohibidas y Objeto.
- Rebote, Roba y Gana y Cercanía no tienen un límite de tiempo aprobado; muestran tiempo transcurrido sin finalizar automáticamente.
- Roba y Gana mezcla exactamente +100, +75, robar 50, robar 25, reto por 100 y reto por 50 en cada aparición. Cada equipo elige una tarjeta distinta; las no elegidas también se revelan.
- Para resolver robos de forma reproducible se aplican primero premios y retos cumplidos; después los robos en el orden público de equipos. Se transfiere como máximo el saldo disponible. Robar a uno mismo está bloqueado. No se descuenta del saldo un reto fallado.
- Los retos tienen consignas concretas editables antes de iniciar y requieren una decisión explícita del conductor. La aplicación no presume que se cumplieron.
- Antes de confirmar se corrigen resultados originales (tiempos, aciertos, estimaciones, víctima o reto). Después de confirmar se deshace con motivo, se corrige y se confirma de nuevo. El libro conserva los movimientos anulados y solo un lote activo.

## Pruebas y bloqueos

`npm test`: **167 pruebas aprobadas** (139 Node y 28 Python). Incluye los casos anteriores de equipos/concurso/biblioteca y 26 casos nuevos de motores definitivos más cuatro de LAN.

Cobertura nueva: cada uno de los doce juegos hasta la confirmación; eventos de doce juegos con 2, 3 y 4 equipos; pausas, tiempos, empates, no completó, infracciones actuales y posteriores, pases, bancos agotados, cambio de canción, robos sin saldo negativo, retos pendientes, correcciones auditables, confirmación única, persistencia, reinicio del servidor y conflicto entre conductores. Se compara la proyección Python/JavaScript de todos los juegos y se prueban los renderizadores con el DTO filtrado.

`npm run test:full-browser`: 12 casos preparados y ejecutados, **bloqueados en el arranque de Chromium antes de interactuar con las páginas**. No son doce fallas de reglas del juego; tampoco se cuentan como aprobados. Registro completo en `evidencia/doce-minijuegos/navegador-bloqueado.txt`.

Limitaciones pendientes:

- Ejecutar esa suite en una máquina que permita Chromium y hacer ensayo real de conductor/celular/TV en Wi-Fi. No hay evidencia visual nueva certificada en esta entrega.
- La corrección de un reto físico o una adivinanza depende de la observación del conductor. No hay reconocimiento automático de voz, dibujo, envoltura ni rebotes.
- En simultáneos el conductor debe entregar o comunicar las tarjetas privadamente a cada representante. No se agregaron dispositivos individuales ni cuentas para jugadores.
- El almacenamiento del navegador y el servidor conservan sus límites existentes; una falta de espacio o el límite de 10 MB de importación/LAN bloquea el guardado en lugar de borrar eventos. Exportar respaldos antes de acumular muchas reuniones.
- La ceremonia final de premiación no forma parte de los doce motores. Los premios de Roba y Gana sí están implementados.

El siguiente paso verificable es la suite de navegador y el ensayo físico. Ningún merge a main está autorizado por esta entrega.
