function pages(page, countRowsTuple) {
  let pageCount;
  let pageStart = 0;
  let pageItems;
  const pageSize = 8;
  const { count, rows } = countRowsTuple;
  const totalPages = Math.ceil(count / pageSize);
  const sanitizedPage = page >= 0 ? page : 0;

  if (!sanitizedPage) {
    pageCount = count < pageSize ? count : pageSize;
    pageItems = rows.slice(pageStart, pageCount);
  } else {
    if ((sanitizedPage - 1) * pageSize > count) {
      pageStart = Math.floor(count / pageSize) * pageSize;
    } else {
      pageStart = (sanitizedPage - 1) * pageSize;
    }
    pageCount = count < (sanitizedPage * pageSize) ? count : (sanitizedPage * pageSize);
    pageItems = rows.slice(pageStart, pageCount);
  }
  return { totalPages, pageItems };
}

module.exports = pages;
