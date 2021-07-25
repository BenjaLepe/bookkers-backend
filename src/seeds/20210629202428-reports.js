module.exports = {
  up: async (queryInterface) => {
    // Reset incremental counter for primary key
    const existingInstances = await queryInterface.sequelize.query('SELECT COUNT(*) FROM "Reports"');
    await queryInterface
      .sequelize
      .query(`ALTER SEQUENCE "Reports_id_seq" RESTART WITH ${existingInstances[0][0].count + 1}`);

    const reviewIds = [];
    const reportsToInsert = [];

    for (let i = 1; i < 35; i += 1) {
      reviewIds.push(i);
    }
    function shuffleArray(array) {
      const buffer = array;
      for (let i = buffer.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [buffer[i], buffer[j]] = [buffer[j], buffer[i]];
      }
      return buffer;
    }
    const reportedReviewIds = shuffleArray(reviewIds);
    for (let i = 1; i <= 11; i += 1) {
      reportsToInsert.push({
        UserId: i,
        ReviewId: reportedReviewIds[2 * i - 2],
        comment: 'Horrible review',
        updatedAt: new Date(),
        createdAt: new Date(),
      });
      reportsToInsert.push({
        UserId: i,
        ReviewId: reportedReviewIds[2 * i - 1],
        comment: 'Copy and pasted from google first result',
        updatedAt: new Date(),
        createdAt: new Date(),
      });
    }
    await queryInterface.bulkInsert('Reports', reportsToInsert, {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Reports', null, {});
  },
};
