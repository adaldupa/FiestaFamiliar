La Gran Noche de Retos — especificación funcional v0.1
Objetivo
Aplicación web local, estilo concurso televisivo, para 17 familiares de 11 a más de 70 años. Cuatro equipos (tres de cuatro y uno de cinco). No usar temática ni propiedad intelectual de Mario. Priorizar diversión, accesibilidad y participación efectiva.

Flujo
Registrar 17 nombres y grupos de edad/capacidad de forma respetuosa.
Sorteo estilo Mundial: bombos equilibrados y ruleta animada; cada nombre sale una vez. Mostrar resultado y permitir corrección manual del conductor. El quinto integrante se asigna por sorteo.
Presentar equipos y marcador inicial.
Sortear uno de 12 retos pendientes, sin repetir; en algunas rondas elegir representante antes de revelar reto, en otras después.
Mostrar instrucciones públicas, participantes, materiales, tiempo, puntuación y desempate. Proteger pistas/frases secretas.
Conductor inicia/pausa/reinicia cronómetro, captura resultados, confirma puntos y puede deshacer última asignación.
Clasificación y ceremonia de premios para los cuatro equipos, incluyendo consolación.
Pantallas
Pantalla de público: equipos, puntajes, animaciones, sorteo, reglas públicas, cronómetro, resultados.
Panel de conductor: controles, selección de modalidad, fichas completas, captura y corrección de puntos, secretos.
No revelar secretos en pantalla pública. Modo simple inicial: tarjetas físicas entregadas por conductor. Modo futuro: dispositivo privado del conductor conectado por red local.
Reglas transversales
Todos deben tener oportunidad de participar antes de repetir representante, salvo consentimiento o adaptación.
Retos físicos realizables sentados cuando sea posible; no exigir rapidez mental, equilibrio o movimientos dolorosos.
No obligar a comer, usar vendas, ponerse audífonos o participar en una actividad incómoda.
Mantener equilibrio de puntos: valor nominal de 100 puntos por reto, salvo cartas especiales previamente aprobadas.
Empates y casos de nadie completa: cada ficha debe tener resolución explícita.
El conductor puede saltar retos y corregir resultados, con confirmación.
Persistir localmente en el navegador (localStorage), exportar/importar JSON, funcionar offline.
Vista adaptable a televisor 16:9, letra grande, alto contraste, controles por teclado, sin flashes intensos.
Sin cuentas, sin servidor ni pagos. HTML/CSS/JS; evitar dependencias CDN para uso offline.
Fichas iniciales de juegos
Estas reglas son propuestas, pendientes de validación durante pruebas. El catálogo debe ser editable.

1. La galleta viajera
Modalidad: Individual
Materiales: Galletas, servilletas
Dinámica: Mover una galleta desde la frente hasta la boca sin manos; voluntario, sin obligación de comer.
Puntuación propuesta: Puntos por orden de logro; alternativa accesible de destreza.
Privacidad: Información pública, salvo contenido de tarjetas ocultas.
2. Picasso a oscuras
Modalidad: Representante + equipo
Materiales: Papel, plumones, tarjetas secretas
Dinámica: Dibujar sin mirar el papel; el equipo adivina.
Puntuación propuesta: 100 puntos si adivina dentro del tiempo.
Privacidad: Secreto: solo conductor/actor.
3. La elección maldita
Modalidad: Representante
Materiales: 6 vasos, tarjetas de puntos
Dinámica: Elegir un vaso y revelar puntos ocultos.
Puntuación propuesta: Puntuación indicada en tarjeta.
Privacidad: Información pública, salvo contenido de tarjetas ocultas.
4. Tararea si puedes
Modalidad: Representante + equipo
Materiales: Tarjetas de canciones
Dinámica: Tararear sin palabras; equipo adivina.
Puntuación propuesta: 100 puntos por acierto.
Privacidad: Secreto: solo conductor/actor.
5. La torre traicionera
Modalidad: Representante
Materiales: 6 vasos por equipo
Dinámica: Construir pirámide con una mano.
Puntuación propuesta: 100/75/50/25 según posición; desempate por vasos.
Privacidad: Información pública, salvo contenido de tarjetas ocultas.
6. La caja misteriosa
Modalidad: Representante
Materiales: Caja opaca, objetos seguros
Dinámica: Identificar objeto por tacto.
Puntuación propuesta: 100 puntos por acierto.
Privacidad: Secreto: solo conductor/actor.
7. Rebote imposible
Modalidad: Representante
Materiales: Pelota ping-pong, vasos
Dinámica: Rebotar pelota para introducirla en vaso.
Puntuación propuesta: 100/75/50/25 por aciertos.
Privacidad: Información pública, salvo contenido de tarjetas ocultas.
8. Manos de mantequilla
Modalidad: Representante
Materiales: Guantes de cocina, caja, papel, cinta
Dinámica: Envolver una caja con guantes grandes.
Puntuación propuesta: 100/75/50/25 por resultado.
Privacidad: Información pública, salvo contenido de tarjetas ocultas.
9. El actor dramático
Modalidad: Representante + equipo
Materiales: Tarjetas secretas
Dinámica: Actuar frase secreta sin hablar.
Puntuación propuesta: 100 puntos por acierto.
Privacidad: Secreto: solo conductor/actor.
10. La pelota rebelde
Modalidad: Representante
Materiales: Pelota suave, cinta para marcar objetivo
Dinámica: Deslizar pelota hasta zona marcada, desde silla si se desea.
Puntuación propuesta: 100/75/50/25 por cercanía.
Privacidad: Información pública, salvo contenido de tarjetas ocultas.
11. ¿Cuántos hay?
Modalidad: Representante
Materiales: Recipiente transparente, objetos
Dinámica: Estimar cantidad de objetos.
Puntuación propuesta: 100/75/50/25 por cercanía.
Privacidad: Información pública, salvo contenido de tarjetas ocultas.
12. El regalo sorpresa
Modalidad: Equipo
Materiales: Paquetes y tarjetas
Dinámica: Elegir un paquete con recompensa o sorpresa.
Puntuación propuesta: Según tarjeta, con límites establecidos.
Privacidad: Información pública, salvo contenido de tarjetas ocultas.
Criterios de aceptación
El sorteo distribuye exactamente 17 personas en cuatro equipos, sin duplicados.
Los 12 retos se pueden sortear sin repetición y marcar como completados.
El público jamás ve la frase de actuación ni otras pistas privadas.
Se puede pausar el tiempo y revertir puntos por error.
Tras recargar, la sesión se recupera.
El programa funciona sin Internet en una laptop conectada a TV.
Se puede consultar una lista imprimible de materiales consolidada.
Entregables de Codex
Aplicación ejecutable localmente con instrucciones README.
Datos de juegos editables en JSON.
Pruebas de sorteo, puntuación, recuperación y privacidad.
Guía del conductor y lista de materiales imprimible.
Sincronización móvil-conductor opcional como fase 2, no prometerla en MVP.
Pendientes por decidir
Nombres de participantes y criterios de bombos.
Puntuación definitiva por reto y tratamiento de empates.
Presupuesto y premios específicos.
Si el conductor tendrá laptop propia o solo la pantalla pública.
Si la música/sonidos se activan o no.
