# Verificación real · fase 2A

Fecha de sesión: 16 de noviembre de 2026 (America/Mexico_City). Rama `fase2-motor-concurso`, basada en main `1fd201ef1b13d0054d2f6978e60a17abe99ee40f` y la planificación remota `7497cdd`. Main y el servidor estable del puerto 8080 se conservaron.

## Automatización ejecutada

**85 pruebas aprobadas, cero fallos pendientes.** Salida real en `evidencia/fase2-pruebas.txt`.

| Suite | Pruebas | Resultado |
| --- | ---: | --- |
| Dominio anterior `tests/core.test.js` | 26 | Aprobadas |
| Equipos fase 1 `tests/teams.test.js` | 19 | Aprobadas |
| LAN original `tests/test_lan.py` | 9 | Aprobadas |
| Motor nuevo `tests/contest.test.js` | 26 | Aprobadas |
| Frontera LAN nueva `tests/test_contest_lan.py` | 5 | Aprobadas |

Las dos pruebas originales que inspeccionan el grafo público actualizan su lista de módulos permitidos para incluir `clock-sync.js` y `contest-show.js`; conservan la comprobación de que no se importa el dominio privado. No se eliminaron pruebas de regresión.

Se ejecutaron los comandos Node directamente con el runtime disponible y `python3 -m unittest discover -s tests -p 'test_*.py'`. Este entorno no incluye el ejecutable npm; `package.json` encadena exactamente esas mismas suites para quienes sí disponen de npm. No se instalaron dependencias.

Cobertura nueva: compatibilidad y equipos 4/4/4/5; aceptación de propuestas y configuración; transiciones inválidas; turnos completos; confirmación única; reloj absoluto, pausas, reinicio y recarga; corrección/anulación enlazadas; prioridad de representantes, sustitución motivada y voluntariedad; modalidad antes de revelar; omitidos/restauración/repetición excepcional; tres rondas con fichas sintéticas diferentes sin repetición; reproducibilidad por semilla y correspondencia geométrica de la ruleta; aislamiento histórico por evento; validación de IDs/referencias/puntos; sesión y respaldo; desfase horario; tarjetas personalizadas privadas; manifiesto público sin precarga privada.

Python comprueba además paridad exacta con la proyección JavaScript, exclusión de todas las frases, autenticación del catálogo (también rutas codificadas), reloj del anfitrión, rechazo de ledger adulterado, persistencia y conflicto de revisión. Las pruebas LAN originales conservan su ensayo concurrente con un ganador y un rechazo 409.

## Ensayo de navegador realizado

Conductor: `http://127.0.0.1:8092/index.html`. TV: `http://192.168.1.67:8092/publico.html`. Son orígenes diferentes: la comunicación depende del servidor Wi-Fi, no de localStorage compartido. Datos ficticios Prueba 01–17; carpeta de datos aislada de la sesión real.

1. Se recuperaron 17 identidades y los cuatro equipos confirmados (4/4/5/4, equivalentes a 4/4/4/5).
2. Se creó un evento aceptando explícitamente la propuesta de 100 puntos y 90 segundos por equipo.
3. Se sorteó El actor dramático sobre la colección real de un juego habilitado. Se recargó durante el estado de sorteo y se conservó el resultado.
4. Se confirmaron representantes sugeridos y se mostraron reglas, materiales, criterios y opción sentada.
5. Se abrió una tarjeta en el conductor. Se inspeccionó el contenido real de la TV: la frase permaneció ausente. Las API públicas se verifican por pruebas independientes con canarios.
6. Se inició, pausó y recargó el reloj. La pausa conservó 01:17 y se reanudó. Se terminó anticipadamente mediante confirmación.
7. Se completaron los cuatro turnos: un acierto y tres resultados sin acierto. El marcador siguió en cero durante captura y revisión.
8. Se confirmó: Estrella obtuvo 100 puntos; los otros equipos, cero. Recargar ambas vistas mantuvo esos valores.
9. Deshacer con motivo devolvió el marcador a cero; reconfirmar recuperó 100 sin duplicar.
10. Se propuso corregir a 50. La TV conservó 100 durante la revisión; al confirmar pasó a 50. Una nueva recarga mantuvo 50/0/0/0. La captura `evidencia/fase2-tv-marcador.png` muestra ese resultado deliberadamente corregido.

Ensayo adicional: se reinició el servidor conservando sesión y marcador, se autorizó expresamente una repetición con motivo y se comprobó que el giro revela automáticamente el nombre sin otra acción. Se preparó una segunda ronda, se escribió una tarjeta privada desde el formulario y se verificó su persistencia al recargar y su ausencia en el DOM de la TV. Esta segunda ronda queda preparada para continuar; todavía no aporta puntos.

## Offline comprobado

En el puerto 8093 se prepararon las cachés y se importó una sesión ficticia completa por el formulario con confirmación. El conductor mostró «Listo sin conexión». Se abrió la TV y **se detuvo el servidor estático**. Ambas vistas se recargaron correctamente y recuperaron los cuatro marcadores de 100 puntos de esa sesión de prueba. No hubo backend ni acceso a Internet para recuperar la partida. Es una prueba individual distinta del ensayo LAN.

La caché pública ya no instala el catálogo ni módulos privados. La caché del conductor se prepara por separado. Cambiar la versión de caché no elimina las claves de sesión. En teléfonos HTTP de LAN, Service Worker puede no estar disponible: el servidor de la computadora debe seguir encendido aunque no exista Internet.

## Límites y pendientes de validación manual

Se comprobó una ronda real de actor con cuatro turnos. Las tres rondas de juegos distintos son una prueba automatizada del motor con fichas sintéticas, no la integración de los otros once juegos. Esa integración, biblioteca visual, Duelo y premiación siguen fuera de 2A.

La modalidad ciega y la omisión/restauración están comprobadas automáticamente; falta su ensayo manual completo en el evento real. La repetición excepcional y la tarjeta personalizada también se ensayaron en el navegador con datos ficticios. Audio sintetizado y movimiento reducido están implementados; queda pendiente audición en altavoces físicos. Tampoco se afirma haber probado teléfonos físicos, TV física, lectores de pantalla, todas las resoluciones ni usuarios de 70+.

Los valores de puntuación son propuestas configurables aceptadas por evento. No se presenta ninguna decisión pendiente como definitiva. Estado detallado en `PENDIENTES_FASE2.md`.

## Corrección posterior de navegación

La estructura vertical descrita por la entrega inicial se reemplazó por seis secciones independientes. La nueva ejecución de pruebas y las capturas de escritorio/celular se registran por separado en [VERIFICACION_NAVEGACION.md](VERIFICACION_NAVEGACION.md), sin modificar la evidencia histórica anterior.
