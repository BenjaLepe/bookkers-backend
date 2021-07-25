async function updateBook(ctx, book) {
  const newData = {
    name: ctx.request.body.name,
    ISBN: ctx.request.body.ISBN,
    editorial: ctx.request.body.editorial,
    pages_number: ctx.request.body.pages_number,
    author: ctx.request.body.author,
    genre: ctx.request.body.genre,
    image: ctx.request.body.image,
  };

  await ctx.orm.Book.update(
    newData,
    {
      where: {
        id: book.id,
      },
    },
  );
}

module.exports = updateBook;
