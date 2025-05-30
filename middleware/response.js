// 统一响应处理中间件
export default async function responseHandler(ctx, next) {
  try {
    ctx.success = (data) => {
      ctx.body = {
        code: 200,
        data: typeof data === 'string' ? null : data,
        message: typeof data === 'string' ? data : 'success'
      };
    }

    ctx.error = (message) => {
      ctx.body = {
        code: 400,
        data: null,
        message: message
      };
    }

    ctx.fail = (message) => {
      ctx.body = {
        code: 400,
        data: null,
        message: message
      };
    }
  } catch (err) {
    // 错误处理
    ctx.body = {
      code: 400,
      message: err.message || 'Internal Server Error',
      data: null
    };

    // 输出错误日志
    console.error('Error:', err);
  }
  await next();
} 