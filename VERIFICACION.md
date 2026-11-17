# Verificación — fase 1 funcional

Fecha: 16 de noviembre de 2026. Aplicación existente actualizada a 2.0.0. Solo registro, bombos, equipos y confirmación; no se activa la fase 2.

## Pruebas automatizadas

**45 pruebas pasan:** 19 de fase 1 (`tests/teams.test.js`) y 26 de regresión del código anterior (`tests/core.test.js`). Salida completa en `evidencia/pruebas-automatizadas.txt`.

Cobertura de fase 1: 60 semillas para cada k=2/3/4 con N=17; cupos extra variables; unicidad sin omisiones; tamaños variables N=4,5,7,8,11,19,24,31 con k=2/3/4; reproducibilidad incluso reordenando la entrada; resorteos; cuantiles, empates de edad y extremos 1/110; validaciones; homónimos; invalidación por edición; bloqueo; intercambios auditados; persistencia/importación; migración sin modificar la clave v1; reversión ante almacenamiento lleno; privacidad por listas blancas y grafo de dependencias; escape HTML y paginación.

Las pruebas de regresión conservan el dominio previo. Sus rondas y ruletas no se presentan como funcionalidades activas de esta fase.

## Demostración real en navegador

Se registraron mediante los formularios 17 nombres ficticios, Prueba 01–17, con edades 11,12,14,18,22,27,31,36,40,45,49,55,60,65,70,75,82. Se verificó que inicialmente no había ningún número de equipos seleccionado.

| Equipos | Semilla | Cupos por orden de equipo | Diferencia de medias | Diferencia acumulada entre bombos |
|---|---|---|---|---|
| 2 | demo-navidad-2 | 9 / 8 | 0.2222 años | 1 |
| 3 | demo-navidad-3 | 6 / 6 / 5 | 0.1667 años | 1 |
| 4 | demo-navidad-4 | 4 / 4 / 5 / 4 | 2 años | 1 |

Todos tuvieron cero errores de cupo. Se compararon 200 candidatas por caso. Las métricas describen esta muestra, no garantizan un equilibrio perfecto en otros registros. La candidata seleccionada y los datos completos están en `evidencia/demo-reproducible.json`; se regeneran con `node tests/demo-equipos.js --save`. El texto visible recogido durante la prueba está en `evidencia/demo-navegador.json`.

Comprobaciones adicionales mediante UI:

- Paginación con dos equipos: páginas 1 y 2 mostraron todos los nombres; cuatro equipos mostraron los 17 nombres en una página.
- Confirmación con advertencia, bloqueo de participantes/cantidad/sorteo y recuperación al recargar ambas vistas.
- Exportación real de sesión confirmada: `evidencia/sesion-demo-exportada.json` (datos ficticios; anterior a los dos intercambios posteriores de prueba).
- Desbloqueo con advertencia. Se cambió la edad del primer concursante de 11 a 110: se actualizaron los bombos, desapareció la distribución y la TV volvió a bienvenida. Se restituyó 11 y se reprodujo la misma distribución con su semilla.
- Dos intercambios entre equipos distintos: el primero cambió la diferencia de medias de 2 a 3.5 años y el segundo la restituyó a 2; ambos quedaron auditados. Se volvió a confirmar.
- Después de preparar la caché final, se apagó el servidor HTTP. Se recargaron conductor y público: conservaron confirmación, cuatro equipos y 17 nombres. Se alternó bienvenida/equipos sin servidor y se verificó la sincronización. `evidencia/controles-offline.json` registra estas comprobaciones.
- La TV no mostró edades, bombos, métricas ni historial. Las pruebas automatizadas añaden secretos canario y verifican su exclusión del resumen y renderer público. La página pública solo importa renderer y audio.

## Evidencias visuales

- `evidencia/tv-2-equipos.png`: TV con 9/8 y paginación.
- `evidencia/tv-3-equipos.png`: TV con 6/6/5.
- `evidencia/tv-4-equipos.png`: cuatro equipos confirmados después de recargar.
- `evidencia/conductor-confirmado.png`: panel privado con métricas y bloqueo.
- `evidencia/tv-offline.png`: estado final con el servidor apagado.

Se verificó en el navegador integrado a 1280×720, usando un origen de prueba aislado en el puerto 8089. No se modificaron sesiones reales del puerto habitual 8080. No se probó un televisor físico ni todos los navegadores/lectores de pantalla. Las instrucciones de TV, accesibilidad y alcance de sincronización están en README.

## Versión 2.1 — sincronización por Wi-Fi local

Se añadieron 9 pruebas de servidor (`tests/test_lan.py`): autenticación, exclusión de campos privados, dos clientes, conflicto de revisiones, dos escrituras simultáneas, recuperación desde disco, rechazo de datos inválidos, control de origen, protección de archivos locales y estado público vacío. Total actual: **54 pruebas** (19 + 26 + 9).

Prueba de navegador con servidor local aislado en el puerto 8091: conductor anfitrión por loopback, segundo conductor por dirección LAN y TV por `localhost`, con orígenes distintos para impedir que `BroadcastChannel` o `localStorage` simulen la sincronización. El segundo conductor vio el formulario de código, se vinculó desde la UI, registró 17 concursantes ficticios WiFi 01–17, sorteó cuatro equipos 4/4/5/4 y confirmó. La TV recibió los 17 nombres sin edades. Se recargaron conductor remoto y TV: conservaron la confirmación y la distribución. `evidencia/tv-wifi.png` muestra el resultado. No se probó un teléfono físico; se comprobó el acceso por la dirección LAN en navegadores con almacenamiento separado.

No se suben a GitHub el archivo compartido de sesión, el código de acceso ni copias con datos reales. Los datos ficticios de la prueba se almacenaron en una carpeta de trabajo aislada. El servidor puede ejecutarse sin Internet, pero debe permanecer encendido y accesible por la Wi-Fi. GitHub Pages por sí solo no ejecuta el servidor Python ni sincroniza partidas entre dispositivos.
