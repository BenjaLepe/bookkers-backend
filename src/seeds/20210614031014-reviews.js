module.exports = {
  up: async (queryInterface) => {
    // Reset incremental counter for primary key
    const existingInstances = await queryInterface.sequelize.query('SELECT COUNT(*) FROM "Reviews"');
    await queryInterface
      .sequelize
      .query(`ALTER SEQUENCE "Reviews_id_seq" RESTART WITH ${existingInstances[0][0].count + 1}`);
    const reviews = [
      {
        title: 'Reseña de 1984',
        UserId: 1,
        BookId: 1,
        body: 'Orwell effectively explores the themes of mass media control, government surveillance, totalitarianism and how a dictator can manipulate and control history, thoughts, and lives in such a way that no one can escape it. ',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        title: 'Reseña de 100 años de soledad',
        UserId: 2,
        BookId: 2,
        body: 'Para mí, la grandeza de la novela reside en la descripción vital de los personajes. El autor va rellenando hojas y más hojas, relatando las extravagancias de cada uno de ellos, y es su día a día lo que hace que la novela funcione.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // jessi a 100 años
        title: 'El Don Quijote de Sudamerica!',
        UserId: 5,
        BookId: 2,
        body: 'Me encanta! Fue un poco dificil al principio de seguir los personajes con el mismo nombre pero sobre todo es muy interesante como la novela se desarrolla, me gusta la creatividad y estilo de Garcia Marquez y es chistoso, comedia latina.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // elton a 100 años
        title: 'Múltiples dimensiones, apreciada por miles.',
        UserId: 6,
        BookId: 2,
        body: 'Desde la fundación de Macondo hasta el ventarrón que se lo lleva, pasan cien años. Hijos e hijas nacen, encuentran amor o se pierden por amor, caen poseídos por la obsesión o atormentados por su fortuna de pertenecer a la familia Buendía.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // jessi a 100 años
        title: 'El Don Quijote de Sudamerica!',
        UserId: 5,
        BookId: 2,
        body: 'Aun no acabo de leer toda la novela pero quiero commentar que la recomiendo mucho. Me recuerdo de todos mis viajes a sudamerica mientras leo la historia de cien anos de soledad.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // elton a 100 años
        title: 'Múltiples dimensiones, apreciada por miles.',
        UserId: 6,
        BookId: 2,
        body: 'Los personajes son parte de un ambiente milagroso que representa su realidad cultural y emocional, y los dramas se desarrollan con un trasfondo que refleja la explotación de un pueblo latinoamericano.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // antonio a 100 años
        title: 'A master piece',
        UserId: 7,
        BookId: 2,
        body: 'Marquez crate a chain of events that make the reader willing to read a little more so that you dont feel the pages flow under your fingers but it makes you feel the story like we were watching a movie printed on pages.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // antonio a 100 años
        title: 'A master piece',
        UserId: 7,
        BookId: 2,
        body: 'The author dedicate profound description even to the characters that dont play a main role, making them part of the whole picture, without whom it would not look so great.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // joe a 100 años
        title: 'Great book in the Original Spanish.',
        UserId: 8,
        BookId: 2,
        body: 'This a great and famous book in the original Spanish giving one the way the author thought. So, I am looking forward to reading it.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // joe a 100 años
        title: 'Great book in the Original Spanish.',
        UserId: 8,
        BookId: 2,
        body: 'One will need a separate translation helper if you are less than fluent. Still it gives you the meaning of words in Spanish which adds to the educational experience and enjoyment.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // hector a 100 años
        title: 'Este es por mucho el mejor libro que he leído part 1',
        UserId: 9,
        BookId: 2,
        body: 'Este es por mucho el mejor libro que he leído hasta ahora. Es una obra maestra de la literatura de verdad rica en vocabulario pero sobre todo rica en fantasías.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // hector a 100 años
        title: 'Este es por mucho el mejor libro que he leído part 2',
        UserId: 9,
        BookId: 2,
        body: 'Es increíble como Gabriel García Márquez tenía toda la historia bajo control, como si solo estuviera escribiendo algo que siempre estuvo en su mente.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // cesar a 100 años
        title: 'Un clásico (1/2)',
        UserId: 10,
        BookId: 2,
        body: 'Hay que entenderlo como que cada capítulo es un cuento, y dejar de preocuparse de hacer el árbol genealógico de los Buendía.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // cesar a 100 años
        title: 'Un clásico (2/2)',
        UserId: 10,
        BookId: 2,
        body: 'Me imagino el dolor de cabeza para quienes lo han traducido a otros idiomas por el folclorismo de varias palabras y expresiones.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // dita a 100 años
        title: 'My favorite novel (part 1 of 2)',
        UserId: 11,
        BookId: 2,
        body: 'If there were more stars, I would give this book more. Garcia Marquez s writing is just exquisite -- just study the opening paragraphs of this book.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // dita a 100 años
        title: 'My favorite novel (part 2 of 2)',
        UserId: 11,
        BookId: 2,
        body: 'The author captures the atmosphere of this Caribbean part of Colombia masterfully using his magic realism style.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // joe a 1984
        title: 'A Message To Young Readers Who Have Been Assigned This Book, part 1 of 2',
        UserId: 8,
        BookId: 1,
        body: 'This is one of the first books I have read more than once. I first read "1984" in 1985 and now for the second time in 2018. The book has remained the same, but both the world and I have not. ',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // joe a 1984
        title: 'A Message To Young Readers Who Have Been Assigned This Book, part 2 of 2',
        UserId: 8,
        BookId: 1,
        body: 'I cannot begin to convey how genuinely frightening this book is. I am a lover of popular science fiction and am astounded by Orwells ability to be compelling, entertaining and engrossing .',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // joe a Paula
        title: 'I fell in love with Isabel Allende.',
        UserId: 8,
        BookId: 3,
        body: 'A letter that becomes a book, Paula is rich, powerful, and so complete. Filled with so many beautiful adjectives, nouns, and pronouns that are the back bone to the Spanish language.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // joe a Paula
        title: 'I fell in love with Isabel Allende again after re-reading Paula.',
        UserId: 8,
        BookId: 3,
        body: 'In my own personal journey, life has placed me in English and French speaking lands, and when I read Isabel Allendes works, I return to that powerful and fertile universe of the Spanish language.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // joe a cronicas marcianas
        title: 'Sadly Outdated, maybe...',
        UserId: 8,
        BookId: 5,
        body: 'One of my favorite books as a kid. Great story, great writing, but as an adult, I realized that the characters were childish, selfish, and racist.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // jessi a cronicas marcianas
        title: 'Excellent and scary!',
        UserId: 5,
        BookId: 5,
        body: 'Painfully predictive! Describes the future in an uncanny way. Great stories!',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // antonio a cronicas marcianas
        title: 'The Martian Disappointment',
        UserId: 7,
        BookId: 5,
        body: 'I expected a story not a review and a confused one at that. When is the next rocket due to fly to Mars?',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // dita a cronicas marcianas
        title: 'The ghosts of Mars',
        UserId: 11,
        BookId: 5,
        body: 'Mix of great and middling. An essential classic, though.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // joe a fahrenheit 451
        title: 'Numerous text errors in this print edition.',
        UserId: 8,
        BookId: 6,
        body: 'I found two errors by the time I reached page 53, and only because they are glaringly obvious.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // dita a fahrenheit 451
        title: 'There must be something in books, something we can’t imagine, to make a woman stay in a burning house',
        UserId: 8,
        BookId: 6,
        body: 'It was a pleasure to burn. Its such a famous opening line and despite the fact that Id never read Fahrenheit 451, one I ve seemed to know for the longest time',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // joe a mitos de cthulhu
        title: 'Nothing beats a classic',
        UserId: 8,
        BookId: 8,
        body: 'Your mind conjures things in the water afraid of what may lie beneath, the sharks never felt more terrifying.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // antonio a mitos de cthulhu
        title: 'Lovecraft lovers need',
        UserId: 7,
        BookId: 8,
        body: 'A beautiful edition of H.P Lovecrafts works. It contains some of my favorite lovecraftian tales and the cover full of quotes is wonderful perfect for any lovecraft fan.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // javi a narraciones extraordinarias
        title: 'Una lectura obligada',
        UserId: 3,
        BookId: 7,
        body: 'Hermoso libro, lo recomiendo.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // jessi a narraciones extraordinarias
        title: 'Narraciones Extraordinarias!!',
        UserId: 3,
        BookId: 7,
        body: 'Narraciones Extraordinarias del Maestro del relato del terror, Edgar Allan Poe. Espeluznantes relatos, una imaginación fabulosa que nos brinda en evasión sobrenatural en lo cotidiano.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // joe a narraciones extraordinarias
        title: 'Nada extraordinarias estas narraciones',
        UserId: 8,
        BookId: 7,
        body: 'Son narraciones para un público adolescente. Cuando se tiene el gusto por las historias de misterio, miedo o terror. Pero ya en la época actual, casi doscientos años después, sus cuentos quedaron bastante obsoletos.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // joe a quijote
        title: 'Thrift edition is easily readable',
        UserId: 8,
        BookId: 4,
        body: ' Very easy to read and hold in the hand(s), unlike some of the other low-cost publishers on the market. Print is fine.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // antonio a quijote
        title: 'Terrible Translation- Waste of $',
        UserId: 7,
        BookId: 4,
        body: 'Be warned; this is a translation from 1755 and the English is NOT an easy or enjoyable read. 942 pages because many footnotes needed to understand it.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        // jose a quijote
        title: 'The great Cervantes',
        UserId: 2,
        BookId: 4,
        body: 'An excellent example of irony in literature -- one of the best in my judgment. Still, it is a long and somewhat disjointed work that cries out for an editor.',
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert('Reviews', reviews, {});
  },

  down: async (queryInterface) => {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('Reviews', null, {});
  },
};
