# Codex — Fase 1 funcional: concursantes y equipos

## Objetivo
Implementar y demostrar un flujo completo, sin pantallas simuladas: registrar participantes con nombre y edad; seleccionar de 2 a 4 equipos; sortear equipos equilibrados por edad con bombos; revisar y confirmar la distribución; persistir el resultado. NO desarrollar minijuegos, ruletas de retos ni premiación todavía.

## Datos y validaciones
- Participante: id estable, nombre no vacío, edad entera razonable (1 a 110), fecha de alta. No guardar datos sensibles adicionales.
- Alta, edición, eliminación, importación/exportación JSON de participantes; no duplicar ID. Avisar por nombres repetidos sin prohibir homónimos.
- Selector de 2, 3 o 4 equipos; ninguno seleccionado por defecto. No permitir sorteo si no hay suficientes personas para al menos una por equipo.
- Nombres de equipos editables, generados por defecto solo al seleccionar cantidad.
- Sin límite fijo de 17; probar con 17 y otras cantidades. Cupos difieren como máximo en uno.

## Algoritmo de bombos (determinista para semilla, aleatorio entre empates)
1. Ordenar participantes por edad ascendente, con desempate pseudoaleatorio usando semilla registrable.
2. Repartir en `k` bombos por cuantiles de edad (k = número de equipos), con tamaños que difieran como máximo en 1; mostrar rangos y personas por bombo al conductor.
3. Calcular cupos objetivo por equipo: floor(N/k) y repartir los N mod k cupos extra por sorteo.
4. Recorrer los bombos en orden alternado; dentro de cada bombo barajar por semilla y asignar cada participante al equipo elegible que minimice una función de desequilibrio: primero evitar superar cupo, luego reducir diferencia de cantidad de integrantes del mismo bombo, después reducir dispersión de edad media y finalmente desempatar al azar. No colocar dos integrantes del mismo bombo en un equipo si otro equipo con cupo tiene menos integrantes de ese bombo, salvo necesidad por cupos.
5. Ejecutar varias candidatas con distintas semillas (p. ej. 200) y seleccionar la mejor por una puntuación explícita que priorice: (a) cupos válidos, (b) distribución de bombos, (c) diferencia de edad promedio; desempate aleatorio. Mostrar métricas de balance y permitir re-sorteo.
6. Registrar semilla y resultado para poder reproducirlo. No afirmar equilibrio perfecto; mostrar diferencias y permitir ajustes manuales auditables.

## Interfaz de conductor
- Paso 1: lista editable con nombre y edad, contador y validaciones.
- Paso 2: elegir 2, 3 o 4 equipos, editar nombres.
- Paso 3: ver bombos generados y ejecutar sorteo; animación opcional que refleje exactamente el resultado calculado, no uno prefijado.
- Paso 4: tabla de equipos, cantidad, edades, promedio, mínimo/máximo y representación por bombo; botón re-sortear, corrección manual y confirmar.
- Confirmación bloquea el sorteo accidental; permite volver a editar con advertencia.
- Guardar en localStorage, exportar/importar JSON; recuperación al recargar.
- Estética navideña actual sin sacrificar legibilidad. La pantalla pública solo muestra sorteo y equipos; no publicar edades individuales.

## Criterios de aceptación / pruebas obligatorias
- Para N=17: 2 equipos => 9/8; 3 => 6/6/5; 4 => 5/4/4/4 (el equipo grande se sortea).
- Todos los participantes aparecen exactamente una vez, sin omisiones ni duplicaciones.
- Edición de una edad recalcula bombos y requiere nuevo sorteo.
- Re-sorteos pueden variar y no violan cupos.
- Mismos datos + semilla => mismo resultado.
- Datos y confirmación sobreviven recarga.
- Con 2, 3 y 4 equipos hay pruebas automatizadas de integridad y equilibrio, también para N no divisible por k.
- La pantalla pública no expone edades individuales.
- Demostración final: registrar 17 concursantes de prueba, sortear con k=2,3,4, mostrar métricas, recargar y recuperar.

## Alcance y entrega
Modificar el proyecto existente; no crear prototipo visual aparte. Entregar archivos fuente, README de ejecución offline, tests y evidencia de pruebas. No avanzar a fase 2 hasta aprobación expresa del usuario. Si la aplicación pública y la de conductor son pestañas diferentes, documentar cómo se sincronizan; localStorage no sincroniza automáticamente entre dispositivos ni orígenes diferentes.
