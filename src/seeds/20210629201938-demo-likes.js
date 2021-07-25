module.exports = {
  up: async (queryInterface) => {
    const reviewIds = [];
    const likesToInsert = [];

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

    for (let i = 1; i <= 11; i += 1) {
      const likedReviewIds = shuffleArray(reviewIds);

      for (let j = 0; j <= 15; j += 1) {
        likesToInsert.push({
          UserId: i,
          ReviewId: likedReviewIds[j],
          updatedAt: new Date(),
          createdAt: new Date(),
        });
      }
    }
    await queryInterface.bulkInsert('Likes', likesToInsert, {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('Likes', null, {});
  },
};
