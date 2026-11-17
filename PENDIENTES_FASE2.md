# Estado y pendientes de fase 2

## Implementado y probado

- Fase 1 conservada: registro, equipos, bombos, confirmación, respaldo y sincronización.
- Evento independiente con copias de reglas, modalidad antes/después, puntos y tiempo configurables.
- El actor dramático: sorteo persistente, representantes, tarjetas privadas, turno por equipo, reloj, captura, revisión y confirmación.
- Prioridad por participaciones, sustitución motivada y no participación voluntaria sin penalización.
- Marcador, corrección, deshacer, anulación y referencias contables; recarga y protección de doble confirmación.
- Selección sin repetición, omitidos/restauración y repetición excepcional con motivo. Motor probado con tres fichas sintéticas distintas; solo el actor está habilitado en la UI de 2A.
- Proyección pública con listas blancas independientes, catálogo autenticado y cachés separadas.
- Recarga offline individual real con servidor detenido y sincronización LAN entre orígenes diferentes.

## Implementado, pendiente de validación manual específica

- Audio sintetizado, aviso de finalización y reducción de movimiento: controles conservados y rutas de código revisadas; falta audición en el equipo de sonido del evento.
- Uso en celulares físicos Android/iPhone, TV física, navegadores alternativos y lectura con personas de 70+: no se han probado esos dispositivos/personas.
- Restauración excepcional de omitidos, repetición autorizada y modalidad ciega: probadas automáticamente; falta ensayo manual completo de cada variante en el evento real.

## Diseñado, no implementado en 2A

- 2B: administrador de biblioteca (crear, editar, duplicar, buscar, activar/archivar, importar/exportar solo biblioteca y restaurar versiones), todas las dinámicas de los otros once juegos.
- 2C: Duelo de Generaciones, banco editable de preguntas y enlace de ganador al siguiente reto. La regla de 10 puntos aprobada está documentada en la especificación, todavía no se ejecuta.
- 2D: ceremonia de cuatro lugares y cierre audiovisual completo.
- Motores por posición, cantidad de aciertos, cercanía y reglas especiales; selector de eventos históricos y fecha opcional editable.
- Importación/exportación independiente de preguntas/biblioteca. El respaldo completo de sesión sí conserva biblioteca versionada, eventos y resultados.

## Pendiente de decisión del usuario

- Aprobación para integrar la rama a main y para iniciar cada etapa posterior.
- Reglas definitivas de los juegos, desempates y excepciones de puntos. Los 100 puntos nominales y el resto de criterios siguen siendo propuestas configurables, aceptadas expresamente por evento para la prueba.
- Uso de repetir un reto agotado: está disponible como excepción explícita con motivo, no como comportamiento automático.
