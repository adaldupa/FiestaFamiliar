# Modelo de datos · fase 2A

Contrato ejecutable: `src/game-model.js`. Este modelo está implementado y validado; su administrador visual y sus operaciones CRUD están reservados para 2B.

## Biblioteca versionada

`contest.library = {schemaVersion: 1, games: [...], versions: [...]}`. `games` contiene la versión actual de cada ID estable. `versions` conserva copias completas, únicas por `(id, ruleVersion)`. La ficha actual debe coincidir con su versión archivada. No se modifica el catálogo v1 ni su almacenamiento.

| Campo de ficha | Tipo / validación |
| --- | --- |
| id, ruleVersion | ID estable no vacío; versión entera positiva |
| name, description, category, mode | Texto no vacío |
| minParticipants, maxParticipants | Enteros positivos; máximo ≥ mínimo |
| publicRules | Texto publicable; nunca incluir soluciones |
| privateInstructions, secrets | Texto privado y lista privada de frases/respuestas |
| materials | Lista de `{name, quantity, unit}`; cantidad finita ≥ 0 |
| seconds | Entero 1–3600 |
| representativesBefore | Booleano; elección antes/después del reto |
| scoring | Ver reglas de puntos abajo |
| victory, tie, noFinish | Condición de éxito, empate, reto no completado |
| accessibility | Alternativas y opción sentada |
| status | active / inactive / archived |
| createdAt, updatedAt | Fechas ISO |

`scoring = {mode, nominal:100, min, max, pointsPerSuccess, approvedException, decision:'proposal'}`. Los importes son enteros. Superar 100 o permitir negativos exige `approvedException:true`. La UI de 2A limita la propuesta a 0–100; no ofrece un administrador de excepciones todavía. Los seis modos están identificados: fixed, position, hits, closeness, manual, special. En 2A se ejecutan puntos fijos por éxito y ajustes manuales auditados. Los otros cuatro motores están diseñados, sin implementación.

## Eventos, rondas y movimientos

`contest.events[]`: ID, nombre, fecha opcional (`date:null` en esta entrega), participantes y equipos copiados por ID, juegos seleccionados con reglas completas, configuración, rondas, libro contable, auditoría y autorizaciones de repetición. `activeEventId` apunta al evento visible. Los eventos cerrados permanecen en el respaldo; al crear otro el marcador comienza en cero. El selector visual de eventos históricos y la edición de fecha quedan pendientes.

Cada ronda guarda ID, evento, número, ficha de reglas congelada, semilla, IDs candidatos, índice y rotación del sorteo, representantes, cambios motivados, turnos, borrador y confirmaciones. Las modificaciones posteriores a la biblioteca no cambian las copias de los eventos o las rondas.

El actor tiene **un actor y su equipo por turno**. Una ronda recorre todos los equipos que quieran participar. Cada turno guarda representante, índice privado de tarjeta, frase privada personalizada opcional, reloj y resultado. La frase personalizada solo se edita en preparación o pausa, con acción auditada sin guardar su texto en la auditoría. La prioridad de representantes se calcula por participaciones reales, independientemente de los puntos. Deshacer puntos no borra una participación que sí ocurrió.

El reloj conserva duración, tiempo restante, estado y `deadline` absoluto del anfitrión. Las peticiones miden el desfase con `X-Server-Time`, compensando el punto medio del viaje de red. Se mantiene un único turno activo. Al vencer sin conductor abierto, la TV marca cero; el conductor recupera y registra la finalización al volver a abrirse.

Cada movimiento tiene ID único, eventId, roundId, batchId, teamId, amount, reason, at, status y correctionOf. La revisión no crea movimientos. Confirmar consume el ID del borrador y crea una asignación por equipo, incluidos ceros. Corregir anula el lote anterior y enlaza el nuevo. Deshacer conserva importe, motivo, fecha de anulación e historial. El marcador suma exclusivamente movimientos activos.

## Estados

1. Preparación (reservado en el modelo).
2. Equipos confirmados.
3. Selección del juego.
4. Selección de representantes.
5. Presentación de reglas.
6. Preparación del turno.
7. Cronómetro activo.
8. Cronómetro pausado.
9. Captura de resultados.
10. Confirmación de puntuación.
11. Marcador actualizado.
12. Siguiente ronda.
13. Premiación (reservado para 2D; no aceptado como estado activo en 2A).
14. Evento finalizado.

El orden de selección de representantes y revelación depende de `representativesBefore`. Las acciones fuera de estado se rechazan antes de persistir.

## Frontera pública

Tres listas blancas: `contestPublicSnapshot` en JavaScript, `contest_public_snapshot` independiente en Python y `sanitizeContest` en la entrada de la TV. Solo se transmiten nombres, representantes confirmados, reglas públicas, materiales, tiempo, criterios, posiciones, puntos confirmados y geometría de ruleta. Se excluyen biblioteca completa, tarjetas, instrucciones privadas, edades, índices de tarjetas, borradores, ledger, auditoría y código de acceso.

La caché pública instala únicamente módulos de presentación y recursos gráficos. El catálogo exige autenticación en el servidor Wi-Fi; la caché privada se prepara desde el conductor. En modo individual ambas vistas comparten el perfil del navegador: esta separación protege la presentación, no sustituye una cuenta de usuario ni bloquea a quien ya puede abrir el conductor en ese perfil.
