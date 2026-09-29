import config from './config';

describe('application configuration', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalNodeEnv === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it('should_disable_swagger_when_running_in_production', () => {
    process.env.NODE_ENV = 'production';

    expect(config().swagger.enabled).toBe(false);
  });

  it('should_enable_swagger_when_running_locally', () => {
    process.env.NODE_ENV = 'development';

    expect(config().swagger.enabled).toBe(true);
  });
});
