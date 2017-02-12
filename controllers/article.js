exports.list = async (ctx, next) => {
    const {username} = ctx.state.user;
    ctx.body = {username};
};

exports.create = async (ctx, next) => {
    const {username} = ctx.state.user;
    ctx.body = {username};
};

exports.show = async (ctx, next) => {
    const {username} = ctx.state.user;
    ctx.body = {username};
};

exports.update = async (ctx, next) => {
    const {username} = ctx.state.user;
    ctx.body = {username};
};

exports.destroy = async (ctx, next) => {
    const {username} = ctx.state.user;
    ctx.body = {username};
};
