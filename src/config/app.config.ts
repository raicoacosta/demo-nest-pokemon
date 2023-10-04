export const EnvConfiguration = () => ({
  enviroment: process.env.NODE_ENV || 'dev',
  mongodb: process.env.MONGODB,
  port: process.env.PORT || 3000,
  paginationLimit: process.env.PAGINATION_LIMIT || 10,
  paginationOffset: process.env.PAGINATION_OFFSET || 1,
});
