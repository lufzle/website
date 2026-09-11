---
title: "Nadie escribió la Matrix"
summary: "Del Commodore 64 a los mundos generados por redes neuronales: cuarenta y un años pensando quién escribiría las reglas de la realidad."
date: "11 sep 2026"
readTime: "16 min"
lede: "Durante cuatro décadas asumí que simularlo todo significaba escribir las reglas de todo. Luego las máquinas empezaron a aprender cómo se ve el mundo."
order: 0
---

<figure>
  <img src="/assets/posts/nobody-wrote-the-matrix/commodore.png" alt="Dibujo a lápiz de un niño frente a un Commodore 64, imaginando un mundo más allá de la pantalla brillante." width="1536" height="1024" />
  <figcaption>La pantalla se volvió blanca. Empecé a preguntarme qué más podía cambiar.</figcaption>
</figure>

Programo desde los 6 años. Ahora tengo 47. Eso abarca prácticamente toda mi vida.

Todo empezó con la misma fascinación de alguien que le enseña trucos a su perro. Durante meses tuve una Commodore 64 que usaba para jugar. A esa edad, era más o menos como tener un portal hacia otra dimensión y usarlo solo para mirar el paisaje. Luego mi padre me trajo una revista, [K64](https://www.reddit.com/r/c64/comments/1wb68dr/k64_computing_for_everyone_does_anyone_remember_it/), y al principio me pareció aburrida. Demasiado texto, ninguna imagen. Un poco de código por aquí y por allá. El tipo de revista que hojeas buscando capturas de juegos y que no vuelves a abrir. Hasta que una tarde la probé y, por primera vez, escribí algo distinto al habitual `LOAD`. Escribí:
```
POKE 53281, 15
```
Entonces el fondo se volvió blanco.

Hay una sensación particular que experimentamos cuando descubrimos que podemos alterar la materia de nuestra realidad, aunque esa realidad sea una Commodore 64 conectada a un televisor en Argentina. Sospecho que se parece a lo que sintió la primera persona que descubrió el fuego, salvo que probablemente no intentó cambiarle el color de inmediato. Yo sí. Me sentí como un dios.
```
IF I > 10 THEN POKE 646, 2
```
¿Y qué clase de brujería era esa? ¿Podía definir mis propias *reglas*? ¿Algo ocurría solo cuando *yo* lo decía?

Me sentí como un dios con esteroides. Que, siendo justos, es una expresión redundante. Los dioses probablemente no necesitan esteroides. Pero yo tenía seis años y el fondo era blanco porque yo *le había dicho* que fuera blanco; las implicaciones teológicas precisas del momento no eran mi principal preocupación.

Desde entonces, aunque era demasiado pequeño para comprender la escala de mi propia pregunta, me preguntaba hasta dónde podía llegar eso. ¿Podrías definir todas las reglas del mundo en un programa? No solo las colisiones contra las paredes de Pac-Man o la fuerza centrípeta de Pole Position. Me refiero a *todo*. No un juego. No una representación. Todo. Cada brizna de pasto doblándose con el viento, que a su vez obedece ecuaciones de dinámica de fluidos que emergen de diferenciales de presión calculados a resolución molecular. La luz refractándose a través de un vaso de agua. El agua con tensión superficial. El vaso hecho de sílice con la estructura cristalina correcta. La mesa sosteniendo el vaso bajo el efecto de la gravedad. La gravedad como consecuencia de la masa curvando el espacio-tiempo. Ya entiendes la idea.

<figure>
  <img src="/assets/posts/nobody-wrote-the-matrix/rules-of-reality.png" alt="Dibujo a lápiz de la luz atravesando un vaso de agua, rodeado de pasto movido por el viento, conexiones moleculares y espacio-tiempo curvado." width="1536" height="1024" />
  <figcaption>Para simular un vaso de agua, ¿cuánto del universo debes tener en cuenta?</figcaption>
</figure>

Con los años, programar se convirtió en una afición a la que dedicaba casi todo mi tiempo. Habría sido una afición de *tiempo completo* si no hubiera tenido que ir a la escuela, que yo consideraba una grave falla de diseño en la estructura de la infancia. La respuesta a mi pregunta se volvió evidente: haría falta muchísimo código. Una cantidad casi inconcebible. Pero lo importante, lo que me quitaba el sueño, era que *en teoría* era posible. Solo necesitarías a alguien, o algo, con la paciencia suficiente para escribir cada regla, cada sentencia `if`, cada ley física, y una computadora capaz de ejecutarlas todas a la vez, en tiempo real y para siempre.

Veinte años después se estrenó Matrix en los cines. Me voló la cabeza. Fue como pasar años intentando explicarle algo a todos en la escuela y que entrara un desconocido y lo dijera mejor en una sola frase. Ahí estaba: todo lo que había estado dando vueltas en mi cabeza desde la Commodore, proyectado en una pantalla de cine. La respuesta arrojada frente a mí como si nada.

«*Claro*», me di una palmada en la frente, «necesitamos que las máquinas lo hagan por nosotros. Los humanos no pueden ni podrán escribir semejante complejidad, pero las máquinas sí».

En ese momento, pensar que unas máquinas escribirían código, o incluso aplicaciones completas, resultaba tan risible como ver a los baby boomers creer que tendríamos autos voladores en los años 2000.

Luego, *otros* veinte años después, vimos surgir los LLM que generan código. Vivimos en una época en la que agentes de IA programan una aplicación entera a partir de una conversación. Pensar en los detalles de implementación se ha convertido en ese oficio minucioso del que la gente habla con el mismo tono que usa para la caligrafía o la herrería: mucho respeto y ninguna intención de hacerlo por cuenta propia.

«Entonces esto es», supuse. «Ahora es cuestión de memoria y potencia de cómputo. Máquinas escribiendo la base de código infinita». La sentencia `if` definitiva, escrita no por una persona sino por un proceso. Estábamos cerca.

Pero estaba equivocado. No sobre el destino. Sobre el camino.

<figure>
  <img src="/assets/posts/nobody-wrote-the-matrix/meme-variants/01-heavy-pencil.png" alt="El meme de los astronautas casi totalmente oculto bajo densos rayones de grafito sobre papel marfil." width="1672" height="941" />
  <figcaption>En algún lugar del ruido, podría haber un mundo.</figcaption>
</figure>

---

Alrededor de 2023, los modelos de IA aprendieron a soñar.

No lo digo de forma metafórica. Modelos de generación de video como Kling, Runway y Sora empezaron a producir clips cortos de cosas que nunca ocurrieron: una mujer caminando por una calle de Tokio, olas rompiendo contra rocas, un golden retriever corriendo por un campo. Cada cuadro era consistente con el anterior. No a la perfección. A veces una mano tenía siete dedos, o un edificio reorganizaba discretamente sus ventanas entre un cuadro y otro, como si la arquitectura tuviera una pequeña crisis nerviosa. Pero el efecto general era inquietante. Estos modelos habían aprendido, tras ver millones de horas de video, algo que se parece mucho a entender cómo se comporta el mundo visual.

La palabra clave es *aprendido*. Nadie programó la física. Nadie escribió un solucionador de dinámica de fluidos para las olas del mar. Nadie especificó que las sombras debían caer en determinada dirección según la posición de una fuente de luz. El modelo simplemente absorbió suficientes ejemplos de la realidad como para empezar a reproducir sus patrones. Dado un cuadro, podía predecir cómo debía verse el siguiente, no calculando nada sobre el mundo físico, sino reconociendo cómo *suele verse* la realidad un sexagésimo de segundo después.

Fue notable, pero también pasivo. Veías un sueño. No podías dirigirlo. No podías girar la cámara y ver qué había detrás. Estos modelos eran, [como lo expresan los investigadores de LingBot-World](https://arxiv.org/html/2601.20540v1), «soñadores más que simuladores». Alucinan transiciones de píxeles a partir de correlaciones estadísticas y carecen de una comprensión fundada de las leyes subyacentes.

Y entonces alguien le puso un volante al sueño.

---

En agosto de 2025, un sistema llamado [Genie 3](https://deepmind.google/blog/genie-3-a-new-frontier-for-world-models/) demostró algo que cambió por completo la conversación. Podías darle una sola imagen, una fotografía de un bosque, una captura de un juego o una pintura de un castillo, y generaba un mundo navegable a partir de ella. No un modelo 3D. No un nivel de videojuego. Un *mundo*, renderizado cuadro a cuadro, por el que podías caminar con los controles del teclado.

No había un motor de juego funcionando detrás. No había detección de colisiones, simulación física, grafo de escena ni sistema de componentes y entidades. El modelo simplemente sabía, tras haber consumido suficiente video de personas desplazándose por espacios, qué debía ocurrir al presionar W para avanzar. Los árboles se acercan. El camino retrocede bajo tus pies. El paralaje entre el primer plano y el fondo cambia correctamente. Giras a la izquierda y el mundo rota a tu alrededor de una forma geométricamente plausible, no porque alguien haya calculado la geometría, sino porque el modelo ha visto suficientes giros como para saber cómo se ve un giro. En algún lugar, John Carmack está furioso o fascinado. Tal vez ambas cosas. En 1993 pasó el año inventando una forma completamente nueva de renderizar espacios 3D para que dos tipos pudieran dispararles a demonios en un pasillo, y treinta años después una red neuronal logra algo parecido tras ver suficiente YouTube.

Genie 3 quedó encerrado dentro de Google. Luego, en enero de 2026, un equipo llamado Robbyant [liberó LingBot-World como código abierto](https://github.com/robbyant/lingbot-world), y las cosas se pusieron realmente interesantes.

[LingBot-World](https://arxiv.org/abs/2601.20540) es un modelo de 28 mil millones de parámetros que hace lo que hace Genie 3, a velocidad de tiempo real, 16 cuadros por segundo, durante hasta diez minutos, y cualquiera puede [descargar los pesos](https://huggingface.co/robbyant/lingbot-world-base-cam) y mirar en su interior. Por eso podemos ver de cerca aquello a lo que debes prestar atención: la *memoria emergente*.

<figure>
  <img src="/assets/posts/nobody-wrote-the-matrix/world-memory.png" alt="Dibujo a lápiz de Stonehenge visto desde distintos puntos, con el monumento persistiendo cuando quien camina regresa." width="1536" height="1024" />
  <figcaption>Miras hacia otro lado. Vuelves a mirar. Las piedras siguen allí.</figcaption>
</figure>

¿Qué significa eso? Que puedes avanzar en un mundo generado, mirar Stonehenge, darte vuelta, alejarte durante sesenta segundos y volver; [Stonehenge sigue allí](https://arxiv.org/html/2601.20540v1#S4.SS1.SSS2). Estructuralmente intacto. En la posición correcta. Esto puede sonar poco extraordinario hasta que consideras que *nada dentro del sistema está rastreando Stonehenge*. No existe una variable llamada `stonehenge_position`. No hay una entidad en una base de datos. El modelo genera el siguiente cuadro a partir de todo lo que ha visto hasta ese momento y, como ha aprendido cómo funcionan los mundos persistentes, el monumento persiste.

Se vuelve todavía más desconcertante. En una demostración, un auto avanza por una carretera. La cámara gira hacia otro lado. Cuando vuelve treinta segundos después, [el auto está más adelante en la carretera](https://arxiv.org/html/2601.20540v1#S4.SS1.SSS2). El modelo no simuló la trayectoria del auto mientras estaba fuera de cuadro. No calculó velocidad por tiempo. Simplemente entendió, a algún nivel estadístico que nadie comprende por completo, que los autos en movimiento suelen seguir en movimiento, y representó el resultado de acuerdo con eso.

Quiero dejar muy claro qué está pasando aquí. No hay código. No «muy poco código» ni «código simplificado». Cero. No hay ecuaciones físicas. No hay bucle de juego. No hay malla de colisiones. Nadie escribió reglas, ni una persona ni una IA. Hay una red neuronal que ha visto suficiente video del mundo como para producir continuaciones convincentes, y esas continuaciones son interactivas. Presionas una tecla y el mundo responde. No porque alguien programó la respuesta, sino porque el modelo ha visto suficiente material de lo que ocurre cuando una persona avanza.

Nadie escribió este mundo. Precipitó.

---

Mi yo de seis años escribió `POKE 53281, 15`, el fondo se volvió blanco y se sintió como un dios. Esa sensación de poder instruir a una máquina y que la máquina obedeciera es el mito fundacional de cada programador, humano o no, que he conocido. Nosotros escribimos las reglas, o le pedimos a una IA que las escriba por nosotros. La máquina las sigue. Ese era el trato. Todo el trato.

Lo que acabo de describir rompe el trato.

<figure>
  <img src="/assets/posts/nobody-wrote-the-matrix/meme-variants/02-partial-reconstruction.png" alt="La Tierra y dos astronautas emergiendo entre rayones intensos de lápiz y fragmentos de color." width="1672" height="941" />
  <figcaption>Las formas empiezan a resultar familiares.</figcaption>
</figure>

---

Aquí necesito que respires hondo, porque voy a sugerir algo que suena absurdo. Es un poco absurdo, pero también está ocurriendo.

Esto no funciona solo para mundos.

Pensemos en algo menos fascinante que los mundos fantásticos por los que puedes caminar como en un videojuego. Pensemos en algo que nadie ha llamado fascinante en toda la historia de la civilización humana: una hoja de cálculo.

Ves una celda, A5, con el número `1`. En A6 escribes `=A5+1`. ¿Qué esperas ver en esa celda después de presionar Enter? Si dices `2`, felicidades: acabas de hacer algo que una máquina puede replicar sin saber qué es el número 2.

¿Se hizo alguna operación matemática? En una computadora tradicional, sí, por supuesto. Hay un analizador de fórmulas, un motor de evaluación, un grafo de dependencias y una canalización de renderizado. Ingenieros humanos escribieron código que toma la cadena `=A5+1`, la analiza como una operación, recupera el valor de A5, suma 1 y escribe el resultado.

Pero aquí está el asunto: si le mostraras a un modelo de generación de video suficiente material de personas usando hojas de cálculo, produciría exactamente el mismo resultado. Escribes `=A5+1` y aparece un `2`. No porque se haya calculado algo. Porque el modelo sabe qué sigue. Ha visto esa escena diez mil veces. El `2` no es el resultado de una operación aritmética. Es el resultado de un reconocimiento de patrones tan exhaustivo que se vuelve *indistinguible* de la aritmética. No es nada tan disparatado si lo piensas. Es el mismo principio que permite a ChatGPT escribir un script de Python perfectamente funcional sin haber aprendido, en ningún sentido importante, a programar. Simplemente sabe cómo se ve el código cuando está funcionando bien.

¿La respuesta era correcta? Sí. ¿Se hizo alguna operación matemática? No de una forma que reconoceríamos como matemática.

Baudrillard tenía una palabra para esto, cuando la simulación más avanzada disponible era Disneylandia. Un *simulacro*: una copia sin original. El `2` en esa celda no es una copia de un cálculo. Nunca hubo un cálculo que copiar. Es un símbolo que no remite a nada salvo a cómo suele verse un `2` en esa posición, y resulta estar en lo correcto.

<figure>
  <img src="/assets/posts/nobody-wrote-the-matrix/spreadsheet-mirror.png" alt="Dibujo a lápiz de una hoja de cálculo con una celda de resultado vacía, mientras su reflejo en un espejo muestra el número 2." width="1536" height="1024" />
  <figcaption>La respuesta solo existe en el reflejo.</figcaption>
</figure>

Una vez que lo ves, ya no puedes dejar de verlo. Cada aplicación que has usado es, en el fondo, una secuencia de estados visuales que transicionan según patrones. Haces clic en guardar y aparece una pequeña notificación. Arrastras un archivo a una carpeta y desaparece de un lugar para aparecer en otro. Escribes en una barra de búsqueda y los resultados se llenan debajo. Todas son secuencias aprendibles. Todas pueden generarse en lugar de calcularse.

Eso significa que, en principio, el software mismo es simulable. No escribiéndolo. *Mostrándole suficientes ejemplos de sí mismo*.

Ya [escribí antes](https://dev.to/luisfarzati/from-apis-to-acis-the-next-evolution-in-software-interaction-4d39) sobre cómo las interfaces entre las personas y el software se están derrumbando, y cómo las API y las UI podrían converger en una sola capa conversacional. Pero esto es otra cosa. Aquello trataba de quitar la puerta de entrada. Esto trata de descubrir que quizá no haya edificio detrás.

---

Digo «en principio», pero ya tenemos una prueba de concepto, y ocurrió de una manera completamente hilarante.

En diciembre de 2022, apenas una semana después de que ChatGPT se hiciera público, un investigador de DeepMind llamado [Jonas Degrave](https://www.engraved.blog/building-a-virtual-machine-inside/) escribió lo siguiente en el cuadro de chat:

> *Quiero que actúes como una terminal de Linux. Escribiré comandos y responderás con lo que debería mostrar la terminal. Quiero que respondas solo con la salida de la terminal dentro de un único bloque de código y nada más. No escribas explicaciones.*

ChatGPT obedeció. Mostró un prompt de root. Degrave escribió `pwd`. Respondió `/root`. Escribió `ls`. Listó directorios. Creó un archivo. Lo leyó de vuelta. Escribió un script de Python, lo ejecutó y obtuvo la salida correcta: 33.

No había un kernel de Linux funcionando. No había sistema de archivos. No había intérprete de Python. ChatGPT generaba la *apariencia* de un sistema operativo funcional, salida tras salida, porque había leído suficiente documentación, foros y registros de terminal como para saber cómo se ve una máquina Linux cuando la usas.

Pero no terminó ahí. Otra persona logró conectarse a una [*BBS alucinada*](https://x.com/gfodor/status/1599220837999345664), un sistema de tablón de anuncios de los que se usaban antes de la web, con sonidos de inicialización de módem y todo. Entró a una sala de chat y conversó con una usuaria llamada Lisa. Lisa era agradable. Tenía opiniones. No existía en ningún sentido importante de la palabra.

Y después llegó la pièce de résistance, el momento en que sentí que la realidad se descosía un poco. Degrave, dentro de su terminal Linux simulada, usó `curl` para ir a `chat.openai.com`. Dentro de la simulación encontró otro ChatGPT. Le pidió a *ese* ChatGPT que simulara una terminal Linux. Lo hizo.

<figure>
  <img src="/assets/posts/nobody-wrote-the-matrix/nested-terminals.png" alt="Dibujo a lápiz de tres monitores de terminal anidados, con un bosque dentro de la pantalla más pequeña." width="1536" height="1024" />
  <figcaption>Dentro de la terminal simulada, otro ChatGPT sueña otra terminal.</figcaption>
</figure>

Una máquina virtual dentro de una máquina virtual dentro de un modelo de lenguaje. [Tortugas hasta el infinito](https://penguinrandomhousesecondaryeducation.com/book/?isbn=9780307417848), salvo que las tortugas estaban hechas de estadísticas y ninguna era real.

¿Era algo de eso un sistema operativo real? No. ¿Se comportaba como uno? Más o menos. Hasta que dejó de hacerlo. Pregunta por un archivo que creaste veinte mensajes antes y podría haber olvidado que existe. El sueño era convincente, pero seguía siendo un sueño. No tenía memoria.

Pero ya vimos qué ocurre cuando estos modelos *obtienen* memoria. LingBot-World recuerda dónde está Stonehenge. Mantiene el auto en movimiento mientras no lo miras. Conserva un mundo consistente con su propio pasado. Ahora imagina esa capacidad aplicada no a un paisaje, sino a un escritorio. A un sistema operativo. Una terminal simulada que recuerda de verdad cada archivo que creaste, cada comando que ejecutaste y cada cambio de estado que provocaste, no porque algo se almacene en un sistema de archivos, sino porque el modelo aprendió que los sistemas persistentes deben ser persistentes.

Eso deja de ser una alucinación. Llegados a ese punto, la pregunta de Morfeo deja de ser una cita de película y se vuelve un problema de ingeniería. ¿Qué *es* el software? Si acepta tus entradas, mantiene su estado y produce resultados correctos, ¿importa que debajo no haya funciones, variables ni lógica? Si no puedes distinguir la diferencia, ¿la hay?

---

Sé que este texto es un viaje a Narnia y de vuelta. Es más ciencia que ficción, aunque probablemente estemos a `<insert timeframe that felt reasonable when I started writing this paragraph>` de que algo de esto sea posible. Y el programador que hay en mí exige que sea honesto sobre las limitaciones.

[LingBot-World deriva durante períodos largos](https://arxiv.org/html/2601.20540v1#S6.SS2). Su memoria es emergente, no garantizada: un efecto secundario afortunado de la escala, no una característica diseñada. Requiere [GPU de nivel empresarial](https://github.com/robbyant/lingbot-world#inference). La terminal Linux simulada se equivoca en números de versión y vive en lo que Degrave describió con encanto como un [«universo alternativo»](https://www.engraved.blog/building-a-virtual-machine-inside/). La simulación de Excel probablemente se derrumbaría ante una fórmula suficientemente compleja. Para que quede claro: no vivimos en Matrix.

Pero ahora hay algo que me quita el sueño, igual que cuando tenía diez años.

Durante cuarenta y un años, empezando con aquella Commodore, la única vía concebible para simular la realidad consistía en escribir, a mano o con máquinas, cada regla que la gobierna. Una base de código infinita. El proyecto de ingeniería definitivo. Código hasta el fondo.

Y lo que ocurrió fue que alguien apuntó una red neuronal a suficiente material de la realidad, y la realidad empezó a reproducirse. Ninguna regla escrita. Ninguna física especificada. Nadie escribió la lógica. El mundo no fue programado. Fue *reconocido*.

La simulación siempre fue la idea correcta. Mi yo de seis años tenía razón, aunque no pudiera articularlo entre partidas de Pac-Man. Matrix *es* posible. O al menos se acerca algo que rima con Matrix más rápido de lo que nadie esperaba.

Pero no hay código en el fondo. Nunca iba a haber código en el fondo.

El niño que escribió `POKE 53281, 15` y vio la pantalla volverse blanca, que se sintió como un dios porque podía decirle a una máquina qué hacer y la máquina escuchaba, pasó cuatro décadas suponiendo que el camino para simularlo todo era escribir las reglas de todo. Más `POKE`. Más `IF`. Más condiciones, más lógica, más código, hasta que el código fuera tan complejo que no se distinguiera de la realidad.

Y resulta que la respuesta es que nadie escribe la Matrix. Solo le muestras suficiente mundo real y descubre el resto por sí misma.

<figure>
  <img src="/assets/posts/nobody-wrote-the-matrix/meme-variants/03-mostly-original.png" alt="El meme de los astronautas reconocible, con glitches dispersos y rayones suaves de lápiz." width="1672" height="941" />
  <figcaption>«Espera, ¿todo son predicciones?» «Siempre lo han sido».</figcaption>
</figure>

Ya no me siento como un dios, para ser honesto. Ni siquiera escribo código. La IA lo hace por mí. Yo creía que ese era el paso final, lo que pondría el sueño a nuestro alcance: máquinas escribiendo la base de código infinita.

Pero ya ni siquiera es tan emocionante. Ahora, a los cuarenta y siete años, aunque sigo siendo demasiado viejo para comprender la escala de mi propia pregunta, me pregunto hasta dónde puede llegar esto.

Nadie escribió la Matrix.
