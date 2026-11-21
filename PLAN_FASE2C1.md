# Fase 2C.1 · alcance de esta entrega

Implementado y probado: ruleta real, elegibilidad desde Biblioteca, selección persistida antes de animar, prevención de duplicados, siete etapas, configuración de colección por evento, referencias inmutables de reglas, pantallas públicas independientes, continuidad local/LAN y protección permanente de Roba y Gana.

La selección usa exclusivamente las fichas existentes del evento y su estado actual en Biblioteca. Las fichas inactivas o archivadas quedan fuera, salvo la ficha permanente Roba y Gana, que no puede desactivarse ni archivarse. Su compatibilidad con datos anteriores no exige reimportar. Las reglas de repetición del modelo se respetan; un omitido ordinario requiere reintroducción. La animación representa la selección ya guardada.

| Etapa | Estado detallado del motor |
| --- | --- |
| Preparación | Equipos confirmados o siguiente ronda |
| Ruleta girando | selecting_game |
| Minijuego seleccionado | game_selected |
| Instrucciones | Representantes, reglas y preparación |
| En ejecución | Reloj activo/pausado/captura por turnos; engine_pending para integración pendiente |
| Validación de resultados | Revisión antes de confirmar |
| Ronda finalizada | Marcador confirmado o round_finished sin puntos |

Las etapas resumen el motor previo; no sustituyen su lógica de puntuación, turnos, reloj ni correcciones. Eventos anteriores se habilitan de forma aditiva al usar los nuevos controles, conservando su reloj y resultados.

Diseñado pero no implementado: evaluadores de posición (100/75/50/25), conteo, cercanía y premios directos. El registro de motores identifica estas modalidades pero bloquea su puntuación. Sus empates, robos y reglas particulares requieren integración y validación posteriores. No se implementa Duelo de Generaciones ni premiación.

Pendiente de validación manual: Android/iOS físicos, TV familiar y Wi-Fi del lugar. Las pruebas de navegador usan Chromium de escritorio con tamaños móviles; no equivalen a hardware real.
