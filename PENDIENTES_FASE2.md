# Estado tras 2C.1

Implementado y probado: infraestructura de ruleta y ciclo de ronda descrita en [VERIFICACION_FASE2C1.md](VERIFICACION_FASE2C1.md). Biblioteca existente preservada; motores fijos/manuales anteriores conservados.

Pendiente de implementación: motores por posición, conteo, cercanía y premios directos de Roba y Gana; bancos completos de tarjetas y Duelo de Generaciones; experiencia de premiación de 2D. El registro de modalidades no declara esos evaluadores funcionales.

Pendiente de validación manual: dispositivos reales y Wi-Fi familiar. Pendiente de decisión del usuario: aprobación de esta entrega e integración a main. No se cambia ninguna regla aprobada por esta infraestructura.

## Registro anterior

# Estado y pendientes de fase 2

## Implementado y probado

- Fase 2B: administrador de fichas, estados, archivo sin eliminación, revisiones/restauración, JSON con vista previa y confirmación, doce fichas catalogadas, colecciones y selección de revisiones compatibles. Ver VERIFICACION_FASE2B.md.

- Corrección de navegación: seis secciones independientes, menú lateral/compacto, tres pasos de equipos y operación completa de ronda desde Concurso. Evidencia y límites en VERIFICACION_NAVEGACION.md.

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
- Restauración de omitidos y modalidad ciega: probadas automáticamente; falta ensayo manual completo de cada variante en el evento real.

## Diseñado, no implementado todavía

- 2C: nuevos motores de las doce fichas acordadas: clasificación por tiempo, conteos, cercanía, robos y transacciones especiales; tarjetas y preguntas estructuradas. El administrador de biblioteca sí está implementado en 2B.
- 2C: Duelo de Generaciones, banco editable de preguntas y enlace de ganador al siguiente reto. La regla de 10 puntos aprobada está documentada en la especificación, todavía no se ejecuta.
- 2D: ceremonia de cuatro lugares y cierre audiovisual completo.
- Motores por posición, cantidad de aciertos, cercanía y reglas especiales; fecha opcional editable. La consulta de eventos guardados ya está disponible desde Inicio sin reactivarlos.
- Importación/exportación independiente de preguntas. La biblioteca ya tiene exportación/importación independiente en 2B; el respaldo completo sigue conservando también eventos y resultados.

## Pendiente de decisión del usuario

- Aprobación para integrar la rama a main y para iniciar cada etapa posterior.
- Reglas definitivas de los juegos, desempates y excepciones de puntos. Los 100 puntos nominales y el resto de criterios siguen siendo propuestas configurables, aceptadas expresamente por evento para la prueba.
- Uso de repetir un reto agotado: está disponible como excepción explícita con motivo, no como comportamiento automático.
