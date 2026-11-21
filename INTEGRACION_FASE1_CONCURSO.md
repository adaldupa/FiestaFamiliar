# Integración Fase 1 → concurso

Rama: `integracion-fase1-concurso`. Base: `fase2-motor-concurso`, commit `915dcd5` (contiene 2A, biblioteca 2B y ciclo 2C.1). No se modifica main ni se fusionan ramas.

## Cambios

- Confirmar equipos lleva a Inicio para crear la reunión; crearla abre Concurso con los mismos IDs, integrantes y nombres confirmados.
- Se reutilizan ruleta, representantes, turnos, revisión, libro de puntos, clasificación y siguiente ronda existentes.
- Se corrige finalizar un evento después de cerrar una ronda sin resultados: la interfaz ofrecía la acción, pero el dominio la rechazaba.
- Antes de importar otra sesión se conserva una copia privada independiente de la actual. Inicio ofrece exportar la última copia; las anteriores permanecen en claves privadas únicas `retos.equipos.preimport.v2:*`. Si falla el almacenamiento, se cancela la importación. En Wi-Fi esta copia se conserva en el navegador del conductor que importa: no es un segundo archivo del servidor.
- Se actualiza la versión de caché privada y pública para entregar el código nuevo.

## Pruebas ejecutadas

`npm test`: **137 pruebas aprobadas** (113 Node + 24 Python), cero fallos. Salida completa en `evidencia/integracion/pruebas.txt`.

Las cinco nuevas pruebas verifican el recorrido desde 17 participantes nuevos con 2, 3 y 4 equipos: sorteo, confirmación, evento, ruleta, selección, representantes, cada turno, pausa/reanudación, captura, revisión sin puntos aplicados, confirmación única, marcador, siguiente ronda y otra reunión conservando íntegro el evento anterior. Recargan mediante persistencia real de dominio entre etapas. También verifican copia previa a importación, error por falta de almacenamiento y cierre sin puntuación.

`npm run test:rounds`: **bloqueado por el entorno**, no por una aserción funcional. Chromium aborta antes de abrir las páginas: `socket() failed: Operation not permitted`. Se agregó un caso de navegador para confirmar equipos y llegar a creación de evento/ruleta/TV, pero no pudo ejecutarse. Log en `evidencia/integracion/bloqueo-navegador.txt`. No se afirma validación visual ni prueba en un televisor físico en esta entrega.

## Estado funcional

| Componente | Estado | Verificación / límite |
| --- | --- | --- |
| Participantes y equipos | Operativo | 17 personas y 2/3/4 equipos, IDs únicos, cupos, confirmación y recuperación |
| Equipos → evento → ruleta | Operativo | Usa copias de los equipos confirmados, bloquea edición mientras el evento está abierto |
| Selección y ficha del minijuego | Operativo | Sorteo persistente, reglas versionadas, representantes e instrucciones existentes |
| Ejecución fija/manual | Operativo en dominio | Turnos y cronómetros existentes; la prueba integral nueva usa el actor original compatible |
| Resultados y marcador | Operativo | Revisión, confirmación única, libro auditable, corrección y siguiente ronda |
| Historial y sesiones anteriores | Operativo con límite | Eventos conservados; copia previa a importación local al navegador que importa |
| Conductor privado / TV pública | Operativo en pruebas automáticas de dominio/servidor | DTO por lista blanca, sin edades ni tarjetas privadas; navegador bloqueado en este entorno |
| Posición, conteo, cercanía y premios directos | Pendiente | Conservan ficha y bloqueo; no ejecutan cronómetro ni aceptan puntos ficticios |
| Validación visual extremo a extremo | Parcial | Casos automatizados preparados; pendiente ejecutar Chromium en entorno compatible y verificar TV/celular reales |
| Ceremonia de premiación | Pendiente | Fuera del alcance de integración |

## Orden recomendado

1. Ejecutar `npm run test:rounds`, `npm run test:navigation` y `npm run test:library` en una máquina que permita Chromium; comprobar celular/TV por Wi-Fi y recarga.
2. Revisar la rama integrada antes de autorizar cualquier merge a main.
3. Continuar motores aprobados, comenzando por conteo y cronómetros 2C.2, después posición, cercanía y premios directos; mantener los restantes bloqueados durante cada entrega.
4. Completar ceremonia de premiación al cerrar los motores.

Para usar las doce fichas de la biblioteca, cargar el catálogo público desde Biblioteca y confirmar su importación; las sesiones existentes no se rellenan ni se sustituyen automáticamente. La ficha original compatible del actor sigue disponible como antes.
