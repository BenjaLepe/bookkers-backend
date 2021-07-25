async function updateUser(ctx, user) {
  const newData = {
    username: ctx.request.body.username,
    profile_picture: ctx.request.body.profile_picture,
    first_name: ctx.request.body.first_name,
    last_name: ctx.request.body.last_name,
    description: ctx.request.body.description,
    email: ctx.request.body.email,
    password: ctx.request.body.password,
  };
  // si el password no fue seteado
  // if (ctx.request.body.password) {
  //   newData.password = await ctx.request.body.password;
  // }
  await ctx.orm.User.update(
    newData,
    {
      where: {
        id: user.id,
      },
      individualHooks: true,
    },
  );
}

async function cmpPasswordsEdit(ctx) {
  const psw = await ctx.request.body.password;
  const psw2 = await ctx.request.body.confirm_password;

  if (!psw2 || psw !== psw2) {
    ctx.throw(400, 'New password and confirmation are not the same');
  }
}

module.exports = {
  updateUser,
  cmpPasswordsEdit,
};
