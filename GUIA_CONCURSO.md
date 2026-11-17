# Demostración · ruleta y rondas 2C.1

## Ejecutar sin reemplazar datos

En la carpeta del proyecto ejecuta `python3 servidor_local.py` (Windows: `py servidor_local.py`). Continúa con el mismo perfil y carpeta de datos que utilizabas. No borres almacenamiento ni vuelvas a importar la Biblioteca. Exporta un respaldo desde Inicio antes del ensayo. Recarga una segunda vez si había una caché anterior.

La terminal indica el enlace de conductor para el celular y el enlace público de TV. Usa la misma Wi-Fi local. El código privado se introduce únicamente en el conductor. No proyectes esa página. Mantén encendida la computadora anfitriona.

Para un ensayo independiente puedes usar `python3 servidor_local.py --port 8093 --data-dir .datos-demo-2c1`; esta carpeta empieza separada de tu partida. No necesitas importar fichas en la sesión existente. Las pruebas automáticas generan sus propios datos ficticios sin tocar tu sesión.

## Recorrido verificable

1. En Inicio continúa el evento abierto, o revisa Participantes y confirma equipos en Equipos antes de crear una nueva reunión.
2. En Nueva reunión selecciona fichas y versiones de la Biblioteca existente, acepta la configuración y crea el evento. Roba y Gana permanece incluido. En Concurso también puedes configurar los juegos entre rondas.
3. Desde Concurso pulsa el botón del formulario de sorteo. La semilla es opcional para ensayos reproducibles. La TV anima los mismos candidatos y el mismo resultado guardado. Pulsar dos veces no crea otra ronda.
4. Durante el giro recarga conductor y TV: se conserva la ronda y el juego. Revela el resultado con el control del conductor.
5. Pulsa Presentar instrucciones, confirma representantes (o hazlo antes de revelar si así configuraste el evento) y revisa materiales y pasos públicos. La TV recibe únicamente información pública.
6. Si aparece **Motor pendiente de integración**, avanza hasta la preparación y su estado de ejecución pendiente. No hay captura de resultados ni puntos para esa dinámica. Recarga ambas pantallas: conservan el estado.
7. Para continuar sin jugar ese motor, usa el cierre sin resultados. Requiere confirmación explícita y motivo. El historial conserva el cierre; no registra ceros ficticios ni aplica puntos. Luego pasa a Siguiente ronda.
8. Si elegiste expresamente una revisión con motor operativo de puntos fijos/manual (por ejemplo la revisión original del actor), prepara sus turnos, inicia, pausa, reanuda y finaliza el reloj. Captura resultados reales, revisa y confirma. La asignación se aplica una vez. Las tarjetas privadas siguen reservadas al conductor.
9. Usa los controles de pantalla pública para mostrar Clasificación y volver al estado de la ronda. Cambiar secciones no reinicia el reloj. Resultados conserva el historial y las correcciones previas.

Los juegos completados solo reaparecen si su ficha permite repetición o hay autorización expresa. Los omitidos ordinarios deben reintroducirse. Roba y Gana siempre queda disponible; su motor de premios sigue pendiente.

## Ejecutar las pruebas

`npm test` ejecuta dominio y servidor sin dependencias adicionales. Para navegador instala las herramientas opcionales indicadas en README y ejecuta `npm run test:navigation`, `npm run test:library` y `npm run test:rounds`. Puedes definir `CHROMIUM_PATH` si usas Chromium propio. Las pruebas levantan servidores aislados y generan sus propias sesiones.
