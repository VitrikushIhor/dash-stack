/* eslint-disable */
export default async () => {
  const t = {};
  return {
    '@nestjs/swagger/plugin': {
      models: [
        [
          import('./common/pagination/pagination.dto'),
          {
            PaginationDto: {
              page: {
                required: false,
                type: () => Number,
                default: 1,
                minimum: 1,
              },
              perPage: {
                required: false,
                type: () => Number,
                default: 10,
                minimum: 1,
                maximum: 100,
              },
            },
          },
        ],
      ],
      controllers: [
        [
          import('./app.controller'),
          {
            AppController: {
              getHello: { type: String },
              helloWorld: { type: String },
            },
          },
        ],
        [
          import('./health/health.controller'),
          { HealthController: { check: { type: Object } } },
        ],
        [
          import('./auth/auth.controller'),
          {
            AuthController: {
              signup: {},
              login: {},
              refreshToken: { type: Object },
              me: { type: Object },
            },
          },
        ],
        [
          import('./users/users.controller'),
          { UsersController: { me: {}, updateUser: {}, changePassword: {} } },
        ],
      ],
    },
  };
};
