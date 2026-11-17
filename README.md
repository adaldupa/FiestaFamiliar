# La Gran Noche de Retos — Fase 1: concursantes y equipos

Versión 2.1.0. La misma aplicación y la identidad navideña aprobada, con un flujo real de registro, sorteo por edades y confirmación. El modo individual no requiere backend. El modo Wi-Fi añade un servidor local opcional, sin cuentas, paquetes descargados ni servicios externos. Esta entrega se limita a la fase 1 de `FASE1_EQUIPOS.md`. Minijuegos, ruletas de retos, puntuación de partidas y premiación quedan fuera del flujo activo hasta aprobar la fase 2.

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

El teléfono por HTTP de red local puede no disponer de Service Worker; eso no impide jugar sin Internet mientras siga conectado al servidor. Si se pierde la Wi-Fi, las escrituras compartidas se rechazan y no se crean partidas paralelas silenciosamente. Puedes volver al modo individual con el servidor estático de abajo. Exporta la sesión compartida e impórtala en el modo individual si quieres continuar con sus últimos cambios.

## Ejecutar sin Internet

Necesitas Python 3 instalado. Abre una terminal **dentro de esta carpeta** y ejecuta:

```sh
python3 -m http.server 8080 --bind 127.0.0.1
```

En Windows puedes usar `py -m http.server 8080 --bind 127.0.0.1`. Abre `http://127.0.0.1:8080/index.html`. El servidor solo entrega archivos locales; no es un backend y no necesita Internet. No abras los HTML con `file://`, porque los módulos y la caché requieren un origen HTTP local.

Espera a que el conductor muestre **Listo sin conexión** y abre una vez `publico.html`. Los recursos se guardan en una caché del navegador. Después de prepararla, ambas vistas se pueden recargar aun con el servidor apagado; para instalar o actualizar la aplicación vuelve a ejecutar el servidor. Si el navegador no admite Service Worker o no permite almacenamiento, conserva el servidor local encendido. Todos los gráficos, fuentes y sonidos son locales; el sonido se sintetiza en el dispositivo.

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

La TV recibe exclusivamente nombres, equipos, cantidades, estado de confirmación y datos mínimos de presentación. No recibe edades individuales, bombos, promedios, fecha de alta, auditoría, catálogo ni pistas secretas. Es una separación de presentación dentro de una aplicación local, no una barrera de autenticación: quien tiene acceso al perfil del navegador puede abrir el conductor.

## Sincronización y conservación de datos

**En modo individual**, las vistas se sincronizan por `BroadcastChannel` y eventos `storage`, con recuperación desde `localStorage`. Deben abrirse en el **mismo navegador, perfil y origen**: mismo esquema, host y puerto. `localhost` y `127.0.0.1` son orígenes distintos; 8080 y 8089 también. `localStorage` no sincroniza automáticamente entre computadoras, teléfonos, perfiles, navegadores ni orígenes. En este modo usa una segunda pantalla del mismo equipo. El modo Wi-Fi de arriba sí sincroniza distintos dispositivos mediante el servidor local. Para trasladar la sesión utiliza exportación/importación JSON en el conductor.

La fase 1 usa `retos.equipos.v2` (privada) y `retos.equipos.public.v2` (resumen público). Si encuentra `retos.session.v1`, copia los nombres con sus IDs y solicita completar las edades; la versión anterior no las tenía. **La clave v1 no se modifica ni se elimina:** conserva catálogo, pistas, equipos, resultados e historial. Puedes descargarla con «Exportar sesión anterior». La cantidad de equipos empieza sin seleccionar también en esta migración. Los espacios vacíos del formulario antiguo no se convierten en concursantes. No se inventan edades.

El código de dominio y catálogo anteriores se conserva como referencia y con pruebas de regresión; no se ejecuta desde el flujo de fase 1. El ZIP `noche-de-retos-v1.1-respaldo.zip`, junto al paquete de esta entrega, conserva la aplicación anterior completa. No borres datos del sitio ni uses navegación privada para una sesión que quieras conservar. Ante datos corruptos se muestra un error y se permite descargar los valores guardados sin sobrescribirlos.

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
python3 -m unittest discover -s tests -p test_lan.py -v
```

También puedes usar `npm test`. Hay 19 pruebas de fase 1, 9 de sincronización Wi-Fi y 26 de regresión del dominio anterior; estas últimas no implican activar la fase 2. `node tests/demo-equipos.js --save` regenera el informe reproducible a partir de la sesión exportada. Evidencia, métricas y límites de verificación: `VERIFICACION.md` y `evidencia/`.

## Estructura

- `index.html`, `src/conductor.js`: registro, revisión, confirmación e importación/exportación.
- `src/teams-core.js`: participantes, PRNG, bombos, candidatas, integridad, auditoría y persistencia.
- `publico.html`, `src/publico.js`, `src/teams-show.js`: TV con resumen público y una segunda lista blanca.
- `equipos.css`, `navidad.css`, `escenario.css`, `assets/`: composición navideña y recursos locales.
- `servidor_local.py`, `src/lan-host.js`, `src/lan-public.js`: sincronización local opcional, control autenticado y resumen público.
- `service-worker.js`: caché de recursos; no almacena ni elimina sesiones.
- `src/core.js`, `src/show.js`, `src/wheel.js`, `catalogo/`: dominio y presentación anteriores conservados, no activos en esta fase.
- `tests/`, `evidencia/`: pruebas y demostración reproducible.
