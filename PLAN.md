# Fase 1 — plan y estructura

1. Integrar registro variable con nombre, edad, ID estable y fecha de alta, permitiendo homónimos.
2. Selección explícita de 2–4 equipos; bombos por cuantiles y 200 candidatas deterministas con cupos sorteados.
3. Revisión de métricas, intercambios auditados y confirmación bloqueada; persistencia y copias JSON.
4. Mantener el escenario navideño y aislar el resumen público; validar 17 participantes con k=2/3/4, recarga y offline.

Implementado sobre las mismas entradas `index.html` y `publico.html`. `teams-core.js` concentra el dominio de fase 1; el renderer público `teams-show.js` no lo importa. Las claves v1 y su catálogo/resultados se preservan. No se avanza a fase 2.

Consulta README para la estructura completa y VERIFICACION para resultados y evidencias.
