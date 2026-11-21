> Preparación Work + Codex: **bloqueada por fuentes faltantes, no lista para aceptación**. [Inventario, diferencias y pruebas](INTEGRACION_WORK_CODEX_20261121.md) · [ensayo HDMI y celular](ENSAYO_HDMI_CELULAR.md). Rama `integracion/work-codex-20261121`; sin merge a main.

> Correcciones vigentes del ensayo: rama `correcciones-turnos-postensayo` · [turnos, tarjetas, Roba y cierre](CORRECCIONES_POSTENSAYO.md). Actor y Tararea usan turnos independientes en nuevas revisiones. Eventos abiertos: aplicar correcciones a futuras rondas, entre rondas. Las notas siguientes son históricas.

> Revisión vigente: `roba-configurable-ensayo` · [estado, 219 pruebas y bloqueos](ROBA_CONFIGURABLE_ENSAYO.md) · [ensayo físico en celular y TV](ENSAYO_FISICO_DISPOSITIVOS.md). Las notas siguientes conservan el historial de fases anteriores. Sin merge a main.

> Revisión manual actual en `ajustes-pruebas-manuales`: [estado por juego y evidencias](AJUSTES_PRUEBAS_MANUALES.md) · [ensayo pendiente en celular y TV](PRUEBA_MANUAL_AJUSTES.md). Las tarjetas de Palabras prohibidas y Hazme el sonido son públicas para el equipo; los demás estímulos privados se conservan.

> Estado actual de la rama `cierre-funcional-concurso`: [cierre, pruebas y limitaciones](CIERRE_CONCURSO.md) · [ensayo desde celular y TV](PRUEBA_MANUAL_CIERRE.md). Las secciones de fases anteriores conservan el contexto histórico. No se ha hecho merge a main.

# La Gran Noche de Retos — Fase 2C.1

Versión `2.4.0-fase2c1`, rama `fase2-motor-concurso`. Ruleta conectada con la Biblioteca existente, siete etapas de ronda, pantallas independientes de TV y recuperación local/LAN. No requiere volver a importar fichas. No fusionado a main.

- [Demostración paso a paso](GUIA_CONCURSO.md)
- [Pruebas, evidencia y límites de 2C.1](VERIFICACION_FASE2C1.md)
- [Plan y alcance](PLAN_FASE2C1.md)

Los motores de posición, conteo, cercanía y premios directos están registrados como **Motor pendiente de integración**: pueden seleccionarse y presentarse, pero no permiten registrar puntos ni simulan un cronómetro operativo. Los motores anteriores de puntos fijos y captura manual siguen disponibles mediante sus revisiones compatibles.

## Biblioteca reutilizable · entrega 2B

El administrador de **Biblioteca** ya es funcional. Permite cargar las doce fichas del documento acordado mediante vista previa y confirmación, sin modificar eventos anteriores. No se elimina ninguna revisión. Las fichas nuevas por tiempo, conteos, cercanía y robos están catalogadas y señaladas como dinámicas pendientes de 2C.

El actor original de 2A sigue ejecutándose mediante su revisión compatible. Los juegos genéricos de turnos con puntos fijos o captura manual se pueden crear sin programar y seleccionar al crear una reunión. Las colecciones guardan versiones concretas.

- [Guía de Biblioteca](GUIA_BIBLIOTECA.md)
- [Verificación y evidencia de 2B](VERIFICACION_FASE2B.md)

La carga de doce fichas no incluye todavía sus nuevos motores ni los bancos completos de tarjetas. La infraestructura 2C.1 se describe arriba. Los motores específicos y 2D siguen pendientes; main permanece separado hasta aprobación.

## Navegación del conductor

El panel muestra una sola sección principal a la vez. Menú lateral en computadora y menú compacto de seis botones en celular. La franja superior conserva el evento activo, la etapa y la ronda. La navegación es local a cada dispositivo; no cambia el estado público de la TV ni genera escrituras de la partida.

| Sección | Uso |
| --- | --- |
| Inicio | Nueva reunión, continuar evento abierto, consultar reuniones guardadas, abrir TV, opciones de presentación, Wi-Fi y respaldo completo. |
| Participantes | Registro, edición e importación/exportación de personas. |
| Equipos | Tres pasos internos: configurar; bombos y sorteo; revisar y confirmar. |
| Concurso | Ronda completa: sorteo, representantes, reglas, tarjeta privada, reloj, captura, revisión y confirmación. |
| Biblioteca | Crear, editar, duplicar, estados, archivo, importación/exportación, revisiones y colecciones. |
| Resultados | Marcador, clasificación e historial de eventos/equipos. Premiación pendiente de 2D. |

Cambiar de sección conserva los campos sin enviar mientras no haya otra operación que vuelva a dibujar el panel. Los datos guardados y el plazo del reloj sobreviven también a la recarga. Las tarjetas privadas se pliegan al salir de Concurso. La sección y el paso elegidos se recuperan por pestaña mediante sessionStorage, fuera del respaldo de la partida. Seleccionar una reunión histórica abre sus resultados, sin reactivarla ni cambiar el evento que está en marcha.

Prueba de navegación real: `npm run test:navigation` (requiere Playwright). Instalación de herramientas de prueba opcionales: `npm install --no-save --package-lock=false playwright@1.62.1` y `npx playwright install chromium`. Si utilizas un Chromium propio, configura `CHROMIUM_PATH`. El comando crea servidores y datos ficticios aislados; genera capturas en `evidencia/navegacion/`. `npm test` conserva las suites anteriores y añade pruebas de navegación, biblioteca y validación LAN sin dependencias. La suite visual de Biblioteca se ejecuta con `npm run test:library`, usando el mismo Playwright opcional. Consulta [VERIFICACION_NAVEGACION.md](VERIFICACION_NAVEGACION.md).

## Demostración aislada de fase 2A

Desde esta carpeta, con Python 3:

```sh
python3 servidor_local.py --port 8092 --data-dir .datos-locales-demo-fase2
```

Abre `http://127.0.0.1:8092/index.html`. Importa `evidencia/sesion-demo-exportada.json` (17 personas ficticias y equipos confirmados), confirma la restauración desde **Inicio → Importar sesión**. En **Inicio → Nueva reunión** crea el evento; el panel abrirá **Concurso**. Sigue [GUIA_CONDUCTOR.md](GUIA_CONDUCTOR.md): aceptar la propuesta al crear el evento, sortear actor, representantes, reglas, turnos, reloj, revisión y confirmación. Con un acierto se proponen 100 puntos. Puedes deshacer/corregir con motivo y comprobar el historial. En la TV abre el enlace público que imprime la terminal. El puerto y la carpeta separados conservan tu partida estable.

Para obtener esta entrega desde GitHub:

```sh
git clone --branch fase2-motor-concurso https://github.com/adaldupa/FiestaFamiliar.git
cd FiestaFamiliar
python3 servidor_local.py --port 8092 --data-dir .datos-locales-demo-fase2
```

El catálogo v1 y sus datos siguen intactos. El modelo versionado nuevo guarda copias por evento y ronda. Se evita repetir un juego completado salvo autorización explícita con motivo. La modalidad antes/después protege la identidad del reto hasta confirmar representantes cuando así se configura. Los puntos y desempates son propuestas configurables; no se presentan como decisiones definitivas.

Ver [PLAN_FASE2.md](PLAN_FASE2.md), [MODELO_MINIJUEGOS.md](MODELO_MINIJUEGOS.md), [VERIFICACION_FASE2.md](VERIFICACION_FASE2.md) y [PENDIENTES_FASE2.md](PENDIENTES_FASE2.md). El alcance completo solicitado se conserva en [ESPECIFICACION_FASE2.md](ESPECIFICACION_FASE2.md); las fases posteriores no se declaran implementadas.

## Celular como conductor y TV sincronizada — misma Wi-Fi

GitHub guarda el código. La sincronización de la partida se realiza **en tu computadora**, sin Internet. Descarga o clona el repositorio y abre una terminal dentro de la carpeta del proyecto:

```sh
python3 servidor_local.py
```

En Windows: `py servidor_local.py`. También se incluyen `INICIAR_WIFI.sh` y `INICIAR_WIFI.bat`.

1. Si tenías abierto el servidor anterior (`python3 -m http.server`), detenlo con Ctrl+C para liberar el puerto 8080. No borres los datos del navegador.
2. Abre primero `http://127.0.0.1:8080/index.html` en la computadora, con el mismo perfil de antes. En el primer inicio toma la sesión local existente; después manda la sesión compartida guardada en la computadora. Si ves la versión anterior, recarga una segunda vez tras unos segundos para activar la nueva caché.
3. En el bloque **CELULAR + TV · MISMA WI-FI** verás el enlace del celular y un código privado. Abre ese enlace en el celular o escribe la dirección indicada en la terminal y luego introduce el código. `127.0.0.1` en el celular apunta al propio teléfono: usa la IP local de la computadora que aparece en el enlace.
4. En la computadora conectada a la TV abre `publico.html` y llévala a la segunda pantalla. Una TV con navegador también puede abrir el enlace público de la terminal. La TV no necesita el código.
5. Registra, sortea y confirma desde el celular. Los demás conductores y la TV reciben cambios por la red local, normalmente en alrededor de un segundo. Los guardados usan revisiones: si dos conductores guardan sobre la misma versión, uno recibe un conflicto y recupera la sesión actual en vez de sobrescribirla.

La computadora y la terminal deben permanecer encendidas; todos los equipos deben estar en la misma red. No se necesita salida a Internet. Una red de invitados con aislamiento puede impedir la comunicación. Permite la aplicación en la **red privada** si el sistema pide acceso de red; no abras puertos del router ni publiques este servidor en Internet. Si hay varias interfaces, puedes indicar la IP que se mostrará: `python3 servidor_local.py --ip 192.168.1.50` (ejemplo; usa la de tu computadora).

La sesión compartida y el código se conservan en `.datos-locales/`, con archivos privados y exclusión en `.gitignore`. No se suben a GitHub. El código autoriza a ver edades y controlar la partida: compártelo solo con quien conduzca. La ruta pública se genera por una lista blanca independiente y no devuelve edades, métricas, pistas ni auditoría; las rutas privadas exigen el código. La conexión es HTTP dentro de tu Wi-Fi de confianza. Para renovar el código, detén el servidor, elimina solo `.datos-locales/control.key` y vuelve a iniciarlo; la sesión se conserva, pero los celulares deben introducir el nuevo código.

El teléfono por HTTP de red local puede no disponer de Service Worker; eso no impide jugar sin Internet mientras siga conectado al servidor. Si se pierde la Wi-Fi, las escrituras compartidas se rechazan y no se crean partidas paralelas silenciosamente. Puedes trasladarte explícitamente al modo individual con el servidor estático de abajo en otro puerto. Si un origen ya usado como conductor Wi-Fi pierde el servidor, queda en solo lectura al recargar para evitar partidas paralelas silenciosas. Exporta la sesión compartida e impórtala en el modo individual si quieres continuar con sus últimos cambios.

## Ejecutar sin Internet

Necesitas Python 3 instalado. Abre una terminal **dentro de esta carpeta** y ejecuta:

```sh
python3 -m http.server 8093 --bind 127.0.0.1
```

En Windows puedes usar `py -m http.server 8093 --bind 127.0.0.1`. Abre `http://127.0.0.1:8093/index.html`. El servidor solo entrega archivos locales; no es un backend y no necesita Internet. No abras los HTML con `file://`, porque los módulos y la caché requieren un origen HTTP local.

Espera a que el conductor muestre **Listo sin conexión** y abre una vez `publico.html`. La caché pública no descarga tarjetas ni módulos privados; el conductor prepara su caché privada por separado. Los recursos se guardan en una caché del navegador. Después de prepararla, ambas vistas se pueden recargar aun con el servidor apagado; para instalar o actualizar la aplicación vuelve a ejecutar el servidor. Si el navegador no admite Service Worker o no permite almacenamiento, conserva el servidor local encendido. Todos los gráficos, fuentes y sonidos son locales; el sonido se sintetiza en el dispositivo.

## Flujo de uso

1. **Concursantes.** Añade nombre y edad entera de 1 a 110. En «Ver y editar lista» puedes corregir una fila y pulsar Guardar, o eliminarla con advertencia. Los ID y la fecha de alta se conservan al editar. Los homónimos se permiten y se advierten. No existe un límite fijo de 17.
2. **Equipos.** Selecciona explícitamente 2, 3 o 4; al comenzar ninguno está seleccionado. Los nombres se generan al elegir cantidad y después se pueden editar.
3. **Bombos y sorteo.** Revisa rangos y personas por bombo. Introduce una semilla o usa «Nuevo sorteo · otra semilla». No se permite sortear si faltan edades o hay menos personas que equipos.
4. **Revisión.** Comprueba cupos, edades, medias, extremos y representación por bombo. Puedes intercambiar dos personas de equipos distintos: se conservan los cupos y se registran fecha, IDs, origen y distribuciones anterior/posterior. Las métricas se recalculan.
5. **Confirmación.** «Confirmar y bloquear equipos» bloquea edición y sorteos. «Volver a editar…» exige advertencia. Cambiar concursantes, edades o cantidad invalida el resultado y exige un nuevo sorteo; la TV vuelve a bienvenida. Renombrar equipos conserva la distribución.

Se guarda al aplicar cada cambio, no mientras hay texto sin enviar en un formulario. Exporta la sesión antes de un evento. La copia privada incluye edades y auditoría; no la proyectes. Importar reemplaza datos después de una advertencia y valida la integridad. Importar una sesión es una restauración explícita y puede sustituir una confirmación anterior.

## Proyectar en TV 16:9

Usa **escritorio extendido** por HDMI. Mantén `index.html` en la pantalla del conductor y pulsa «Abrir pantalla pública» para llevar `publico.html` a la TV. En ella pulsa «Pantalla completa». No dupliques el escritorio privado. Se adapta a 16:9 con bandas cuando la pantalla tiene otra proporción.

En el conductor puedes mostrar bienvenida o equipos, reducir movimiento y permitir sonido. En la TV se necesita un clic adicional para activar audio, por las reglas del navegador. El audio comienza desactivado. También se respeta la preferencia del sistema de reducir movimiento. Los nombres se muestran en páginas de hasta seis por equipo; usa el botón de página del conductor cuando haya más. No se oculta ningún concursante por truncamiento de la lista. Los controles tienen etiquetas, foco visible y tamaño mínimo de 48 px. Se puede participar sentado: esta fase no requiere movimiento físico.

La TV recibe exclusivamente nombres, equipos, cantidades, estado de confirmación, reglas públicas, materiales, criterios, reloj, geometría de sorteo y puntos confirmados. No recibe edades individuales, bombos, promedios, fecha de alta, auditoría, catálogo ni pistas secretas. Es una separación de presentación dentro de una aplicación local, no una barrera de autenticación: quien tiene acceso al perfil del navegador puede abrir el conductor.

## Sincronización y conservación de datos

**En modo individual**, las vistas se sincronizan por `BroadcastChannel` y eventos `storage`, con recuperación desde `localStorage`. Deben abrirse en el **mismo navegador, perfil y origen**: mismo esquema, host y puerto. `localhost` y `127.0.0.1` son orígenes distintos; 8080 y 8089 también. `localStorage` no sincroniza automáticamente entre computadoras, teléfonos, perfiles, navegadores ni orígenes. En este modo usa una segunda pantalla del mismo equipo. El modo Wi-Fi de arriba sí sincroniza distintos dispositivos mediante el servidor local. Para trasladar la sesión utiliza exportación/importación JSON en el conductor.

La fase 1 usa `retos.equipos.v2` (privada) y `retos.equipos.public.v2` (resumen público). Si encuentra `retos.session.v1`, copia los nombres con sus IDs y solicita completar las edades; la versión anterior no las tenía. **La clave v1 no se modifica ni se elimina:** conserva catálogo, pistas, equipos, resultados e historial. Puedes descargarla con «Exportar sesión anterior». La cantidad de equipos empieza sin seleccionar también en esta migración. Los espacios vacíos del formulario antiguo no se convierten en concursantes. No se inventan edades.

El código de dominio y catálogo anteriores se conserva como referencia y con pruebas de regresión; no se ejecuta desde el flujo activo; 2A utiliza módulos propios integrados a la misma sesión. El ZIP `noche-de-retos-v1.1-respaldo.zip`, junto al paquete de esta entrega, conserva la aplicación anterior completa. No borres datos del sitio ni uses navegación privada para una sesión que quieras conservar. Ante datos corruptos se muestra un error y se permite descargar los valores guardados sin sobrescribirlos.

## Algoritmo reproducible

- PRNG determinista por semilla. Orden inicial por ID, desempates de edad barajados y orden estable por edad. Se forman `k` cuantiles, cuyos tamaños difieren como máximo en uno.
- Cupos `floor(N/k)`, con `N mod k` extras sorteados por la semilla principal. Estos cupos se mantienen para las 200 candidatas: la optimización del balance no decide qué equipo recibe el extra.
- Bombos en orden alternado de extremos: 1, k, 2, k−1; barajado sembrado en cada bombo y dirección alternada. Solo se consideran equipos con cupo y con el menor número de miembros de ese bombo. Entre ellos se minimiza la dispersión de medias parciales y se desempata al azar sembrado.
- Se evalúan 200 candidatas por orden lexicográfico: **[errores de cupo, suma de (máximo−mínimo) de integrantes de cada bombo entre equipos, diferencia entre medias de edad]**. Los empates se resuelven con el PRNG. Se guardan semilla principal, semilla candidata, índice y resultado. No se garantiza un óptimo global ni un equilibrio perfecto; se muestran las diferencias reales.
- Mismos participantes (incluidos IDs y edades), cantidad y semilla producen los mismos equipos. Los nombres de equipo no influyen. Los intercambios manuales posteriores quedan registrados y pueden empeorar las métricas.

## JSON de concursantes

Puedes importar una lista o un objeto con `participants`. Los ID no se pueden repetir; los nombres sí. La importación conserva solo estos cuatro campos:

```json
{"participants":[
  {"id":"persona-01","name":"Ejemplo","age":38,"createdAt":"2026-11-16T12:00:00Z"}
]}
```

En `evidencia/sesion-demo-exportada.json` hay una sesión ficticia de 17 personas, confirmada y exportada desde el navegador. Para probarla sin tocar datos reales, usa otro puerto y conserva siempre una exportación de tu sesión.

## Pruebas

Con Node.js 22 o posterior, sin instalar dependencias:

```sh
node tests/teams.test.js
node tests/core.test.js
node tests/demo-equipos.js
node tests/contest.test.js
python3 -m unittest discover -s tests -p 'test_*.py' -v
```

También puedes usar `npm test`. La entrega inicial de 2A tenía 85 pruebas; la navegación y 2B añaden sus suites sin eliminar las anteriores. El total y las salidas actuales están en `VERIFICACION_FASE2B.md`. Las pruebas multijuego usan fichas sintéticas identificadas como datos de prueba: no habilitan once juegos pendientes. `VERIFICACION_FASE2.md` distingue pruebas automáticas, ensayo real de navegador y validaciones pendientes.

## Estructura

- `index.html`, `src/conductor.js`: registro, revisión, confirmación e importación/exportación.
- `src/teams-core.js`: participantes, PRNG, bombos, candidatas, integridad, auditoría y persistencia.
- `publico.html`, `src/publico.js`, `src/teams-show.js`: TV con resumen público y una segunda lista blanca.
- `equipos.css`, `navidad.css`, `escenario.css`, `assets/`: composición navideña y recursos locales.
- `servidor_local.py`, `src/lan-host.js`, `src/lan-public.js`: sincronización local opcional, control autenticado y resumen público.
- `service-worker.js`, `src/offline-host.js`: cachés pública y privada separadas; no borran sesiones.
- `src/contest-core.js`, `src/game-model.js`: eventos, catálogo versionado, turnos, reloj y libro de puntos.
- `src/contest-host.js`, `src/contest-show.js`, `contest.css`: controles privados y presentación pública del concurso.
- `concurso_publico.py`, `src/clock-sync.js`: proyección independiente y compensación horaria.
- `src/core.js`, `src/show.js`, `src/wheel.js`, `catalogo/`: dominio anterior conservado; geometría compartida y catálogo privado inicial de 2A.
- `tests/`, `evidencia/`: pruebas y demostración reproducible.

## Doce minijuegos definitivos

La rama `doce-minijuegos-completos` incorpora motores por posición/rapidez, conteo, cercanía y premios directos; instala las fichas definitivas como revisiones nuevas, conservando las anteriores y los eventos históricos. Consulta [DOCE_MINIJUEGOS.md](DOCE_MINIJUEGOS.md) para reglas, controles, bancos, pruebas y el bloqueo de validación visual. `npm run test:full` ejecuta los motores; `npm run test:full-browser` verifica conductor y TV cuando Chromium está disponible.

## Cierre del concurso

La rama `cierre-funcional-concurso` añade Roba y Gana con clasificación previa a la revelación, repetición configurable anunciada, representantes antes de revelar, Duelo de Generaciones y ceremonia final auditable. Consulta [CIERRE_CONCURSO.md](CIERRE_CONCURSO.md) para el estado verificable y [PRUEBA_MANUAL_CIERRE.md](PRUEBA_MANUAL_CIERRE.md) para ensayar con datos separados desde celular y TV. Las validaciones visuales siguen pendientes por el bloqueo de Chromium del entorno.
