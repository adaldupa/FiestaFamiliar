CODEX — PROMPT MAESTRO

NOCHE DE RETOS | FASE 2 — MOTOR DE CONCURSO Y BIBLIOTECA REUTILIZABLE

1. Contexto del proyecto

Estamos desarrollando una aplicación web familiar llamada La Gran Noche de Retos, dentro del repositorio:

"https://github.com/adaldupa/FiestaFamiliar"

Es una experiencia tipo concurso televisivo, inspirada en la dinámica de minijuegos por equipos, sin utilizar personajes ni elementos protegidos de Mario Party.

La aplicación debe funcionar durante reuniones familiares, proyectarse en una televisión y ser controlada desde una computadora o un celular.

Objetivo estratégico: convertirla en una plataforma reutilizable para Navidad, Año Nuevo, cumpleaños y futuras reuniones, permitiendo modificar los minijuegos sin programar.

Estado actual

La fase 1, versión 2.1, ya implementa:

- Registro de concursantes con nombre y edad.
- Selección de 2, 3 o 4 equipos.
- Sorteo equilibrado mediante bombos por edades.
- Confirmación y bloqueo de equipos.
- Persistencia y recuperación de sesiones.
- Pantalla pública independiente.
- Sincronización opcional por Wi-Fi local.
- Funcionamiento sin Internet.
- Pruebas automatizadas y documentación.

Estas funcionalidades deben conservarse íntegramente.

Antes de desarrollar, inspecciona el código real, README, FASE1_EQUIPOS.md, VERIFICACION.md, especificacion_noche_de_retos.md y los módulos existentes.

No reconstruyas la aplicación desde cero.

---

2. Estrategia de desarrollo

Crear una rama de Git:

"fase2-motor-concurso"

No modificar directamente "main".

Trabajar en entregas progresivas:

1. Fase 2A: motor de concurso y una ronda completa.
2. Fase 2B: administrador de minijuegos.
3. Fase 2C: integración de los 12 juegos y Duelo de Generaciones.
4. Fase 2D: experiencia televisiva completa y premiación.

No avanzar automáticamente a la siguiente etapa sin aprobación del usuario.

Cada entrega debe incluir código funcional, pruebas, evidencia y actualización de documentación.

No aceptar como terminadas pantallas que solamente simulen funcionalidades.

---

3. Arquitectura general

La aplicación tendrá tres componentes funcionales.

A. Panel del conductor

Interfaz privada desde donde se administra:

- Participantes y equipos.
- Eventos y colecciones de minijuegos.
- Sorteo de juegos.
- Selección de representantes.
- Reglas privadas y pistas secretas.
- Cronómetro.
- Resultados y puntuaciones.
- Correcciones y anulaciones.
- Historial de rondas.
- Premiación.

B. Pantalla pública para televisión

Debe mostrar únicamente información apropiada para los concursantes:

- Bienvenida.
- Equipos.
- Marcador.
- Ruleta de minijuegos.
- Juego seleccionado.
- Reglas públicas.
- Materiales necesarios.
- Participantes seleccionados.
- Cronómetro.
- Resultados.
- Clasificación.
- Premiación.

Nunca mostrar pistas secretas, respuestas, códigos de acceso, datos privados ni herramientas administrativas.

C. Biblioteca de minijuegos

Módulo privado para administrar juegos reutilizables, sus reglas, variantes y colecciones.

No debe requerir modificaciones de código para agregar un nuevo minijuego de dinámica física, creativa o de preguntas.

---

4. Administrador de minijuegos

Crear un módulo denominado Biblioteca de minijuegos.

Operaciones obligatorias

- Crear un minijuego.
- Editar un minijuego.
- Duplicar un minijuego.
- Activar y desactivar.
- Archivar sin eliminar historial.
- Buscar y filtrar.
- Clasificar por categorías.
- Importar y exportar JSON.
- Seleccionar juegos para un evento.
- Restaurar una versión anterior de las reglas cuando sea necesario.

No permitir eliminar permanentemente un juego que tenga resultados históricos asociados.

Campos de cada minijuego

- ID único y estable.
- Nombre.
- Descripción.
- Categoría.
- Modalidad: individual, representante + equipo, equipo completo u otra.
- Número mínimo y máximo de participantes.
- Reglas públicas.
- Instrucciones privadas del conductor.
- Materiales.
- Duración en segundos.
- Sistema de puntuación.
- Condiciones de victoria.
- Desempate.
- Qué hacer si nadie completa el reto.
- Adaptaciones de accesibilidad.
- Pistas o respuestas secretas, cuando correspondan.
- Estado: activo, inactivo o archivado.
- Versión de reglas.
- Fecha de creación y actualización.

Sistemas de puntuación configurables

Permitir configurar al menos:

1. Puntos fijos por éxito.
2. Puntos por posición.
3. Puntos por cantidad de aciertos.
4. Puntos por cercanía a un objetivo.
5. Puntos asignados manualmente.
6. Puntos especiales con límites configurables.

La puntuación nominal de los retos será de 100 puntos, salvo excepciones aprobadas.

No inventar reglas definitivas cuando aún estén pendientes de validación.

---

5. Eventos y colecciones

La aplicación debe permitir crear eventos independientes, por ejemplo:

- Navidad 2026.
- Año Nuevo.
- Cumpleaños.
- Reunión familiar.

Cada evento debe tener:

- ID.
- Nombre.
- Fecha opcional.
- Participantes y equipos.
- Colección de minijuegos seleccionados.
- Configuración de puntos.
- Historial de rondas.
- Clasificación final.
- Estado: preparación, en curso o finalizado.

Un evento puede utilizar solamente una parte de la biblioteca.

Ejemplo: tener 30 minijuegos registrados, seleccionar 8 para una reunión y utilizar exclusivamente esos 8 en la ruleta.

Cada evento debe conservar una copia de las reglas y puntuaciones utilizadas, para que las modificaciones futuras no alteren los resultados históricos.

No mezclar resultados entre eventos.

---

6. Motor de concurso

Implementar una máquina de estados explícita:

1. Preparación.
2. Equipos confirmados.
3. Selección de minijuego.
4. Selección de representantes.
5. Presentación de reglas.
6. Preparación del reto.
7. Cronómetro activo.
8. Cronómetro pausado.
9. Captura de resultados.
10. Confirmación de puntuación.
11. Marcador actualizado.
12. Siguiente ronda.
13. Premiación.
14. Evento finalizado.

Las transiciones deben estar controladas por el conductor.

Evitar avanzar accidentalmente o registrar dos veces el mismo resultado.

Permitir recuperar el estado después de recargar el navegador o reconectar un dispositivo.

---

7. Ruleta de minijuegos

La ruleta debe ser real y funcional.

Requisitos

- Utilizar exclusivamente los juegos seleccionados y activos del evento.
- Elegir aleatoriamente entre los disponibles.
- No repetir juegos completados, salvo autorización expresa.
- Mostrar el resultado calculado, nunca uno predeterminado.
- Animación sincronizada con el resultado real.
- Permitir saltar un juego con motivo registrado.
- Permitir reintroducir un juego omitido.
- Registrar juego, ronda y estado.
- Detectar cuando se agotaron los juegos disponibles.

La animación no debe decidir el resultado; solamente representarlo.

Si se interrumpe una animación, el resultado seleccionado debe conservarse.

---

8. Selección de participantes

La aplicación debe procurar que todos tengan oportunidad de participar.

Registrar por participante:

- ID.
- Equipo.
- Número de juegos realizados.
- Último juego.
- Rondas en las que participó.

Reglas

- Favorecer a quienes han participado menos.
- Evitar seleccionar repetidamente a la misma persona.
- Permitir selección manual del conductor.
- Permitir sustitución por accesibilidad o decisión personal.
- No penalizar a quien prefiera no participar.
- Registrar los cambios.

La selección puede realizarse antes o después de revelar el juego, según su configuración.

Los retos deben permitir adaptaciones para personas mayores o con movilidad limitada.

---

9. Duelo de Generaciones

Incorporar una mecánica especial denominada Duelo de Generaciones.

Consiste en preguntas de cultura popular de distintas épocas, especialmente:

- Música popular.
- Series de televisión.
- Programas de televisión abierta.
- Personajes y acontecimientos culturales.

Regla aprobada

Quien responde correctamente gana 10 puntos para su equipo y queda seleccionado para participar en el siguiente minijuego.

El conductor debe poder:

- Seleccionar una pregunta.
- Mostrar la pregunta públicamente.
- Consultar la respuesta correcta de forma privada.
- Identificar a quien respondió.
- Confirmar si acertó.
- Asignar los 10 puntos.
- Vincular al concursante con el siguiente reto.
- Anular la respuesta si hubo un error.

No otorgar puntos ni seleccionar representante antes de la confirmación.

Evitar que una pregunta se repita accidentalmente durante el mismo evento.

La selección derivada del Duelo de Generaciones debe respetar el registro de participación y permitir sustitución voluntaria.

Banco de preguntas

Crear un catálogo editable con:

- Pregunta.
- Respuesta correcta.
- Década o época.
- Categoría.
- Dificultad.
- Opciones de respuesta, cuando correspondan.
- Estado activo o inactivo.

Permitir importar nuevas preguntas.

No utilizar grabaciones, videos o material protegido sin los permisos correspondientes.

---

10. Catálogo inicial de 12 minijuegos

Conservar estos nombres y utilizar las reglas propuestas en la especificación existente, sin tratarlas como definitivas.

#| Minijuego| Categoría sugerida
1| La galleta viajera| Destreza
2| Picasso a oscuras| Creatividad
3| La elección maldita| Suerte
4| Tararea si puedes| Música
5| La torre traicionera| Habilidad
6| La caja misteriosa| Sensorial
7| Rebote imposible| Precisión
8| Manos de mantequilla| Destreza
9| El actor dramático| Actuación
10| La pelota rebelde| Precisión
11| ¿Cuántos hay?| Estimación
12| El regalo sorpresa| Suerte

Cada juego debe contar con una ficha editable que incluya instrucciones, materiales, tiempo, puntuación, desempate y alternativas accesibles.

Los juegos con frases, canciones, objetos o respuestas secretas deben mantener esa información fuera de la pantalla pública.

---

11. Cronómetro

Crear un cronómetro reutilizable para todos los juegos.

Funciones:

- Duración configurable.
- Iniciar.
- Pausar.
- Reanudar.
- Reiniciar.
- Finalizar anticipadamente.
- Aviso visual y sonoro al terminar.
- Sincronización con TV.
- Recuperación después de recarga.

Utilizar una referencia temporal robusta para evitar que los segundos se desfasen entre dispositivos.

No permitir que dos conductores inicien cronómetros independientes para la misma ronda.

Respetar la preferencia de movimiento reducido y permitir silenciar sonidos.

---

12. Puntuación y marcador

Crear un sistema centralizado de puntuaciones.

Funciones

- Registrar puntos por equipo.
- Aplicar reglas del juego seleccionado.
- Mostrar resultados antes de confirmar.
- Confirmar puntuaciones.
- Actualizar el marcador público.
- Registrar historial.
- Corregir resultados.
- Deshacer la última asignación.
- Evitar duplicaciones.
- Calcular posiciones.
- Resolver empates conforme a reglas configuradas.

Cada movimiento de puntos debe registrar:

- ID único.
- Evento.
- Ronda.
- Equipo.
- Cantidad.
- Motivo.
- Fecha.
- Estado.
- Referencia a correcciones o anulaciones.

No sobrescribir silenciosamente resultados históricos.

Las correcciones deben ser auditables.

---

13. Persistencia y sincronización

Conservar la arquitectura local existente.

Modo individual

Debe funcionar sin Internet desde una computadora con la TV conectada.

Modo Wi-Fi

Utilizar el servidor local existente para sincronizar conductor y pantalla pública.

Requisitos:

- La computadora actúa como anfitrión.
- El celular puede controlar la partida.
- La TV muestra el estado público.
- La partida no depende de Internet.
- Los datos se conservan al recargar.
- Los conflictos entre conductores no sobrescriben cambios silenciosamente.
- El estado público se construye mediante una lista blanca.
- Las pistas secretas nunca se envían al cliente público.
- El código privado de acceso no se sube a GitHub.

No abrir el servidor a Internet.

Respaldo

Permitir exportar e importar:

- Biblioteca de minijuegos.
- Banco de preguntas.
- Configuración de eventos.
- Sesiones y resultados.

Validar estructura, versiones, IDs y referencias antes de importar.

No sustituir datos existentes sin confirmación.

---

14. Experiencia visual

Mantener el estilo navideño televisivo aprobado.

Características:

- Pantalla 16:9.
- Marcadores grandes.
- Ruleta animada.
- Presentación del minijuego.
- Reglas legibles.
- Cronómetro visible.
- Animación de puntos.
- Clasificación.
- Podio final.
- Sonidos opcionales.

No sacrificar legibilidad ni accesibilidad por animaciones.

La apariencia puede adaptarse en el futuro a eventos no navideños, pero no desarrollar todavía un editor avanzado de temas visuales.

---

15. Accesibilidad y seguridad

La aplicación se utilizará con personas de distintas edades, incluyendo adultos mayores.

Requisitos:

- Tipografía grande.
- Alto contraste.
- Controles sencillos.
- Operación mediante teclado.
- Animaciones moderadas.
- Posibilidad de jugar sentado.
- Alternativas a retos físicos.
- Participación voluntaria.
- Sin castigos por no participar.

No obligar a comer, vendarse los ojos ni realizar movimientos incómodos.

Las actividades deben poder adaptarse sin excluir a los participantes.

---

16. Primera entrega obligatoria: Fase 2A

Implementar solamente el motor funcional y una ronda completa.

Utilizar El actor dramático como caso de prueba.

Flujo de demostración

1. Recuperar un evento con equipos confirmados.
2. Seleccionar El actor dramático mediante una ruleta real.
3. Elegir representantes.
4. Mostrar reglas públicas en TV.
5. Mostrar frase secreta exclusivamente al conductor.
6. Iniciar el cronómetro.
7. Pausar y reanudar.
8. Finalizar el juego.
9. Registrar un acierto.
10. Asignar 100 puntos.
11. Confirmar resultados.
12. Actualizar marcador público.
13. Recargar conductor y TV.
14. Comprobar que se conserva todo.
15. Deshacer o corregir el resultado y verificar el historial.

El motor debe quedar preparado para soportar los otros juegos, pero no implementar todavía todas sus dinámicas.

Diseñar desde esta etapa un modelo de catálogo editable y versionado.

---

17. Pruebas obligatorias

Incluir pruebas automatizadas para:

- Integridad de equipos existentes.
- Selección de juegos sin repetición.
- Sorteos reproducibles cuando se utiliza semilla.
- Selección de representantes.
- Estados de ronda.
- Cronómetro y pausas.
- Puntuación.
- Prevención de doble registro.
- Correcciones.
- Recuperación después de recarga.
- Sincronización Wi-Fi.
- Conflictos entre conductores.
- Privacidad de pistas y respuestas.
- Importación/exportación validada.
- Compatibilidad con sesiones de fase 1.

Agregar pruebas de regresión para garantizar que no se rompieron las 54 pruebas previamente reportadas.

Si alguna prueba falla, documentar y corregir antes de entregar.

---

18. Documentación y entregables

Actualizar o crear:

- README.md.
- PLAN_FASE2.md.
- ESPECIFICACION_FASE2.md.
- VERIFICACION_FASE2.md.
- GUIA_CONDUCTOR.md.
- Modelo de datos de minijuegos.
- Evidencias de pruebas.
- Registro de funcionalidades pendientes.

La documentación debe diferenciar claramente:

- Implementado y probado.
- Implementado pero pendiente de validación manual.
- Diseñado pero no implementado.
- Pendiente de decisión del usuario.

No declarar completadas funcionalidades solamente porque existen pantallas.

---

19. Control de versiones y entrega

1. Crear la rama "fase2-motor-concurso".
2. Conservar "main" estable.
3. Realizar commits descriptivos.
4. Ejecutar las pruebas.
5. Publicar la rama en GitHub.
6. Informar los archivos modificados.
7. Entregar un resumen de resultados y limitaciones.
8. Proporcionar instrucciones exactas para ejecutar la demostración.
9. Solicitar aprobación antes de integrar cambios a "main".
10. No continuar con las fases 2B, 2C o 2D sin autorización.

20. Regla fundamental

Primero funcionalidad verificable; después presentación visual.

No construir prototipos desconectados del sistema real.

No utilizar valores fijos simulando sorteos, puntuaciones o resultados.

No perder datos ni funcionalidades de la fase 1.

El resultado debe ser una plataforma familiar reutilizable, extensible, segura en la red local y comprensible para una persona que no programa.

Comienza inspeccionando el repositorio y desarrollando únicamente la fase 2A.